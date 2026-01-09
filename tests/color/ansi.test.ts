/**
 * @fileoverview color/ansi 模块测试用例
 */

import { describe, expect, it } from 'vitest';

import { wrapColorANSI } from '../../src/color/ansi';
import type { ColorHex, LogColorStyle } from '../../src/color/define';

describe('wrapColorANSI', () => {
  it('应该为内容添加 ANSI 转义序列', () => {
    const style: LogColorStyle = {
      contentColor: [255, 0, 0]
    };
    const result = wrapColorANSI('test', style);
    expect(result).toContain('\u001B[');
    expect(result).toContain('test');
    expect(result).toContain('\u001B[39m');
  });

  it('应该支持前景色', () => {
    const style: LogColorStyle = {
      contentColor: [255, 0, 0] as ColorHex
    };
    const result = wrapColorANSI('hello', style);
    expect(result).toContain('38;5;');
    expect(result).toContain('hello');
  });

  it('应该支持背景色', () => {
    const style: LogColorStyle = {
      backgroundColor: [0, 255, 0] as ColorHex
    };
    const result = wrapColorANSI('world', style);
    expect(result).toContain('48;5;');
    expect(result).toContain('world');
  });

  it('应该同时支持前景色和背景色', () => {
    const style: LogColorStyle = {
      contentColor: [255, 0, 0] as ColorHex,
      backgroundColor: [0, 0, 255] as ColorHex
    };
    const result = wrapColorANSI('test', style);
    expect(result).toContain('38;5;'); // 前景色
    expect(result).toContain('48;5;'); // 背景色
    expect(result).toContain('test');
  });

  it('应该在没有颜色样式时返回原始内容', () => {
    const style: LogColorStyle = {};
    const result = wrapColorANSI('test', style);
    expect(result).toBe('test');
  });

  it('应该处理数字内容', () => {
    const style: LogColorStyle = {
      contentColor: [255, 255, 0] as ColorHex
    };
    const result = wrapColorANSI(123, style);
    expect(result).toContain('123');
    expect(result).toContain('\u001B[');
  });

  it('应该处理对象内容', () => {
    const style: LogColorStyle = {
      contentColor: [0, 255, 255] as ColorHex
    };
    const obj = { a: 1 };
    const result = wrapColorANSI(obj, style);
    expect(result).toContain('[object Object]');
  });

  it('应该正确关闭 ANSI 转义序列', () => {
    const style: LogColorStyle = {
      contentColor: [255, 0, 0] as ColorHex
    };
    const result = wrapColorANSI('test', style);
    // 应该以重置序列结尾
    expect(result.endsWith('\u001B[39m')).toBe(true);
  });

  it('应该处理黑色', () => {
    const style: LogColorStyle = {
      contentColor: [0, 0, 0] as ColorHex
    };
    const result = wrapColorANSI('black', style);
    expect(result).toContain('black');
    expect(result).toContain('\u001B[');
  });

  it('应该处理白色', () => {
    const style: LogColorStyle = {
      contentColor: [255, 255, 255] as ColorHex
    };
    const result = wrapColorANSI('white', style);
    expect(result).toContain('white');
    expect(result).toContain('\u001B[');
  });
});
