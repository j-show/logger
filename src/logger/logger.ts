/**
 * @fileoverview 日志记录器核心模块
 * @module logger
 * @description 提供日志记录器的创建、配置和管理功能
 */

import { ColorIdxDefault, wrapAnsiIndex } from '../color';
import {
  type CoreLogger,
  type CoreLoggerFactory,
  type Logger,
  LOGGER_APPEND_CONFIG,
  type LoggerConfig,
  type LoggerContext,
  type LoggerSubContext,
  type LogLevel,
  LogLevels
} from '../types';

import { LoggerFactoryOfConsole } from './console';

// ------------

export type LogLevelOrMute = LogLevel | 'mute';

interface LoggerPrintLevel {
  level: LogLevelOrMute | null;
  levels: LogLevel[] | null;
}

interface CurrentPrintLevel extends LoggerPrintLevel {
  mute: boolean;
}

/**
 * 日志级别索引映射表
 * @constant {Object} logLevelIndexMap
 * @description 将日志级别映射到数字索引，用于比较日志级别
 * @private
 */
const logLevelIndexMap = LogLevels.reduce(
  (col, key, index) => ({ ...col, [key]: index }),
  {}
) as {
  [x in LogLevel]: number;
};

const defaultPrintLevel = {
  level: 'info' as LogLevel,
  levels: [...LogLevels] as LogLevel[]
};

const globalPrintLevel: LoggerPrintLevel = {
  /** 全局日志输出级别 */
  level: 'info',
  /** 全局日志输出级别列表 */
  levels: [...LogLevels]
};

/** 核心日志记录器实例 */
let coreLogger: CoreLogger<LoggerContext> | undefined;

const updateLevel = (
  printLevel: LoggerPrintLevel,
  level?: LogLevelOrMute | null
) => {
  printLevel.level =
    level === 'mute' || LogLevels.includes(level as LogLevel)
      ? level || null
      : null;
};

const updateLevels = (printLevel: LoggerPrintLevel, levels: LogLevel[]) => {
  printLevel.levels =
    levels.length < 1
      ? null
      : Array.from(new Set(levels)).filter(v => LogLevels.includes(v));
};

/**
 * 设置全局日志输出级别
 * @function setLogLevel
 * @param {LogLevelOrMute} level - 要设置的日志级别
 * @description 设置全局的日志输出级别，只有等于或低于此级别的日志才会被输出
 * @example
 * setLogLevel('debug'); // 显示所有级别的日志
 * setLogLevel('error'); // 只显示错误日志
 */
export const setLogLevel = (level: LogLevelOrMute) =>
  updateLevel(globalPrintLevel, level);

/**
 * 设置全局“允许输出”的日志级别白名单。
 *
 * - 该白名单与阈值级别（`setLogLevel`）共同生效：必须同时通过“白名单包含”与“阈值比较”两项检查才会输出。
 * - 传入重复值会自动去重；传入非法级别会被过滤。
 *
 * @param levels - 允许输出的日志级别列表（白名单）
 * @example
 * setLogLevels('info', 'error'); // 只允许 info 与 error（warn/debug 会被屏蔽）
 * setLogLevels(...LogLevels); // 允许全部级别
 */
export const setLogLevels = (...levels: LogLevel[]) =>
  updateLevels(globalPrintLevel, levels);

/**
 * 判断指定级别的日志是否可以被输出
 * @function canPrintByLevel
 * @param {LogLevel} level - 日志级别
 * @param {LogLevel} printLevel - 输出级别阈值
 * @returns {boolean} 如果日志级别低于或等于输出级别，返回 true
 * @description 比较日志级别和输出级别，决定是否应该输出该日志
 * @example
 * canPrintByLevel('debug', 'info') // false，debug 级别低于 info
 * canPrintByLevel('error', 'info') // true，error 级别高于 info
 */
export const canPrintByLevel = (
  level: LogLevel,
  printLevel: LogLevelOrMute
) => {
  if (printLevel === 'mute') return false;
  return logLevelIndexMap[level] <= logLevelIndexMap[printLevel];
};

/**
 * 通过“白名单包含”判断指定级别是否允许输出。
 *
 * @param level - 日志级别
 * @param printLevels - 允许输出的日志级别集合（白名单）
 */
export const canPrintByContain = (level: LogLevel, printLevels: LogLevel[]) => {
  return printLevels.includes(level);
};

// ------------

/**
 * 合并多个日志上下文
 * @function mergeContexts
 * @param {LoggerContext} majorCtx - 主上下文
 * @param {...LoggerSubContext<LoggerContext>} subCtxList - 要合并的子上下文列表
 * @returns {LoggerContext} 合并后的日志上下文
 * @description 将多个日志上下文合并为一个，子上下文的配置会覆盖主上下文的配置
 * @private
 */
const mergeContexts = (
  majorCtx: LoggerContext,
  ...subCtxList: Array<LoggerSubContext<LoggerContext>>
) => {
  return subCtxList.reduce<LoggerContext>(
    (collection, { namespace, tags, extra }) => {
      const newCtx = {
        config: collection.config,
        tags: { ...collection.tags, ...tags },
        extra: { ...collection.extra, ...extra },
        namespace: [...(collection.namespace || [])]
      };

      if (namespace) newCtx.namespace.push(namespace);

      return newCtx;
    },
    majorCtx
  );
};

/**
 * 创建日志记录器包装器
 * @function createLoggerWrap
 * @param {LoggerContext} context - 日志上下文
 * @param {LogLevelOrMute | LogLevel[] | LoggerPrintLevel | boolean} [printLevel] - 可选的日志输出级别，如果未指定则使用全局级别
 * @returns {Logger<LoggerContext>} 日志记录器实例
 * @description 创建一个日志记录器实例，提供不同级别的日志方法和上下文管理功能
 * @private
 */
const createLoggerWrap = (
  context: LoggerContext,
  printLevel?: LogLevelOrMute | LogLevel[] | LoggerPrintLevel | boolean
): Logger<LoggerContext> => {
  const currentPrintLevel: CurrentPrintLevel = {
    level: null,
    levels: null,
    mute: false
  };

  const toggleMute = (status?: boolean) => {
    if (status == null) {
      currentPrintLevel.mute = !currentPrintLevel.mute;
    } else {
      currentPrintLevel.mute = status;
    }
  };

  const setLevel = (level?: LogLevelOrMute | null) => {
    updateLevel(currentPrintLevel, level);
  };

  const setLevels = (...levels: LogLevel[]) => {
    updateLevels(currentPrintLevel, levels);
  };

  switch (typeof printLevel) {
    case 'boolean':
      toggleMute(printLevel);
      break;
    case 'string':
      setLevel(printLevel);
      break;
    case 'object':
      if (Array.isArray(printLevel)) {
        setLevels(...printLevel);
      } else {
        setLevel(printLevel?.level);
        setLevels(...(printLevel?.levels || []));
      }
      break;
  }

  const checkLevel = (level: LogLevel = 'debug') => {
    if (currentPrintLevel.mute) return false;

    return (
      canPrintByContain(
        level,
        currentPrintLevel.levels ||
          globalPrintLevel.levels ||
          defaultPrintLevel.levels
      ) &&
      canPrintByLevel(
        level,
        currentPrintLevel.level ||
          globalPrintLevel.level ||
          defaultPrintLevel.level
      )
    );
  };

  /**
   * 内部打印函数
   * @param {LogLevel} level - 日志级别
   * @param {...unknown} msg - 日志消息
   * @private
   */
  const print = (level: LogLevel | 'none', ...msg: Array<unknown>) => {
    if (level !== 'none') {
      // 检查日志级别是否允许输出
      if (!checkLevel(level)) return;
    }

    // 检查核心日志记录器是否已初始化
    if (!coreLogger) return;

    // 检查过滤器是否允许输出
    if (
      context.config.filter &&
      !context.config.filter(context.namespace || [], context.tags || {})
    )
      return;

    // 调用核心日志记录器输出日志
    if (level === 'none') {
      coreLogger.write(context, msg[0] as string);
    } else {
      coreLogger.print({ level, context }, ...msg);
    }
  };

  const fork = (ctx: LoggerSubContext) => {
    return createLoggerWrap(
      {
        ...mergeContexts(context, ctx),
        config: context.config
      },
      currentPrintLevel
    );
  };

  return {
    // eslint-disable-next-line no-console
    empty: () => console.log(),
    // eslint-disable-next-line no-console
    table: (...args) => console.table(...args),
    // eslint-disable-next-line no-console
    trace: (...args) => console.trace(...args),
    // eslint-disable-next-line no-console
    dir: obj => console.dir(obj, { depth: null }),
    // ----
    /** 记录错误级别日志 */
    error: (...msg) => print('error', ...msg),
    /** 记录警告级别日志 */
    warn: (...msg) => print('warn', ...msg),
    /** 记录信息级别日志 */
    info: (...msg) => print('info', ...msg),
    /** 记录调试级别日志 */
    debug: (...msg) => print('debug', ...msg),
    // ----
    label: (...msg) =>
      print('info', ...msg.map(v => wrapAnsiIndex(v, ColorIdxDefault.label))),
    step: (...msg) =>
      print('info', ...msg.map(v => wrapAnsiIndex(v, ColorIdxDefault.step))),
    // ----
    /**
     * 写入日志（优先使用底层 `stdout.write`）
     *
     * - 在 Node.js 环境下：由核心 logger 决定具体写入方式，默认实现会使用 `process.stdout.write`。
     * - 在浏览器环境下：默认控制台实现会降级为 `info` 输出（等价于 `logger.info(...)`）。
     *
     * 注意：`write` 仍会执行过滤器（`config.filter`）与 hook（若核心实现支持）。
     */
    write: msg => print('none', msg),
    /**
     * 创建一个新的子日志记录器
     * @param {LoggerSubContext<LoggerContext>} ctx - 子上下文配置
     * @returns {Logger<LoggerContext>} 新的日志记录器实例
     */
    fork,
    /**
     * 在指定上下文中执行回调函数
     * @param {LoggerSubContext<LoggerContext>} ctx - 子上下文配置
     * @param {(logger: Logger<LoggerContext>) => unknown} cb - 回调函数
     * @returns {unknown} 回调函数的返回值
     */
    scope: (ctx, cb) => cb(fork(ctx)),
    // ----
    /**
     * 切换当前日志记录器为静默模式
     * @param status [default: undefined] 是否静默模式，true 为静默，false 为取消静默, undefined 为切换状态
     */
    toggleMute,
    /**
     * 检查是否可以输出该级别的日志
     * @param {LogLevel} [level='debug'] - 日志级别
     * @returns {boolean} 是否可以输出该级别的日志
     */
    checkLevel,
    /**
     * 设置当前日志记录器的输出级别
     * @param {LogLevel | null} level - 日志级别
     */
    setLevel,
    /**
     * 设置当前日志记录器的输出级别列表
     * @param {...LogLevel} levels - 日志级别列表
     */
    setLevels,
    // ----
    /**
     * 追加配置的内部方法
     * @param {Partial<LoggerConfig>} conf - 要追加的配置
     */
    [LOGGER_APPEND_CONFIG]: (conf: Partial<LoggerConfig>) =>
      ((context as { config: (typeof context)['config'] }).config = {
        ...context.config,
        ...conf
      })
  };
};

// ------------

/**
 * 默认日志记录器实例
 * @constant {Logger<LoggerContext>} logger
 * @description 使用默认配置创建的日志记录器实例
 * @example
 * logger.info('Hello World');
 * logger.error('Something went wrong');
 */
export const logger = createLoggerWrap({
  config: {
    format: 'text',
    enableNamespacePrefix: true,
    enableNamespacePrefixColors: true,
    appendTagsForTextPrint: true,
    appendExtraForTextPrint: true
  }
});

// ------------

/** 配置函数调用计数，用于确保只配置一次 */
let configureFucntionCallCount = 0;

/**
 * 配置日志记录器
 * @function configure
 * @param {CoreLoggerFactory<LoggerContext>} [createCoreLogger=LoggerFactoryOfConsole] - 核心日志记录器工厂函数
 * @param {Partial<LoggerConfig>} [config={}] - 日志记录器配置选项
 * @throws {Error} 如果日志记录器已经被配置过，则抛出错误
 * @description 初始化日志记录器，只能调用一次。如果未提供工厂函数，则使用默认的控制台日志记录器
 * @example
 * configure(LoggerFactoryOfConsole, {
 *   format: 'json',
 *   enableNamespacePrefix: false
 * });
 */
export function configure({
  createCoreLogger = LoggerFactoryOfConsole,
  config = {}
}: {
  createCoreLogger?: CoreLoggerFactory<LoggerContext>;
  config?: Partial<LoggerConfig>;
} = {}): void {
  if (configureFucntionCallCount++) {
    throw new Error('Logger has been configured');
  }

  coreLogger = createCoreLogger();

  logger[LOGGER_APPEND_CONFIG](config);
}
