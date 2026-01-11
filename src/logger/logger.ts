/**
 * @fileoverview 日志记录器核心模块
 * @module logger
 * @description 提供日志记录器的创建、配置和管理功能
 */

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

/** 全局日志输出级别 */
let globalPrintLevel: LogLevel = 'info';
/** 全局日志输出级别列表 */
let globalPrintLevels: LogLevel[] = [...LogLevels];
/** 核心日志记录器实例 */
let coreLogger: CoreLogger<LoggerContext> | undefined;

/**
 * 设置全局日志输出级别
 * @function setLevel
 * @param {LogLevel} level - 要设置的日志级别
 * @description 设置全局的日志输出级别，只有等于或低于此级别的日志才会被输出
 * @example
 * setLevel('debug'); // 显示所有级别的日志
 * setLevel('error'); // 只显示错误日志
 */
export const setLogLevel = (level: LogLevel) => {
  globalPrintLevel = level;
};

export const setLogLevels = (...levels: LogLevel[]) => {
  globalPrintLevels = Array.from(new Set(levels)).filter(v =>
    LogLevels.includes(v)
  );
};

/**
 * 判断指定级别的日志是否可以被输出
 * @function canPrintLevel
 * @param {LogLevel} level - 日志级别
 * @param {LogLevel} printLevel - 输出级别阈值
 * @returns {boolean} 如果日志级别低于或等于输出级别，返回 true
 * @description 比较日志级别和输出级别，决定是否应该输出该日志
 * @example
 * canPrintLevel('debug', 'info') // false，debug 级别低于 info
 * canPrintLevel('error', 'info') // true，error 级别高于 info
 */
const canPrintLevel = (level: LogLevel, printLevel: LogLevel) => {
  return logLevelIndexMap[level] <= logLevelIndexMap[printLevel];
};

const canPrintLevels = (level: LogLevel, printLevels: LogLevel[]) => {
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
 * @param {LogLevel} [printLevel] - 可选的日志输出级别，如果未指定则使用全局级别
 * @returns {Logger<LoggerContext>} 日志记录器实例
 * @description 创建一个日志记录器实例，提供不同级别的日志方法和上下文管理功能
 * @private
 */
const createLoggerWrap = (
  context: LoggerContext,
  printLevel?: LogLevel | LogLevel[]
): Logger<LoggerContext> => {
  const currentPrintLevel = {
    level: null,
    levels: null
  } as {
    level: LogLevel | null;
    levels: LogLevel[] | null;
  };

  const setLevel = (level: LogLevel | null) => {
    currentPrintLevel.level = level;
  };

  const setLevels = (...levels: LogLevel[]) => {
    currentPrintLevel.levels =
      levels.length < 1
        ? null
        : Array.from(new Set(levels)).filter(v => LogLevels.includes(v));
  };

  if (printLevel) {
    if (Array.isArray(printLevel)) {
      setLevels(...printLevel);
    } else {
      setLevel(printLevel);
    }
  }

  /**
   * 内部打印函数
   * @param {LogLevel} level - 日志级别
   * @param {...unknown} msg - 日志消息
   * @private
   */
  const print = (level: LogLevel, ...msg: Array<unknown>) => {
    // 检查日志级别是否允许输出
    if (
      !canPrintLevels(level, currentPrintLevel.levels || globalPrintLevels) ||
      !canPrintLevel(level, currentPrintLevel.level || globalPrintLevel)
    )
      return;

    // 检查核心日志记录器是否已初始化
    if (!coreLogger) return;

    // 检查过滤器是否允许输出
    if (
      context.config.filter &&
      !context.config.filter(context.namespace || [], context.tags || {})
    )
      return;

    // 调用核心日志记录器输出日志
    coreLogger.print({ level, context }, ...msg);
  };

  return {
    /** 记录错误级别日志 */
    error: (...msg) => print('error', ...msg),
    /** 记录警告级别日志 */
    warn: (...msg) => print('warn', ...msg),
    /** 记录信息级别日志 */
    info: (...msg) => print('info', ...msg),
    /** 记录调试级别日志 */
    debug: (...msg) => print('debug', ...msg),
    // ----
    /**
     * 创建一个新的子日志记录器
     * @param {LoggerSubContext<LoggerContext>} ctx - 子上下文配置
     * @returns {Logger<LoggerContext>} 新的日志记录器实例
     */
    fork: ctx =>
      createLoggerWrap({
        ...mergeContexts(context, ctx),
        config: context.config
      }),
    /**
     * 在指定上下文中执行回调函数
     * @param {LoggerSubContext<LoggerContext>} ctx - 子上下文配置
     * @param {(logger: Logger<LoggerContext>) => unknown} cb - 回调函数
     * @returns {unknown} 回调函数的返回值
     */
    scope: (ctx, cb) =>
      cb(
        createLoggerWrap({
          ...mergeContexts(context, ctx),
          config: context.config
        })
      ),
    // ----
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
