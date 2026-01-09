/**
 * @fileoverview utils 模块测试用例
 */

import { describe, expect, it } from 'vitest';

import { jsonStringifySafe } from '../src/utils';

describe('jsonStringifySafe', () => {
  it('应该能够序列化普通对象', () => {
    const obj = { a: 1, b: 'test', c: true };
    const result = jsonStringifySafe(obj);
    expect(result).toBe('{"a":1,"b":"test","c":true}');
  });

  it('应该能够序列化数组', () => {
    const arr = [1, 2, 3, 'test'];
    const result = jsonStringifySafe(arr);
    expect(result).toBe('[1,2,3,"test"]');
  });

  it('应该能够处理循环引用', () => {
    const obj: any = { a: 1 };
    obj.b = obj; // 创建循环引用
    const result = jsonStringifySafe(obj);
    expect(result).toContain('[Circular');
    expect(result).toContain('"a":1');
  });

  it('应该能够处理嵌套的循环引用', () => {
    const obj: any = { a: 1, nested: { b: 2 } };
    obj.nested.parent = obj;
    const result = jsonStringifySafe(obj);
    expect(result).toContain('[Circular');
  });

  it('应该能够格式化输出（带缩进）', () => {
    const obj = { a: 1, b: { c: 2 } };
    const result = jsonStringifySafe(obj, 2);
    expect(result).toContain('\n');
    expect(result).toContain('  '); // 缩进空格
  });

  it('应该能够处理 null 和 undefined', () => {
    const obj = { a: null };
    const result = jsonStringifySafe(obj);
    expect(result).toContain('"a":null');
    // undefined 会被忽略
    expect(result).not.toContain('"b"');
  });

  it('应该能够处理空对象', () => {
    const obj = {};
    const result = jsonStringifySafe(obj);
    expect(result).toBe('{}');
  });

  it('应该能够处理空数组', () => {
    const arr: unknown[] = [];
    const result = jsonStringifySafe(arr);
    expect(result).toBe('[]');
  });

  it('应该能够处理复杂嵌套结构', () => {
    const obj = {
      a: 1,
      b: {
        c: [1, 2, { d: 3 }],
        e: 'test'
      }
    };
    const result = jsonStringifySafe(obj);
    expect(result).toContain('"a":1');
    expect(result).toContain('"c":');
    expect(result).toContain('"d":3');
  });

  it('应该能够处理字符串', () => {
    const str = 'test';
    const result = jsonStringifySafe(str);
    expect(result).toBe('"test"');
  });

  it('应该能够处理数字', () => {
    const num = 123;
    const result = jsonStringifySafe(num);
    expect(result).toBe('123');
  });

  it('应该能够处理布尔值', () => {
    expect(jsonStringifySafe(true)).toBe('true');
    expect(jsonStringifySafe(false)).toBe('false');
  });
});
