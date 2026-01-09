/**
 * @fileoverview logger/console 模块测试用例
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoggerFactoryOfConsole } from '../../src/logger/console';
import type { LoggerContext, LogLevel } from '../../src/types';

describe('LoggerFactoryOfConsole', () => {
  let coreLogger: ReturnType<typeof LoggerFactoryOfConsole>;
  let mockContext: LoggerContext;

  beforeEach(() => {
    coreLogger = LoggerFactoryOfConsole();
    mockContext = {
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
    };
    vi.clearAllMocks();
  });

  it('应该创建核心日志记录器实例', () => {
    expect(coreLogger).toBeDefined();
    expect(typeof coreLogger.print).toBe('function');
  });

  describe('JSON 格式输出', () => {
    beforeEach(() => {
      mockContext.config.format = 'json';
    });

    it('应该以 JSON 格式输出日志', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      coreLogger.print({ level: 'info', context: mockContext }, 'test message');
      expect(consoleSpy).toHaveBeenCalledOnce();
      const callArg = consoleSpy.mock.calls[0][0];
      expect(callArg).toContain('"level":"info"');
      expect(callArg).toContain('"messages"');
      consoleSpy.mockRestore();
    });

    it('应该包含上下文信息', () => {
      mockContext.namespace = ['app', 'module'];
      mockContext.tags = { tag1: 'value1' };
      mockContext.extra = { key: 'value' };

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      coreLogger.print({ level: 'error', context: mockContext }, 'error');
      expect(consoleSpy).toHaveBeenCalledOnce();
      const callArg = consoleSpy.mock.calls[0][0];
      expect(callArg).toContain('"namespace"');
      expect(callArg).toContain('"tags"');
      expect(callArg).toContain('"extra"');
      consoleSpy.mockRestore();
    });
  });

  describe('文本格式输出', () => {
    beforeEach(() => {
      mockContext.config.format = 'text';
    });

    it('应该以文本格式输出日志', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      coreLogger.print({ level: 'info', context: mockContext }, 'test');
      expect(consoleSpy).toHaveBeenCalledOnce();
      consoleSpy.mockRestore();
    });

    it('应该在启用命名空间前缀时添加前缀', () => {
      mockContext.config.enableNamespacePrefix = true;
      mockContext.namespace = ['app', 'module'];

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      coreLogger.print({ level: 'warn', context: mockContext }, 'warning');
      expect(consoleSpy).toHaveBeenCalledOnce();
      const args = consoleSpy.mock.calls[0];
      expect(args[0]).toContain('app/module');
      consoleSpy.mockRestore();
    });

    it('应该在禁用命名空间前缀时不添加前缀', () => {
      mockContext.config.enableNamespacePrefix = false;
      mockContext.namespace = ['app'];

      const consoleSpy = vi
        .spyOn(console, 'debug')
        .mockImplementation(() => {});
      coreLogger.print({ level: 'debug', context: mockContext }, 'debug');
      expect(consoleSpy).toHaveBeenCalledOnce();
      const args = consoleSpy.mock.calls[0];
      expect(args[0]).not.toContain('app');
      consoleSpy.mockRestore();
    });

    it('应该在启用标签追加时添加标签', () => {
      mockContext.config.appendTagsForTextPrint = true;
      mockContext.tags = { env: 'test', version: '1.0' };

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      coreLogger.print({ level: 'info', context: mockContext }, 'message');
      expect(consoleSpy).toHaveBeenCalledOnce();
      const args = consoleSpy.mock.calls[0];
      expect(args).toContainEqual(mockContext.tags);
      consoleSpy.mockRestore();
    });

    it('应该在启用额外信息追加时添加额外信息', () => {
      mockContext.config.appendExtraForTextPrint = true;
      mockContext.extra = { userId: '123', requestId: 'abc' };

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      coreLogger.print({ level: 'info', context: mockContext }, 'message');
      expect(consoleSpy).toHaveBeenCalledOnce();
      const args = consoleSpy.mock.calls[0];
      expect(args).toContainEqual(mockContext.extra);
      consoleSpy.mockRestore();
    });

    it('应该使用标签转换函数', () => {
      mockContext.config.appendTagsForTextPrint = true;
      mockContext.config.transformTagsForTextPrint = tags =>
        `Tags: ${JSON.stringify(tags)}`;
      mockContext.tags = { key: 'value' };

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      coreLogger.print({ level: 'info', context: mockContext }, 'message');
      expect(consoleSpy).toHaveBeenCalledOnce();
      const args = consoleSpy.mock.calls[0];
      // 转换函数返回的字符串应该在参数中
      const transformedValue = mockContext.config.transformTagsForTextPrint!(
        mockContext.tags,
        mockContext
      );
      expect(args).toContainEqual(transformedValue);
      consoleSpy.mockRestore();
    });

    it('应该使用额外信息转换函数', () => {
      mockContext.config.appendExtraForTextPrint = true;
      mockContext.config.transformExtraForTextPrint = extra =>
        `Extra: ${JSON.stringify(extra)}`;
      mockContext.extra = { key: 'value' };

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      coreLogger.print({ level: 'info', context: mockContext }, 'message');
      expect(consoleSpy).toHaveBeenCalledOnce();
      const args = consoleSpy.mock.calls[0];
      // 转换函数返回的字符串应该在参数中
      const transformedValue = mockContext.config.transformExtraForTextPrint!(
        mockContext.extra,
        mockContext
      );
      expect(args).toContainEqual(transformedValue);
      consoleSpy.mockRestore();
    });
  });

  describe('钩子函数', () => {
    it('应该在输出后调用钩子函数', () => {
      const hookSpy = vi.fn();
      mockContext.config.hook = hookSpy;

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      coreLogger.print({ level: 'info', context: mockContext }, 'test');

      expect(consoleSpy).toHaveBeenCalledOnce();
      expect(hookSpy).toHaveBeenCalledOnce();
      expect(hookSpy).toHaveBeenCalledWith('info', mockContext, 'test');

      consoleSpy.mockRestore();
    });
  });

  describe('不同日志级别', () => {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];

    levels.forEach(level => {
      it(`应该能够输出 ${level} 级别的日志`, () => {
        const consoleSpy = vi
          .spyOn(console, level as keyof typeof console)
          .mockImplementation(() => {});
        coreLogger.print({ level, context: mockContext }, `${level} message`);
        expect(consoleSpy).toHaveBeenCalledOnce();
        consoleSpy.mockRestore();
      });
    });
  });

  describe('空值处理', () => {
    it('应该处理空命名空间', () => {
      mockContext.namespace = void 0;
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      expect(() => {
        coreLogger.print({ level: 'info', context: mockContext }, 'test');
      }).not.toThrow();
      consoleSpy.mockRestore();
    });

    it('应该处理空标签', () => {
      mockContext.tags = void 0;
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      expect(() => {
        coreLogger.print({ level: 'info', context: mockContext }, 'test');
      }).not.toThrow();
      consoleSpy.mockRestore();
    });

    it('应该处理空额外信息', () => {
      mockContext.extra = void 0;
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      expect(() => {
        coreLogger.print({ level: 'info', context: mockContext }, 'test');
      }).not.toThrow();
      consoleSpy.mockRestore();
    });
  });
});
