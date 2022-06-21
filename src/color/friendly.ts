import { invertHex } from './calculation';
import { ColorHex } from './define';

export const betterLogColor = (rgb: ColorHex) => {
  // 保证出色尽可能少 R，防止疑似警觉色干扰错误信息
  while (rgb[0] > rgb[1] || rgb[0] > rgb[2]) {
    rgb[0] = Math.floor(rgb[0] / 2);
  }
  // 善待眼睛，近灰黑的颜色做反转
  const avg = rgb.reduce((a, b) => a + b, 0) / rgb.length;
  if (avg < 64 && Math.abs(rgb[0] - avg) < 32 && Math.abs(rgb[1] - avg) < 32 && Math.abs(rgb[2] - avg) < 32) {
    rgb = invertHex(rgb);
  }
  return rgb;
};
