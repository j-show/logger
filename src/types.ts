/**
 * @fileoverview 日志记录器的类型定义
 * @module types
 */

/**
 * 日志元数据接口
 * @interface LogMeta
 * @description 用于存储日志的额外元数据信息
 */
export interface LogMeta {
  [key: string]: unknown;
}

/**
 * 错误元数据接口
 * @interface ErrorMeta
 * @extends {LogMeta}
 * @template T 标签类型，默认为字符串键值对对象
 * @description 扩展了 LogMeta，用于错误日志的特殊元数据
 */
export interface ErrorMeta<T = { [key: string]: string }> extends LogMeta {
  /** 可选的标签集合 */
  setTags?: T;
}

/**
 * 错误类对象类型
 * @typedef {Error | { stack: string; message: string; name: string }} ErrorLiked
 * @description 表示类似 Error 的对象，包含 stack、message 和 name 属性
 */
export type ErrorLiked =
  | Error
  | { stack: string; message: string; name: string };

/**
 * 日志级别常量数组
 * @constant {readonly string[]} LogLevels
 * @description 定义所有可用的日志级别，按严重程度从高到低排序
 */
export const LogLevels = ['error', 'warn', 'info', 'debug'] as const;

/**
 * 日志级别类型
 * @typedef {'error' | 'warn' | 'info' | 'debug'} LogLevel
 * @description 表示日志的级别，用于控制日志的输出和过滤
 */
export type LogLevel = (typeof LogLevels)[number];

/**
 * 日志函数类型
 * @typedef {(...msg: Array<unknown>) => unknown} LogFunction
 * @description 用于记录日志的函数签名
 */
export type LogFunction = (...msg: Array<unknown>) => unknown;

/**
 * 日志记录器配置接口
 * @interface LoggerConfig
 * @description 定义日志记录器的所有配置选项
 */
export interface LoggerConfig {
  /** 日志输出格式：'text' 为文本格式，'json' 为 JSON 格式 */
  format: 'text' | 'json';
  /** 是否启用命名空间前缀 */
  enableNamespacePrefix: boolean;
  /** 是否启用命名空间前缀的颜色显示 */
  enableNamespacePrefixColors: boolean;
  /** 在文本格式输出时是否追加标签信息 */
  appendTagsForTextPrint: boolean;
  /** 在文本格式输出时是否追加额外信息 */
  appendExtraForTextPrint: boolean;
  /**
   * 标签转换函数，用于在文本格式输出时自定义标签的显示方式
   * @param tags 标签对象
   * @param context 日志上下文
   * @returns 转换后的标签值
   */
  transformTagsForTextPrint?: (
    tags: LoggerContext['tags'],
    context: LoggerContext
  ) => unknown;
  /**
   * 额外信息转换函数，用于在文本格式输出时自定义额外信息的显示方式
   * @param extra 额外信息对象
   * @param context 日志上下文
   * @returns 转换后的额外信息值
   */
  transformExtraForTextPrint?: (
    extra: LoggerContext['extra'],
    context: LoggerContext
  ) => unknown;
  /**
   * 过滤函数，用于决定是否输出特定命名空间和标签的日志
   * @param namespace 命名空间数组
   * @param tags 标签对象
   * @returns 返回 true 表示允许输出，false 表示过滤掉
   */
  filter?: (
    namespace: NonNullable<LoggerContext['namespace']>,
    tags: NonNullable<LoggerContext['tags']>
  ) => boolean;
  /**
   * 钩子函数，在日志输出后调用
   * @param level 日志级别
   * @param context 日志上下文
   * @param messages 日志消息数组
   */
  hook?: (
    level: LogLevel,
    context: LoggerContext,
    ...messages: Array<unknown>
  ) => unknown;
}

/**
 * 日志上下文接口
 * @interface LoggerContext
 * @description 包含日志记录所需的所有上下文信息
 */
export interface LoggerContext {
  /** 标签对象，用于分类和过滤日志 */
  tags?: { [x: string]: unknown };
  /** 额外信息对象，用于存储额外的日志数据 */
  extra?: { [x: string]: string | number | boolean | undefined | null };
  /** 命名空间数组，用于组织和管理日志 */
  namespace?: string[];
  /** 日志记录器配置，只读 */
  readonly config: LoggerConfig;
}

/**
 * 日志子上下文类型
 * @template CTX 日志上下文类型
 * @typedef {Partial<Omit<CTX, 'config' | 'namespace'> & { namespace?: string }>} LoggerSubContext
 * @description 用于创建子日志记录器的上下文，不包含 config，namespace 为单个字符串而非数组
 */
export type LoggerSubContext<CTX extends LoggerContext> = Partial<
  Omit<CTX, 'config' | 'namespace'> & { namespace?: string }
>;

/**
 * 包含所有日志级别的对象类型
 * @typedef {{ [x in LogLevel]: LogFunction }} LogWithLevels
 * @description 为每个日志级别提供对应的日志函数
 */
type LogWithLevels = { [x in LogLevel]: LogFunction };

/**
 * 支持集群操作的接口
 * @interface WithCluster
 * @template CTX 日志上下文类型
 * @description 提供 fork 和 scope 方法用于创建子日志记录器
 */
interface WithCluster<CTX extends LoggerContext> {
  /**
   * 创建一个新的子日志记录器
   * @param context 子上下文配置
   * @returns 新的日志记录器实例
   */
  fork: (context: LoggerSubContext<CTX>) => Logger<CTX>;
  /**
   * 在指定上下文中执行回调函数
   * @param context 子上下文配置
   * @param fn 回调函数，接收新的日志记录器实例
   * @returns 回调函数的返回值
   */
  scope: (
    context: LoggerSubContext<CTX>,
    fn: (logger: Logger<CTX>) => unknown
  ) => unknown;
}

/**
 * 用于追加配置的符号键
 * @constant {symbol} LOGGER_APPEND_CONFIG
 * @description 用于在日志记录器实例上追加配置的内部符号
 */
export const LOGGER_APPEND_CONFIG: unique symbol = Symbol(
  'Logger Append Config'
);

/**
 * 日志记录器接口
 * @interface Logger
 * @extends {LogWithLevels}
 * @extends {WithCluster<CTX>}
 * @template CTX 日志上下文类型
 * @description 提供完整的日志记录功能，包括不同级别的日志方法和上下文管理
 */
export interface Logger<CTX extends LoggerContext>
  extends LogWithLevels, WithCluster<CTX> {
  /**
   * 追加配置的内部方法
   * @param conf 要追加的配置对象
   */
  [LOGGER_APPEND_CONFIG]: (conf: Partial<LoggerConfig>) => void;
  /**
   * 设置当前日志记录器的输出级别
   * @param level 日志级别
   * @description 设置当前日志记录器的输出级别，只有等于或低于此级别的日志才会被输出
   * @example
   * setLevel('debug'); // 显示所有级别的日志
   * setLevel('info'); // 只显示 info、warn、error
   * setLevel('warn'); // 只显示 warn、error
   * setLevel('error'); // 只显示 error
   */
  setLevel: (level: LogLevel) => void;
  /**
   * 设置当前日志记录器的输出级别列表
   * @param levels - 日志级别列表
   * @description 设置当前日志记录器的输出级别列表，只有等于或低于此级别的日志才会被输出
   * @example
   * setLevels('debug', 'info', 'warn', 'error'); // 显示所有级别的日志
   * setLevels('info', 'warn', 'error'); // 只显示 info、warn、error
   * setLevels('warn', 'error'); // 只显示 warn、error
   * setLevels('error'); // 只显示 error
   */
  setLevels: (...levels: LogLevel[]) => void;
}

/**
 * 核心日志记录器接口
 * @interface CoreLogger
 * @template CTX 日志上下文类型
 * @description 定义日志输出的核心接口，由具体的实现类来实现
 */
export interface CoreLogger<CTX extends LoggerContext> {
  /**
   * 打印日志的核心方法
   * @param env 包含日志级别和上下文的环境对象
   * @param msg 日志消息数组
   */
  print: (
    env: { level: LogLevel; context: CTX },
    ...msg: Array<unknown>
  ) => unknown;
}

/**
 * 核心日志记录器工厂函数类型
 * @typedef {() => CoreLogger<CTX>} CoreLoggerFactory
 * @template CTX 日志上下文类型
 * @description 用于创建核心日志记录器实例的工厂函数
 */
export type CoreLoggerFactory<CTX extends LoggerContext> =
  () => CoreLogger<CTX>;
