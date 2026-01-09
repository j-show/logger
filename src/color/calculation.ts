/**
 * @fileoverview 颜色计算工具模块
 * @module color/calculation
 * @description 提供颜色相关的计算函数，包括从文本生成颜色、颜色反转、判断颜色明暗等
 */

/* eslint-disable no-fallthrough */
import { type ColorHex } from './define';

/** MurmurHash 算法的常量 K */
const KV = 0x5bd1e995;

/** 8 位掩码 */
const MASK_2 = 0xff;
/** 16 位掩码 */
const MASK_4 = 0xffff;

/**
 * 字符串哈希函数（基于 MurmurHash 算法）
 * @function hash
 * @param {string} str - 要哈希的字符串
 * @param {number} seed - 哈希种子值
 * @returns {number} 哈希值（无符号 32 位整数）
 * @description 使用 MurmurHash 算法计算字符串的哈希值
 * @private
 */
const hash = (str: string, seed: number): number => {
  let l = str.length,
    h = seed ^ l,
    i = 0,
    k: number;

  // 每次处理 4 个字符
  while (l >= 4) {
    k =
      (str.charCodeAt(i) & MASK_2) |
      ((str.charCodeAt(++i) & MASK_2) << 8) |
      ((str.charCodeAt(++i) & MASK_2) << 16) |
      ((str.charCodeAt(++i) & MASK_2) << 24);

    k = (k & MASK_4) * KV + ((((k >>> 16) * KV) & MASK_4) << 16);
    k ^= k >>> 24;
    k = (k & MASK_4) * KV + ((((k >>> 16) * KV) & MASK_4) << 16);

    h = ((h & MASK_4) * KV + ((((h >>> 16) * KV) & MASK_4) << 16)) ^ k;

    l -= 4;
    ++i;
  }

  // 处理剩余的字符
  switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & MASK_2) << 16;
    case 2:
      h ^= (str.charCodeAt(i + 1) & MASK_2) << 8;
    case 1:
      h ^= str.charCodeAt(i) & MASK_2;
      h = (h & MASK_4) * KV + ((((h >>> 16) * KV) & MASK_4) << 16);
      break;
  }

  // 最终混合
  h ^= h >>> 13;
  h = (h & MASK_4) * KV + ((((h >>> 16) * KV) & MASK_4) << 16);
  h ^= h >>> 15;

  return h >>> 0;
};

/**
 * 从文本生成 RGB 颜色值
 * @function makeColorHexFromText
 * @param {string} text - 输入文本
 * @returns {ColorHex} RGB 颜色值三元组
 * @description 基于文本内容生成一个确定的 RGB 颜色值，相同文本总是生成相同颜色
 * @example
 * makeColorHexFromText('error') // 返回一个固定的 RGB 颜色值
 * makeColorHexFromText('warn')  // 返回另一个固定的 RGB 颜色值
 */
export const makeColorHexFromText = (text: string): ColorHex => {
  let v = 0;

  if (text.length === 0) return [0, 0, 0];

  // 使用哈希值生成数字
  const meshed = hash(text, 9471).toString();
  for (let i = 0; i < meshed.length; i++) {
    v = meshed.charCodeAt(i) + ((v << 5) - v);
    v = v & v;
  }

  // 从数字中提取 RGB 值
  const rgb: ColorHex = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const value = (v >> (i * 8)) & 255;
    rgb[i] = value;
  }

  return rgb;
};

/**
 * 反转 RGB 颜色值
 * @function invertHex
 * @param {ColorHex} rgb - RGB 颜色值三元组
 * @returns {ColorHex} 反转后的 RGB 颜色值
 * @description 将每个颜色分量取反（255 - 原值）
 * @example
 * invertHex([255, 0, 0]) // [0, 255, 255]
 * invertHex([0, 128, 255]) // [255, 127, 0]
 */
export const invertHex = (rgb: ColorHex) => rgb.map(c => 255 - c) as ColorHex;

/**
 * 判断颜色是否为深色
 * @function isDarkColor
 * @param {ColorHex} rgb - RGB 颜色值三元组
 * @returns {boolean} 如果颜色为深色返回 true，否则返回 false
 * @description 使用亮度公式计算颜色明暗度，阈值 186
 * @example
 * isDarkColor([0, 0, 0]) // true（黑色）
 * isDarkColor([255, 255, 255]) // false（白色）
 * isDarkColor([128, 128, 128]) // 根据亮度计算
 */
export const isDarkColor = ([r, g, b]: ColorHex) =>
  r * 0.299 + g * 0.587 + b * 0.114 > 186;
