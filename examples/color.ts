/**
 * @fileoverview 颜色功能使用示例
 * @description 展示颜色相关的功能
 */

import { Color, configure, logger } from '../src';

// 配置日志记录器
configure();

// 颜色模块提供了多种颜色处理功能

// 1. 从文本生成颜色
const color1 = Color.makeColorHexFromText('error');
const color2 = Color.makeColorHexFromText('warn');
const color3 = Color.makeColorHexFromText('info');

console.log('从文本生成的颜色:');
console.log('error:', color1); // [r, g, b]
console.log('warn:', color2);
console.log('info:', color3);

// 2. 反转颜色
const originalColor: Color.ColorHex = [255, 128, 64];
const invertedColor = Color.invertHex(originalColor);
console.log('原始颜色:', originalColor);
console.log('反转颜色:', invertedColor);

// 3. 判断颜色明暗
const isDark = Color.isDarkColor([50, 50, 50]);
const isLight = Color.isDarkColor([200, 200, 200]);
console.log('深色判断:', isDark);
console.log('浅色判断:', isLight);

// 4. 优化颜色（用于日志显示）
const optimizedColor = Color.betterLogColor([255, 0, 0]); // 纯红色会被优化
console.log('优化后的颜色:', optimizedColor);

// 5. ANSI 颜色包装（Node.js 环境）
const ansiWrapped = Color.wrapColorANSI('Hello', {
  contentColor: [255, 0, 0],
  backgroundColor: [0, 0, 0]
});
console.log('ANSI 包装:', ansiWrapped);

// 6. CSS 颜色包装（浏览器环境）
const [cssContent, cssStyle] = Color.wrapColorCSS('Hello', {
  contentColor: [255, 0, 0],
  backgroundColor: [0, 0, 0]
});
console.log('CSS 内容:', cssContent);
console.log('CSS 样式:', cssStyle);
// 在浏览器中可以使用: console.log(cssContent, cssStyle);

// 实际使用：不同命名空间会自动生成不同颜色
const errorLogger = logger.fork({ namespace: 'error' });
const warnLogger = logger.fork({ namespace: 'warn' });
const infoLogger = logger.fork({ namespace: 'info' });
const debugLogger = logger.fork({ namespace: 'debug' });

errorLogger.error('错误日志（红色命名空间）');
warnLogger.warn('警告日志（黄色命名空间）');
infoLogger.info('信息日志（蓝色命名空间）');
debugLogger.debug('调试日志（绿色命名空间）');
