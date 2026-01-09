/**
 * @fileoverview 颜色类型定义
 * @module color/define
 */

import { type LogLevel } from '../types';

/**
 * RGB 颜色值类型
 * @typedef {[number, number, number]} ColorHex
 * @description 表示 RGB 颜色值的三元组，每个值范围 0-255
 * @example [255, 0, 0] // 红色
 * @example [0, 255, 0] // 绿色
 * @example [0, 0, 255] // 蓝色
 */
export type ColorHex = [number, number, number];

export const ColorHexDefault: { [key in LogLevel]?: ColorHex } = {
  warn: [255, 185, 0],
  error: [255, 39, 64],
  debug: [184, 211, 237]
};

/**
 * 日志颜色样式接口
 * @interface LogColorStyle
 * @description 定义日志输出的颜色样式，包括背景色和内容颜色
 */
export interface LogColorStyle {
  /** 背景颜色，RGB 三元组 */
  backgroundColor?: ColorHex;
  /** 内容颜色，RGB 三元组 */
  contentColor?: ColorHex;
}
