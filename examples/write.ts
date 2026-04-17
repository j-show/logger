/**
 * @fileoverview write / table / dir 示例
 * @description 演示 logger.write / logger.table / logger.dir 的用法
 */

import { configure, logger, setLogLevel } from '../src';

configure();
setLogLevel('debug');

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

logger.scope({ namespace: 'write' }, async log => {
  log.write('首先输出内容，等 3 秒后整行输出 done');

  await sleep(3000);

  log.write('done（结束改写，需要自行在结尾进行换行符拼接）\n');

  log.info('finished', { a: 1, b: '2' });
});
