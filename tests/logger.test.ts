import { describe, expect, it, vi } from 'vitest';

describe('utils.isNodeEnvironment', () => {
  it('should detect Node.js', async () => {
    const { isNodeEnvironment } = await import('../src/utils');
    expect(isNodeEnvironment()).toBe(true);
  });
});

describe('configure()', () => {
  it('should only allow configuring once per module instance', async () => {
    vi.resetModules();
    const mod = await import('../src');

    mod.configure();
    expect(() => mod.configure()).toThrowError(/configured/i);
  });
});

describe('logger levels', () => {
  it('should filter by global log level', async () => {
    vi.resetModules();

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { configure, logger, setLogLevel } = await import('../src');
    configure({ config: { format: 'text' } as any });

    setLogLevel('warn');
    logger.debug('no');
    logger.info('no');
    logger.warn('yes');
    logger.error('yes');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
    warnSpy.mockRestore();
    infoSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('should filter by instance whitelist via setLevels()', async () => {
    vi.resetModules();

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { configure, logger, setLogLevel } = await import('../src');
    configure({ config: { format: 'text' } as any });
    setLogLevel('debug');

    const l = logger.fork({ namespace: 'inst' });
    l.setLevels('info', 'error');

    l.debug('no');
    l.warn('no');
    l.info('yes');
    l.error('yes');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
    warnSpy.mockRestore();
    infoSpy.mockRestore();
    debugSpy.mockRestore();
  });
});

describe('LoggerFactoryOfConsole', () => {
  it('should call hook for print()', async () => {
    vi.resetModules();

    const hook = vi.fn();
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const { LoggerFactoryOfConsole, logger, configure } =
      await import('../src');
    configure({
      createCoreLogger: LoggerFactoryOfConsole,
      config: { format: 'json', hook } as any
    });

    logger.info('hello', { a: 1 });
    expect(infoSpy).toHaveBeenCalled();
    expect(hook).toHaveBeenCalled();

    infoSpy.mockRestore();
  });

  it('write() should use stdout.write in Node', async () => {
    vi.resetModules();

    const writeSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true as any);

    const { configure, logger } = await import('../src');
    configure({ config: { format: 'text' } as any });

    logger.write('raw', 1);
    expect(writeSpy).toHaveBeenCalled();

    writeSpy.mockRestore();
  });
});

describe('useLogger()', () => {
  it('should return a forked logger when not ignored', async () => {
    vi.resetModules();

    const { setLoggerIgnore, useLogger, configure } = await import('../src');
    configure({ config: { format: 'text' } as any });
    setLoggerIgnore('');

    const l = useLogger('ServiceA');
    expect(typeof l.info).toBe('function');
    expect(typeof l.fork).toBe('function');
  });

  it('should return a no-op logger when ignored (and be chain-safe)', async () => {
    vi.resetModules();

    const { setLoggerIgnore, useLogger, configure } = await import('../src');
    configure({ config: { format: 'text' } as any });
    setLoggerIgnore('ServiceB');

    const l = useLogger('ServiceB');
    expect(() => l.info('x')).not.toThrow();
    expect(() => l.fork({ namespace: 'child' }).debug('x')).not.toThrow();
    expect(() =>
      l.scope({ namespace: 'sc' }, log => log.info('x'))
    ).not.toThrow();
  });
});
