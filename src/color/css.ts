/**
 * @fileoverview CSS 颜色包装模块
 * @module color/css
 * @description 提供浏览器控制台使用的 CSS 颜色样式包装功能
 */

import { type ColorHex, type LogColorStyle } from './define';

/**
 * 将 RGB 颜色值转换为十六进制字符串
 * @function toHexString
 * @param {ColorHex} rgb - RGB 颜色值三元组
 * @returns {string} 十六进制颜色字符串（如 '#ff0000'）
 * @description 将 RGB 三元组转换为 CSS 颜色格式的十六进制字符串
 * @private
 * @example
 * toHexString([255, 0, 0]) // '#ff0000'
 * toHexString([0, 128, 255]) // '#0080ff'
 */
const toHexString = (rgb: ColorHex) =>
  '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');

/**
 * 使用 CSS 颜色样式包装内容（用于浏览器控制台）
 * @function wrapColorCSS
 * @param {unknown} content - 要包装的内容
 * @param {LogColorStyle} style - 颜色样式配置
 * @param {ColorHex} [style.backgroundColor] - 背景颜色
 * @param {ColorHex} [style.contentColor] - 内容颜色
 * @returns {[string, string]} 返回一个元组，第一个元素是带 %c 标记的内容，第二个元素是 CSS 样式字符串
 * @description 生成浏览器控制台可用的 CSS 样式字符串，使用 console.log 的 %c 格式化功能
 * @example
 * const [content, style] = wrapColorCSS('Hello', {
 *   contentColor: [255, 0, 0],
 *   backgroundColor: [0, 0, 0]
 * });
 * console.log(content, style);
 * // 输出：红色文字，黑色背景的 "Hello"
 */
export const wrapColorCSS = (
  content: unknown,
  { backgroundColor, contentColor }: LogColorStyle
): [string, string] => {
  return [
    '%c' + content,
    [
      contentColor && `color: ${toHexString(contentColor)};`,
      backgroundColor && `background-color: ${toHexString(backgroundColor)};`
    ]
      .filter(Boolean)
      .join(' ')
  ];
};
