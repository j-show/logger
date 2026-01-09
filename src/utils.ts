/**
 * @fileoverview JSON 安全序列化工具
 * @module utils
 * @description 提供安全的 JSON 序列化功能，能够处理循环引用
 * @note 基于 https://github.com/moll/json-stringify-safe/blob/02cfafd45f06d076ac4bf0dd28be6738a07a72f9/stringify.js 修改
 */

/**
 * 创建 JSON 序列化器，用于处理循环引用
 * @function serializer
 * @returns {function} JSON.stringify 的 replacer 函数
 * @description 返回一个函数，用于在 JSON.stringify 过程中检测和处理循环引用
 * @private
 */
function serializer() {
  /** 用于跟踪对象引用的堆栈 */
  const stack: Array<unknown> = [];
  /** 用于跟踪对象键的堆栈 */
  const keys: Array<unknown> = [];

  /**
   * JSON.stringify 的 replacer 函数
   * @param {unknown} this - 当前对象
   * @param {unknown} key - 当前键
   * @param {unknown} value - 当前值
   * @returns {unknown} 处理后的值
   */
  return function (this: unknown, key: unknown, value: unknown) {
    let result = value;

    if (stack.length > 0) {
      const thisPos = stack.indexOf(this);
      const nbitPos = ~thisPos;

      if (nbitPos) {
        stack.splice(thisPos + 1);
        keys.splice(thisPos, Infinity, key);
      } else {
        stack.push(this);
        keys.push(key);
      }

      // 检测循环引用
      if (~stack.indexOf(result)) {
        if (stack[0] === result) result = `[Circular ~]`;
        result = `[Circular ~.${keys.slice(0, stack.indexOf(result)).join('.')}]`;
      }
    } else {
      stack.push(result);
    }

    return result;
  };
}

/**
 * 安全地将对象序列化为 JSON 字符串，能够处理循环引用
 * @function jsonStringifySafe
 * @param {unknown} obj - 要序列化的对象
 * @param {number} [spaces] - 缩进空格数，用于格式化输出
 * @returns {string} 序列化后的 JSON 字符串
 * @description 类似于 JSON.stringify，但能够安全处理包含循环引用的对象
 * @example
 * const obj: any = { a: 1 };
 * obj.b = obj; // 创建循环引用
 * jsonStringifySafe(obj); // '{"a":1,"b":"[Circular ~]"}'
 */
export const jsonStringifySafe = (obj: unknown, spaces?: number) => {
  return JSON.stringify(obj, serializer(), spaces);
};
