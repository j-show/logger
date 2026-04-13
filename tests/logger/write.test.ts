/* eslint-disable @typescript-eslint/consistent-type-imports */
/**
 * @fileoverview logger.write / coreLogger.write 行为测试
 *
 * 关注点：
 * - Node.js 环境下应使用 `process.stdout.write`
 * - Browser 环境下应降级为 `console.info`
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CoreLogger, LoggerContext } from '../../src/types';

const makeMockContext = (): LoggerContext => ({
  config: {
    format: 'text',
    enableNamespacePrefix: true,
    enableNamespacePrefixColors: false,
    appendTagsForTextPrint: false,
    appendExtraForTextPrint: false
  },
  namespace: ['test'],
  tags: {},
  extra: {}
});

describe('coreLogger.write', () => {
  let mockContext: LoggerContext;

  beforeEach(() => {
    mockContext = makeMockContext();

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('Node 环境下应写入 stdout（process.stdout.write）', async () => {
    // 不同包管理器/runner 下 `process` 形态可能不同，这里直接 mock isNodeEnvironment 为 true，确保走 Node 分支
    vi.doMock('../../src/utils', async () => {
      const actual =
        await vi.importActual<typeof import('../../src/utils')>(
          '../../src/utils'
        );
      return { ...actual, isNodeEnvironment: () => true };
    });

    const { LoggerFactoryOfConsole } = await import('../../src/logger/console');
    const coreLogger = LoggerFactoryOfConsole();

    const stdoutSpy = vi
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(process.stdout as any, 'write')
      .mockImplementation(() => true);
    const consoleInfoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => {});

    coreLogger.write(mockContext, 'hello', 123);

    expect(stdoutSpy).toHaveBeenCalledOnce();
    const arg = stdoutSpy.mock.calls[0]?.[0];
    expect(typeof arg).toBe('string');
    expect((arg as string).endsWith('\n')).toBe(true);

    // Node 分支不应降级走 console.info
    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });

  it('Browser 环境下应降级为 console.info，且不触发 stdout.write', async () => {
    vi.doMock('../../src/utils', async () => {
      const actual =
        await vi.importActual<typeof import('../../src/utils')>(
          '../../src/utils'
        );
      return { ...actual, isNodeEnvironment: () => false };
    });

    const { LoggerFactoryOfConsole } = await import('../../src/logger/console');
    const coreLogger = LoggerFactoryOfConsole();

    const stdoutSpy = vi
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(process.stdout as any, 'write')
      .mockImplementation(() => true);
    const consoleInfoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => {});

    coreLogger.write(mockContext, 'hello', { a: 1 });

    expect(consoleInfoSpy).toHaveBeenCalledOnce();
    expect(stdoutSpy).not.toHaveBeenCalled();
  });
});

describe('logger.write', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('应调用 coreLogger.write（无 level 的直写语义）', async () => {
    const writeSpy = vi.fn();
    const printSpy = vi.fn();

    const fakeCoreLogger: CoreLogger<LoggerContext> = {
      write: writeSpy,
      print: printSpy
    };

    const { configure, logger } = await import('../../src/logger');
    configure({
      createCoreLogger: () => fakeCoreLogger
    });

    logger.write('hello', 1, { a: 1 });

    expect(writeSpy).toHaveBeenCalledOnce();
    expect(printSpy).not.toHaveBeenCalled();
  });

  it('Browser 环境下使用默认 console coreLogger 时，应降级到 console.info', async () => {
    // 提供一个没有 versions 的 process，用于触发 isNodeEnvironment() === false
    vi.stubGlobal('process', { stdout: { write: vi.fn() }, env: {} });
    vi.stubGlobal('window', {});

    const stdoutSpy = vi
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(process.stdout as any, 'write')
      .mockImplementation(() => true);
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const { configure, logger } = await import('../../src/logger');
    configure();

    logger.write('hello', { a: 1 });

    expect(infoSpy).toHaveBeenCalledOnce();
    expect(stdoutSpy).not.toHaveBeenCalled();
  });
});
