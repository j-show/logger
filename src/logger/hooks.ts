/**
 * @fileoverview 日志记录器 Hooks 模块
 * @module logger/hooks
 * @description 提供用于创建日志记录器实例的 Hook 函数，支持基于命名空间的日志过滤
 */

import { logger } from './logger';

/**
 * 日志命名空间黑名单集合
 * @constant {Set<string>} BLACK_LIST
 * @description 从环境变量 DEBUG_IGNORE 中读取的命名空间黑名单，用于过滤不需要输出的日志。
 * 环境变量格式：逗号分隔的命名空间列表（不区分大小写）
 * @example
 * // 设置环境变量：DEBUG_IGNORE=UserService,ApiClient
 * // 则 UserService 和 ApiClient 命名空间的日志将被忽略
 */
const BLACK_LIST = new Set();

/**
 * 设置日志记录器忽略的命名空间
 * @function setLoggerIgnore
 * @param {string} ignore - 逗号分隔的命名空间列表（不区分大小写）
 * @description 设置日志记录器忽略的命名空间，用于过滤不需要输出的日志。
 * @example
 * // 设置忽略的命名空间：UserService,ApiClient
 * setLoggerIgnore('UserService,ApiClient');
 */
export const setLoggerIgnore = (ignore: string) => {
  BLACK_LIST.clear();

  const list = ignore
    .split(',')
    .map(v => v.trim().toUpperCase())
    .filter(Boolean);
  if (list.length < 1) return;

  list.forEach(v => BLACK_LIST.add(v));
};

setLoggerIgnore(process.env.DEBUG_IGNORE || '');

/**
 * 根据上下文创建日志记录器实例的 Hook 函数
 * @function useLogger
 * @param {string | Function | Object} ctx - 日志上下文，可以是：
 *   - 字符串：直接作为命名空间
 *   - 函数：使用函数名作为命名空间
 *   - 对象：使用构造函数名作为命名空间
 * @returns {Logger<LoggerContext>} 日志记录器实例。如果命名空间在黑名单中，返回一个空的代理对象（所有方法调用都不会产生任何效果）
 * @description
 * 根据提供的上下文自动提取命名空间，并创建一个带有该命名空间的日志记录器实例。
 * 如果命名空间在 DEBUG_IGNORE 环境变量定义的黑名单中，则返回一个空的代理对象，
 * 该对象的所有日志方法都是空函数，不会产生任何输出。
 *
 * @example
 * // 使用字符串作为命名空间
 * const logger = useLogger('UserService');
 * logger.info('User created'); // 输出: [UserService] User created
 *
 * @example
 * // 使用类作为上下文
 * class UserService {
 *   constructor() {
 *     this.logger = useLogger(this);
 *   }
 * }
 * // logger 的命名空间为 'UserService'
 *
 * @example
 * // 使用函数作为上下文
 * function handleRequest() {
 *   const logger = useLogger(handleRequest);
 *   logger.debug('Processing request');
 * }
 * // logger 的命名空间为 'handleRequest'
 *
 * @example
 * // 使用环境变量过滤日志
 * // 设置: DEBUG_IGNORE=UserService
 * const logger = useLogger('UserService');
 * logger.info('This will not be printed'); // 不会输出任何内容
 */
export const useLogger = (ctx: string | Function | object) => {
  // 根据上下文类型提取命名空间
  let namespace = '';

  switch (typeof ctx) {
    case 'string':
      namespace = ctx;
      break;
    case 'function':
      namespace = ctx.name || '';
      break;
    case 'object':
      if (ctx) namespace = ctx.constructor?.name || '';
      break;
  }

  // 检查命名空间是否在黑名单中（不区分大小写）
  if (!BLACK_LIST.has(namespace.toString().toUpperCase())) {
    // 不在黑名单中，创建带有命名空间的日志记录器实例
    return logger.fork({ namespace });
  }

  // 在黑名单中，返回一个空的代理对象
  // 该代理对象的所有方法调用都不会产生任何效果
  return new Proxy({} as typeof logger, {
    get: (_, key, self) => {
      // 如果访问的是 'child' 方法，返回自身（保持链式调用兼容性）
      if (key === 'child') return () => self;
      // 其他所有方法都返回空函数
      return () => {};
    }
  });
};
