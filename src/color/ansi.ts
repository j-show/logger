/**
 * @fileoverview ANSI 颜色转换模块
 * @module color/ansi
 * @description 提供 RGB 颜色到 ANSI 256 色编码的转换功能
 * @note 部分代码基于 https://github.com/Qix-/color-convert 和 https://github.com/chalk/ansi-styles 修改
 */

import { type ColorHex, type LogColorStyle } from './define';

/**
 * 将 RGB 颜色值转换为 ANSI 256 色编码
 * @function rgb2ansi
 * @param {ColorHex} rgb - RGB 颜色值三元组
 * @returns {number} ANSI 256 色编码值
 * @description 将 RGB 颜色转换为终端支持的 ANSI 256 色编码
 * @note 基于 https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js#L546 修改
 * @private
 */
const rgb2ansi = ([r, g, b]: ColorHex): number => {
  // 使用扩展的灰度调色板，除了黑色和白色
  // 普通调色板只有 4 种灰度阴影
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;

    return Math.round(((r - 8) / 247) * 24) + 232;
  }

  return (
    16 +
    36 * Math.round((r / 255) * 5) +
    6 * Math.round((g / 255) * 5) +
    Math.round((b / 255) * 5)
  );
};

/**
 * 使用 ANSI 256 色编码包装内容
 * @function wrapAnsi256
 * @param {unknown} content - 要包装的内容
 * @param {ColorHex} color - RGB 颜色值
 * @param {boolean} isBackground - 是否为背景色
 * @returns {string} 包装后的 ANSI 转义序列字符串
 * @description 生成 ANSI 转义序列来设置文本的前景色或背景色
 * @note 基于 https://github.com/chalk/ansi-styles/blob/c3655269ece8a364d613d4c2ff1be47571f0923e/index.js#L10 修改
 * @private
 */
const wrapAnsi256 = (
  content: unknown,
  color: ColorHex,
  isBackground: boolean
): string => {
  const offset = isBackground ? 10 : 0;

  return (
    `\u001B[${38 + offset};5;${rgb2ansi(color)}m` +
    content +
    `\u001B[${39 + offset}m`
  );
};

/**
 * 使用 ANSI 颜色样式包装内容
 * @function wrapColorANSI
 * @param {unknown} content - 要包装的内容
 * @param {LogColorStyle} style - 颜色样式配置
 * @param {ColorHex} [style.backgroundColor] - 背景颜色
 * @param {ColorHex} [style.contentColor] - 内容颜色
 * @returns {string} 包装后的 ANSI 转义序列字符串
 * @description 根据提供的颜色样式，生成包含前景色和背景色的 ANSI 转义序列
 * @example
 * wrapColorANSI('Hello', { contentColor: [255, 0, 0], backgroundColor: [0, 0, 0] })
 * // 返回带有红色文字和黑色背景的 ANSI 转义序列
 */
export const wrapColorANSI = (
  content: unknown,
  { backgroundColor, contentColor }: LogColorStyle
): string => {
  let ret = content as string;
  if (contentColor) ret = wrapAnsi256(ret, contentColor, false);
  if (backgroundColor) ret = wrapAnsi256(ret, backgroundColor, true);

  return ret;
};
