/* eslint-disable no-undefined */
/**
 * @fileoverview 基础使用示例
 * @description 展示 jshow-logger 的基本用法
 */

import { configure, logger, setLogLevel, setLogLevels } from '../src';

// 配置日志记录器（只需要在应用启动时调用一次）
configure();
setLogLevel('debug');
setLogLevels(
  'debug',
  // 'info',
  'warn'
  // 'error'
);

// 使用不同级别的日志
logger.error('这是一个错误消息');
logger.warn('这是一个警告消息');
logger.info('这是一个信息消息');
logger.debug('这是一个调试消息');

// 传递多个参数
logger.error(
  '用户登录',
  { userId: '12345', username: 'john' },
  1,
  [],
  null,
  undefined,
  true,
  () => {
    return 1;
  }
);

// 使用命名空间
const appLogger = logger.fork({ namespace: 'app' });
appLogger.info('应用启动');

const dbLogger = logger.fork({ namespace: 'database' });
dbLogger.info('数据库连接成功');

// 嵌套命名空间
const apiLogger = logger.fork({ namespace: 'api' });
const userApiLogger = apiLogger.fork({ namespace: 'user' });
userApiLogger.info('获取用户信息');

// 使用 scope 在特定上下文中执行
logger.scope({ namespace: 'request' }, log => {
  log.warn('处理请求开始');
  log.error('处理请求中...');
  log.info('处理请求完成');
});
