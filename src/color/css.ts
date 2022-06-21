import { ColorHex, LogColorStyle } from './define';

export function wrapColorCSS(content: unknown, { backgroundColor, contentColor }: LogColorStyle) {
  return [
    '%c' + content,
    [
      contentColor && `color: ${toHexString(contentColor)};`,
      backgroundColor && `background-color: ${toHexString(backgroundColor)};`,
    ]
      .filter(Boolean)
      .join(' '),
  ];
}

const toHexString = (rgb: ColorHex) => '#' + rgb.map((c) => c.toString(16)).join('');
