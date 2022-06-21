import { ColorHex, LogColorStyle } from './define';

export function wrapColorANSI(content: unknown, { backgroundColor, contentColor }: LogColorStyle) {
  let ret = content;
  if (contentColor) ret = wrapAnsi256(ret, contentColor, false);
  if (backgroundColor) ret = wrapAnsi256(ret, backgroundColor, true);
  return ret;
}

/**
 * @NOTE 偷并改自 https://github.com/chalk/ansi-styles/blob/c3655269ece8a364d613d4c2ff1be47571f0923e/index.js#L10
 */
function wrapAnsi256(content: unknown, color: ColorHex, isBackground: boolean) {
  const offset = isBackground ? 10 : 0;
  return `\u001B[${38 + offset};5;${rgb2ansi(color)}m` + content + `\u001B[${39 + offset}m`;
}

/**
 * @NOTE 偷并改自 https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js#L546
 */
function rgb2ansi([r, g, b]: ColorHex) {
  // We use the extended greyscale palette here, with the exception of
  // black and white. normal palette only has 4 greyscale shades.
  if (r === g && g === b) {
    if (r < 8) {
      return 16;
    }
    if (r > 248) {
      return 231;
    }
    return Math.round(((r - 8) / 247) * 24) + 232;
  }

  return 16 + 36 * Math.round((r / 255) * 5) + 6 * Math.round((g / 255) * 5) + Math.round((b / 255) * 5);
}
