/**
 * @fileoverview 友好的颜色处理模块
 * @module color/friendly
 * @description 提供颜色优化功能，使生成的颜色更适合日志显示
 */

import { invertHex } from './calculation';
import { type ColorHex } from './define';

/**
 * 优化颜色值，使其更适合日志显示
 * @function betterLogColor
 * @param {ColorHex} color - 原始 RGB 颜色值
 * @returns {ColorHex} 优化后的 RGB 颜色值
 * @description 对颜色进行优化处理：
 * 1. 减少红色分量，避免与错误信息的红色混淆
 * 2. 对于接近灰黑色的颜色进行反转，提高可读性
 * @example
 * betterLogColor([255, 100, 100]) // 降低红色分量
 * betterLogColor([10, 10, 10]) // 反转成亮色以提高可读性
 */
export const betterLogColor = (color: ColorHex): ColorHex => {
  let rgb: ColorHex = [...color];

  // 保证出色尽可能少 R，防止疑似警觉色干扰错误信息
  // 如果红色分量大于绿色或蓝色分量，则逐步降低红色分量
  while (rgb[0] > rgb[1] || rgb[0] > rgb[2]) {
    rgb[0] = Math.floor(rgb[0] / 2);
  }

  // 善待眼睛，近灰黑的颜色做反转
  // 如果颜色接近灰黑色（平均亮度低且各分量接近），则反转颜色以提高可读性
  const avg = rgb.reduce((a, b) => a + b, 0) / rgb.length;
  if (
    avg < 64 &&
    Math.abs(rgb[0] - avg) < 32 &&
    Math.abs(rgb[1] - avg) < 32 &&
    Math.abs(rgb[2] - avg) < 32
  ) {
    rgb = invertHex(rgb);
  }

  return rgb;
};
