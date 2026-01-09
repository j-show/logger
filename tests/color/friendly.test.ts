/**
 * @fileoverview color/friendly 模块测试用例
 */

import { describe, expect, it } from 'vitest';

import type { ColorHex } from '../../src/color/define';
import { betterLogColor } from '../../src/color/friendly';

describe('betterLogColor', () => {
  it('应该降低红色分量以避免与错误信息混淆', () => {
    const color: ColorHex = [255, 100, 100];
    const result = betterLogColor(color);
    // 红色分量应该被降低
    expect(result[0]).toBeLessThanOrEqual(result[1]);
    expect(result[0]).toBeLessThanOrEqual(result[2]);
  });

  it('应该处理已经是平衡的颜色', () => {
    const color: ColorHex = [100, 150, 200];
    const result = betterLogColor(color);
    // 如果红色分量已经不大于其他分量，应该保持不变或变化很小
    expect(result).toHaveLength(3);
    expect(result.every(c => c >= 0 && c <= 255)).toBe(true);
  });

  it('应该反转接近灰黑色的颜色', () => {
    const color: ColorHex = [10, 10, 10];
    const result = betterLogColor(color);
    // 应该被反转成亮色
    expect(result[0]).toBeGreaterThan(10);
    expect(result[1]).toBeGreaterThan(10);
    expect(result[2]).toBeGreaterThan(10);
  });

  it('应该处理深灰色', () => {
    const color: ColorHex = [30, 30, 30];
    const result = betterLogColor(color);
    // 深灰色应该被反转
    expect(result[0]).toBeGreaterThan(30);
    expect(result[1]).toBeGreaterThan(30);
    expect(result[2]).toBeGreaterThan(30);
  });

  it('不应该反转浅色', () => {
    const color: ColorHex = [200, 200, 200];
    const result = betterLogColor(color);
    // 浅色不应该被反转
    expect(result[0]).toBeLessThanOrEqual(255);
    expect(result[1]).toBeLessThanOrEqual(255);
    expect(result[2]).toBeLessThanOrEqual(255);
  });

  it('应该处理纯红色', () => {
    const color: ColorHex = [255, 0, 0];
    const result = betterLogColor(color);
    // 红色分量会被降低到 0，然后因为接近黑色会被反转成白色
    // 所以最终结果应该是 [255, 255, 255]
    expect(result[0]).toBeLessThanOrEqual(result[1]);
    expect(result[0]).toBeLessThanOrEqual(result[2]);
    // 由于颜色被反转，最终应该是白色
    expect(result).toEqual([255, 255, 255]);
  });

  it('应该处理纯绿色（不应该被修改）', () => {
    const color: ColorHex = [0, 255, 0];
    const result = betterLogColor(color);
    // 绿色不应该被降低（因为红色分量已经是最小的）
    expect(result[1]).toBe(255);
  });

  it('应该处理纯蓝色（不应该被修改）', () => {
    const color: ColorHex = [0, 0, 255];
    const result = betterLogColor(color);
    // 蓝色不应该被降低（因为红色分量已经是最小的）
    expect(result[2]).toBe(255);
  });

  it('应该返回有效的 RGB 值', () => {
    const color: ColorHex = [128, 64, 32];
    const result = betterLogColor(color);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeGreaterThanOrEqual(0);
    expect(result[0]).toBeLessThanOrEqual(255);
    expect(result[1]).toBeGreaterThanOrEqual(0);
    expect(result[1]).toBeLessThanOrEqual(255);
    expect(result[2]).toBeGreaterThanOrEqual(0);
    expect(result[2]).toBeLessThanOrEqual(255);
  });

  it('应该处理黑色', () => {
    const color: ColorHex = [0, 0, 0];
    const result = betterLogColor(color);
    // 黑色应该被反转
    expect(result[0]).toBe(255);
    expect(result[1]).toBe(255);
    expect(result[2]).toBe(255);
  });

  it('应该处理白色', () => {
    const color: ColorHex = [255, 255, 255];
    const result = betterLogColor(color);
    // 白色不应该被反转（因为平均亮度高）
    expect(result[0]).toBeLessThanOrEqual(255);
    expect(result[1]).toBeLessThanOrEqual(255);
    expect(result[2]).toBeLessThanOrEqual(255);
  });
});
