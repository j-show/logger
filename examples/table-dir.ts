/**
 * @fileoverview write / table / dir 示例
 * @description 演示 logger.write / logger.table / logger.dir 的用法
 */

import { configure, logger, setLogLevel } from '../src';

configure();
setLogLevel('debug');

logger.table([
  { id: 'u-1', name: 'Alice', active: true, score: 98 },
  { id: 'u-2', name: 'Bob', active: false, score: 72 }
]);

logger.empty();

logger.dir({
  user: {
    id: 'u-1',
    profile: { email: 'alice@example.com', roles: ['admin'] }
  },
  meta: { ts: new Date().toISOString(), deep: { a: 1, b: { c: 2 } } }
});
