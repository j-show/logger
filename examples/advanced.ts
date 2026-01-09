/**
 * @fileoverview 高级功能使用示例
 * @description 展示命名空间、标签、额外信息等高级功能
 */

import { configure, logger } from '../src';

// 配置日志记录器
configure();

// 使用标签（tags）进行分类
const taggedLogger = logger.fork({
  namespace: 'payment',
  tags: { module: 'payment', version: '1.0.0' }
});

taggedLogger.info('处理支付请求', { amount: 100, currency: 'USD' });

// 使用额外信息（extra）
const loggerWithExtra = logger.fork({
  namespace: 'api',
  extra: { requestId: 'req-123', userId: 'user-456' }
});

loggerWithExtra.info('API 请求处理');
loggerWithExtra.warn('API 响应较慢', { duration: 5000 });

// 组合使用命名空间、标签和额外信息
const fullLogger = logger.fork({
  namespace: 'order',
  tags: { service: 'order-service', env: 'production' },
  extra: { region: 'us-east-1', instance: 'instance-1' }
});

fullLogger.info('创建订单');
fullLogger.error('订单创建失败', new Error('库存不足'));

// 使用 scope 创建临时上下文
logger.scope(
  {
    namespace: 'transaction',
    tags: { transactionId: 'txn-789' },
    extra: { timestamp: Date.now() }
  },
  log => {
    log.info('事务开始');
    log.info('执行操作 1');
    log.info('执行操作 2');
    log.info('事务提交');
  }
);

// 动态设置日志级别
const debugLogger = logger.fork({ namespace: 'debug' });
debugLogger.setLevel('debug');
debugLogger.debug('这条调试信息会显示');
debugLogger.setLevel('info');
debugLogger.debug('这条调试信息不会显示');
