/* eslint-disable no-fallthrough */
import { ColorHex } from './define';

export const makeColorHexFromText = (text: string): ColorHex => {
  let v = 0;
  if (text.length === 0) return [0, 0, 0];
  const meshed = hash(text, 9471).toString();
  for (let i = 0; i < meshed.length; i++) {
    v = meshed.charCodeAt(i) + ((v << 5) - v);
    v = v & v;
  }
  const rgb: ColorHex = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const value = (v >> (i * 8)) & 255;
    rgb[i] = value;
  }
  return rgb;
};

export const invertHex = (rgb: ColorHex) => rgb.map((c) => 255 - c) as ColorHex;

export const isDarkColor = ([r, g, b]: ColorHex) => r * 0.299 + g * 0.587 + b * 0.114 > 186;

function hash(str: string, seed: number) {
  let l = str.length,
    h = seed ^ l,
    i = 0,
    k: number;

  while (l >= 4) {
    k =
      (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(++i) & 0xff) << 8) |
      ((str.charCodeAt(++i) & 0xff) << 16) |
      ((str.charCodeAt(++i) & 0xff) << 24);

    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);
    k ^= k >>> 24;
    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);

    h = ((h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

    l -= 4;
    ++i;
  }

  switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      h ^= str.charCodeAt(i) & 0xff;
      h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
      break;
  }

  h ^= h >>> 13;
  h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  h ^= h >>> 15;

  return h >>> 0;
}
