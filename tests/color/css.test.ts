/**
 * @fileoverview color/css 模块测试用例
 */

import { describe, expect, it } from 'vitest';

import { wrapColorCSS } from '../../src/color/css';
import type { ColorHex, LogColorStyle } from '../../src/color/define';

describe('wrapColorCSS', () => {
  it('应该返回包含 %c 标记和样式的元组', () => {
    const style: LogColorStyle = {
      contentColor: [255, 0, 0] as ColorHex
    };
    const [content, css] = wrapColorCSS('test', style);
    expect(content).toContain('%c');
    expect(content).toContain('test');
    expect(css).toContain('color:');
  });

  it('应该支持前景色', () => {
    const style: LogColorStyle = {
      contentColor: [255, 0, 0] as ColorHex
    };
    const [content, css] = wrapColorCSS('hello', style);
    expect(content).toBe('%chello');
    expect(css).toContain('color: #ff0000');
  });

  it('应该支持背景色', () => {
    const style: LogColorStyle = {
      backgroundColor: [0, 255, 0] as ColorHex
    };
    const [content, css] = wrapColorCSS('world', style);
    expect(content).toBe('%cworld');
    expect(css).toContain('background-color: #00ff00');
  });

  it('应该同时支持前景色和背景色', () => {
    const style: LogColorStyle = {
      contentColor: [255, 0, 0] as ColorHex,
      backgroundColor: [0, 0, 255] as ColorHex
    };
    const [content, css] = wrapColorCSS('test', style);
    expect(content).toBe('%ctest');
    expect(css).toContain('color: #ff0000');
    expect(css).toContain('background-color: #0000ff');
  });

  it('应该在没有颜色样式时返回空样式字符串', () => {
    const style: LogColorStyle = {};
    const [content, css] = wrapColorCSS('test', style);
    expect(content).toBe('%ctest');
    expect(css).toBe('');
  });

  it('应该正确格式化十六进制颜色', () => {
    const style: LogColorStyle = {
      contentColor: [0, 128, 255] as ColorHex
    };
    const [, css] = wrapColorCSS('test', style);
    expect(css).toContain('#0080ff');
  });

  it('应该处理单数字颜色值（补零）', () => {
    const style: LogColorStyle = {
      contentColor: [0, 15, 255] as ColorHex
    };
    const [, css] = wrapColorCSS('test', style);
    expect(css).toContain('#000fff');
  });

  it('应该处理黑色', () => {
    const style: LogColorStyle = {
      contentColor: [0, 0, 0] as ColorHex
    };
    const [, css] = wrapColorCSS('black', style);
    expect(css).toContain('#000000');
  });

  it('应该处理白色', () => {
    const style: LogColorStyle = {
      contentColor: [255, 255, 255] as ColorHex
    };
    const [, css] = wrapColorCSS('white', style);
    expect(css).toContain('#ffffff');
  });

  it('应该处理数字内容', () => {
    const style: LogColorStyle = {
      contentColor: [255, 255, 0] as ColorHex
    };
    const [content, css] = wrapColorCSS(123, style);
    expect(content).toContain('%c');
    expect(content).toContain('123');
    expect(css).toContain('color:');
  });

  it('应该处理对象内容', () => {
    const style: LogColorStyle = {
      contentColor: [0, 255, 255] as ColorHex
    };
    const obj = { a: 1 };
    const [content] = wrapColorCSS(obj, style);
    expect(content).toContain('%c');
    expect(content).toContain('[object Object]');
  });
});
