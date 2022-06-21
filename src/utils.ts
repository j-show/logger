/**
 * @NOTE
 * 偷并改自 https://github.com/moll/json-stringify-safe/blob/02cfafd45f06d076ac4bf0dd28be6738a07a72f9/stringify.js
 */

export function stringify(obj: unknown, spaces?: number) {
  return JSON.stringify(obj, serializer(), spaces);
}

function serializer() {
  const stack: Array<unknown> = [];
  const keys: Array<unknown> = [];
  return function (this: unknown, key: unknown, value: unknown) {
    if (stack.length > 0) {
      const thisPos = stack.indexOf(this);
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
      if (~stack.indexOf(value)) {
        if (stack[0] === value) value = `[Circular ~]`;
        value = `[Circular ~.${keys.slice(0, stack.indexOf(value)).join('.')}]`;
      }
    } else stack.push(value);
    return value;
  };
}
