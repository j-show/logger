/**
 * @fileoverview 控制台日志记录器实现
 * @module logger/console
 * @description 提供基于浏览器/Node.js 控制台的日志记录器实现
 */

/* eslint-disable no-console */
import {
  betterLogColor,
  ColorHexDefault,
  isDarkColor,
  type LogColorStyle,
  makeColorHexFromText,
  wrapColorANSI,
  wrapColorCSS
} from '../color';
import {
  type CoreLoggerFactory,
  type LoggerContext,
  type LogLevel
} from '../types';
import { jsonStringifySafe } from '../utils';

/**
 * 根据内容生成颜色样式
 * @function makeContentStyle
 * @param {string} content - 内容文本
 * @returns {LogColorStyle} 颜色样式配置
 * @description 基于内容文本生成一个确定的颜色样式，包括背景色和前景色
 * @private
 */
const makeContentStyle = (content: string): LogColorStyle => {
  const majorColor = makeColorHexFromText(content);
  const enhancedMajorColor = betterLogColor(majorColor);

  return {
    backgroundColor: enhancedMajorColor,
    // 根据背景色明暗度选择合适的前景色（黑色或白色）
    contentColor: isDarkColor(enhancedMajorColor) ? [0, 0, 0] : [255, 255, 255]
  };
};

/**
 * 处理命名空间前缀的颜色块（Node.js 环境）
 * @function processColoringPrefixChunks_Node
 * @param {NonNullable<LoggerContext['namespace']>} namespace - 命名空间数组
 * @returns {string[]} 包含 ANSI 转义序列的字符串数组
 * @description 为 Node.js 环境生成带 ANSI 颜色的命名空间前缀
 * @private
 */
const processColoringPrefixChunks_Node = (
  namespace: NonNullable<LoggerContext['namespace']>
): string[] => {
  return [
    namespace.map(ns => wrapColorANSI(ns, makeContentStyle(ns))).join('/')
  ];
};

/**
 * 处理命名空间前缀的颜色块（浏览器环境）
 * @function processColoringPrefixChunks_Browser
 * @param {NonNullable<LoggerContext['namespace']>} namespace - 命名空间数组
 * @returns {string[]} 包含内容和样式的字符串数组，用于 console.log 的 %c 格式化
 * @description 为浏览器环境生成带 CSS 样式的命名空间前缀
 * @private
 */
const processColoringPrefixChunks_Browser = (
  namespace: NonNullable<LoggerContext['namespace']>
): string[] => {
  const { contents, styles } = namespace
    .map(ns => wrapColorCSS(ns, makeContentStyle(ns)))
    .reduce(
      (collection, [content, style]) => {
        collection.contents.push(content);
        collection.styles.push(style);
        return collection;
      },
      { contents: [] as string[], styles: [] as string[] }
    );

  return [contents.join('/'), ...styles];
};

/**
 * 处理命名空间前缀的颜色块（自动检测环境）
 * @function processColoringPrefixChunks
 * @param {NonNullable<LoggerContext['namespace']>} namespace - 命名空间数组
 * @returns {string[]} 处理后的字符串数组
 * @description 根据运行环境（Node.js 或浏览器）自动选择相应的颜色处理方式
 * @private
 */
let processColoringPrefixChunks = (
  namespace: NonNullable<LoggerContext['namespace']>
): string[] => {
  // 首次调用时根据环境选择处理函数
  processColoringPrefixChunks =
    typeof window === 'undefined'
      ? processColoringPrefixChunks_Node
      : processColoringPrefixChunks_Browser;

  return processColoringPrefixChunks(namespace);
};

const TYPEOF_SIMPLE_VALUE = [
  'string',
  'number',
  'bigint',
  'boolean',
  'undefined'
];

const processColoringLevelChunk_Node = (
  level: LogLevel,
  list: unknown[]
): unknown[] => {
  const contentStyle = {
    contentColor: ColorHexDefault[level]
  } as unknown as LogColorStyle;
  const result: unknown[] = [];

  for (const ns of list) {
    if (TYPEOF_SIMPLE_VALUE.includes(typeof ns) || ns == null) {
      result.push(wrapColorANSI(ns, contentStyle));
    } else {
      result.push(ns);
    }
  }

  return result;
};

const processColoringLevelChunk_Browser = (
  level: LogLevel,
  list: unknown[]
): unknown[] => {
  const contentStyle = {
    contentColor: ColorHexDefault[level]
  } as unknown as LogColorStyle;
  const contents: string[] = [];
  const styles: unknown[] = [];

  for (const ns of list) {
    if (TYPEOF_SIMPLE_VALUE.includes(typeof ns) && ns != null) {
      const item = wrapColorCSS(ns, contentStyle);
      contents.push(item[0]);
      styles.push(item[1]);
    } else {
      contents.push('%o');
      styles.push(ns);
    }
  }

  return [contents.join('  '), ...styles];
};

let processColoringLevelChunk = (
  level: LogLevel,
  contents: unknown[]
): unknown[] => {
  processColoringLevelChunk =
    typeof window === 'undefined'
      ? processColoringLevelChunk_Node
      : processColoringLevelChunk_Browser;

  return processColoringLevelChunk(level, contents);
};

/**
 * 控制台日志记录器工厂函数
 * @constant {CoreLoggerFactory<LoggerContext>} LoggerFactoryOfConsole
 * @description 创建基于控制台的日志记录器实例，支持文本和 JSON 两种格式
 * @example
 * const coreLogger = LoggerFactoryOfConsole();
 * coreLogger.print({ level: 'info', context }, 'Hello World');
 */
export const LoggerFactoryOfConsole: CoreLoggerFactory<LoggerContext> = () => ({
  /**
   * 打印日志的核心方法
   * @param {{ level: LogLevel; context: LoggerContext }} env - 包含日志级别和上下文的环境对象
   * @param {...unknown} messages - 日志消息数组
   * @description 根据配置的格式（text 或 json）输出日志到控制台
   */
  print: ({ level, context }, ...messages) => {
    const { config, ...rest } = context;

    // JSON 格式输出
    if (context.config.format === 'json') {
      console[level]?.(jsonStringifySafe({ level, ...rest, messages }));
    }

    // 文本格式输出
    if (context.config.format === 'text') {
      const chunks: Array<unknown> = [];

      // 处理命名空间前缀
      if (config.enableNamespacePrefix && context.namespace?.length) {
        if (config.enableNamespacePrefixColors) {
          // 使用颜色显示命名空间
          chunks.push(...processColoringPrefixChunks(context.namespace));
        } else {
          // 普通文本显示命名空间
          chunks.push(`${context.namespace.join('/')}`);
        }
      }

      // 添加日志消息

      chunks.push(...processColoringLevelChunk(level, messages));

      // 处理标签信息
      if (
        config.appendTagsForTextPrint &&
        context.tags &&
        Object.keys(context.tags).length
      ) {
        if (config.transformTagsForTextPrint) {
          chunks.push(config.transformTagsForTextPrint(context.tags, context));
        } else {
          chunks.push(context.tags);
        }
      }

      // 处理额外信息
      if (
        config.appendExtraForTextPrint &&
        context.extra &&
        Object.keys(context.extra).length
      ) {
        if (config.transformExtraForTextPrint) {
          chunks.push(
            config.transformExtraForTextPrint(context.extra, context)
          );
        } else {
          chunks.push(context.extra);
        }
      }

      // 输出到控制台
      console[level](...chunks);
    }

    // 执行钩子函数
    if (config.hook) config.hook(level, context, ...messages);
  }
});
