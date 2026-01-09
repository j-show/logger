<p align="center">
	<a href="https://jshow.org" target="_blank">
		<img width="100" src="https://jshow.org/images/jshow.png" alt="jShow logo" />
	</a>
</p>
<h1 align="center">@jshow/logger</h1>

<p align="center">
	<a href="./README_CN.md">中文</a> | <a href="./README.md">English</a>
</p>

[![pro-ci]][pro-travisci]
[![pro-co]][pro-codecov]
[![pro-dm]][pro-npm]
[![pro-ver]][pro-npm]

[![pro-lic]][pro-npm]
[![pro-ct]][pro-chat]

[pro-github]: https://github.com/j-show/logger
[pro-npm]: https://npmjs.com/package/@jshow/logger
[pro-chat]: https://gitter.im/j-show/logger
[pro-travisci]: https://travis-ci.org/j-show/logger
[pro-codecov]: https://codecov.io/github/j-show/logger?branch=master
[pro-issue]: https://github.com/j-show/logger/issues

[pro-ci]: https://img.shields.io/travis/j-show/logger/master.svg
[pro-co]: https://img.shields.io/codecov/c/github/j-show/logger/master.svg
[pro-ver]: https://img.shields.io/npm/v/@jshow/logger.svg
[pro-lic]: https://img.shields.io/npm/l/@jshow/logger.svg
[pro-dm]: https://img.shields.io/npm/dm/@jshow/logger.svg
[pro-ct]: https://img.shields.io/gitter/room/j-show/logger.svg

---

# 简介

`@jshow/logger` 是一个功能强大、灵活且功能丰富的 TypeScript/JavaScript 应用程序日志记录库。它提供了简洁的 API，支持结构化日志记录，包括命名空间、标签、额外信息和可自定义的输出格式。

## 特性

- 🎯 **多日志级别**：支持 `error`、`warn`、`info` 和 `debug` 四个级别
- 🏷️ **命名空间支持**：使用分层命名空间按模块或功能组织日志
- 🏷️ **标签和额外信息**：为日志添加结构化元数据，便于过滤和分析
- 🎨 **颜色支持**：在 Node.js（ANSI）和浏览器（CSS）环境中提供美观的彩色输出
- 📝 **灵活的输出格式**：支持文本和 JSON 两种输出格式
- 🔧 **高度可配置**：自定义转换器、过滤器和钩子函数，满足高级使用场景
- 🪝 **钩子支持**：在日志输出后执行自定义逻辑（例如，发送到监控系统）
- 🚫 **过滤功能**：内置支持通过 `DEBUG_IGNORE` 环境变量按命名空间过滤日志
- 🔍 **TypeScript**：完整的 TypeScript 支持，提供全面的类型定义
- 🌐 **跨平台**：同时支持 Node.js 和浏览器环境
- ⚡ **轻量级**：依赖最少，针对性能进行了优化

---

# Supporting

jShow 是一个 MIT 许可的开源项目，其持续开发完全依赖于这些优秀的[支持者](https://github.com/j-show/jShow/blob/master/BACKERS.md)的支持。如果您想加入他们，请考虑：

- [在 Patreon 上成为支持者或赞助商](https://www.patreon.com/jshow)
- [在 Open Collective 上成为支持者或赞助商](https://opencollective.com/jshow)

### Patreon 和 OpenCollective 有什么区别？

通过 Patreon 捐赠的资金直接用于支持 [@jshow/logger][pro-github] 在 jShow 上的全职工作。通过 OpenCollective 捐赠的资金以透明的费用管理，将用于补偿核心团队成员的工作和费用，或赞助社区活动。通过在任一平台上捐赠，您的姓名/徽标将获得适当的认可和曝光。

---

# 安装

```bash
npm install @jshow/logger
# or
pnpm add @jshow/logger
# or
yarn add @jshow/logger
```

## 要求

- Node.js >= 14（Node.js 环境）
- 支持 ES6+ 的现代浏览器（浏览器环境）
- TypeScript >= 4.0（可选，用于 TypeScript 项目）

---

# Quick Start

```typescript
import { configure, logger } from '@jshow/logger';

// 配置日志记录器（只需要在应用启动时调用一次）
configure();

// 使用不同级别的日志
logger.error('这是一个错误消息');
logger.warn('这是一个警告消息');
logger.info('这是一个信息消息');
logger.debug('这是一个调试消息');
```

---

# Basic Usage

## Log Levels

`@jshow/logger` 支持四种日志级别，按严重程度从高到低：

- `error` - 错误级别
- `warn` - 警告级别
- `info` - 信息级别（默认）
- `debug` - 调试级别

```typescript
logger.error('错误信息');
logger.warn('警告信息');
logger.info('信息消息');
logger.debug('调试信息');
```

## Namespace

使用命名空间来组织和分类日志：

```typescript
// 创建带命名空间的日志记录器
const appLogger = logger.fork({ namespace: 'app' });
appLogger.info('应用启动');

const dbLogger = logger.fork({ namespace: 'database' });
dbLogger.info('数据库连接成功');

// 嵌套命名空间
const apiLogger = logger.fork({ namespace: 'api' });
const userApiLogger = apiLogger.fork({ namespace: 'user' });
userApiLogger.info('获取用户信息');
```

## Scope

使用 `scope` 方法在特定上下文中执行代码：

```typescript
logger.scope({ namespace: 'request' }, log => {
  log.info('处理请求开始');
  log.info('处理请求中...');
  log.info('处理请求完成');
});
```

---

# Advanced Features

## Tags

使用标签（tags）对日志进行分类和过滤：

```typescript
const taggedLogger = logger.fork({
  namespace: 'payment',
  tags: { module: 'payment', version: '1.0.0' }
});

taggedLogger.info('处理支付请求', { amount: 100, currency: 'USD' });
```

## Extra Information

使用额外信息（extra）添加结构化数据：

```typescript
const loggerWithExtra = logger.fork({
  namespace: 'api',
  extra: { requestId: 'req-123', userId: 'user-456' }
});

loggerWithExtra.info('API 请求处理');
```

## Dynamic Log Level

动态设置日志级别：

```typescript
const debugLogger = logger.fork({ namespace: 'debug' });
debugLogger.setLevel('debug');
debugLogger.debug('这条调试信息会显示');
debugLogger.setLevel('info');
debugLogger.debug('这条调试信息不会显示');
```

---

# Configuration

## Basic Configuration

```typescript
import { configure, LoggerFactoryOfConsole } from '@jshow/logger';

configure(LoggerFactoryOfConsole, {
  format: 'text', // 'text' 或 'json'
  enableNamespacePrefix: true,
  enableNamespacePrefixColors: true,
  appendTagsForTextPrint: true,
  appendExtraForTextPrint: true
});
```

## JSON Format

```typescript
configure(LoggerFactoryOfConsole, {
  format: 'json'
});
```

## Custom Transformers

```typescript
configure(LoggerFactoryOfConsole, {
  format: 'text',
  transformTagsForTextPrint: (tags, context) => {
    return `[Tags: ${Object.keys(tags).join(', ')}]`;
  },
  transformExtraForTextPrint: (extra, context) => {
    return `[Extra: ${JSON.stringify(extra)}]`;
  }
});
```

## Filter

使用过滤器控制哪些日志被输出：

```typescript
configure(LoggerFactoryOfConsole, {
  filter: (namespace, tags) => {
    // 只显示 production 环境的日志
    return tags.env === 'production';
  }
});
```

## Hook

使用钩子函数在日志输出后执行自定义逻辑：

```typescript
configure(LoggerFactoryOfConsole, {
  hook: (level, context, ...messages) => {
    if (level === 'error') {
      // 发送错误到监控系统
      sendToMonitoring(level, context, messages);
    }
  }
});
```

## Global Log Level

设置全局日志级别：

```typescript
import { setLogLevel, setLogLevels } from '@jshow/logger';

// 设置单个日志级别阈值
setLogLevel('debug'); // 显示所有级别的日志
setLogLevel('info'); // 只显示 info、warn、error
setLogLevel('warn'); // 只显示 warn、error
setLogLevel('error'); // 只显示 error

// 设置多个允许的日志级别
setLogLevels('debug', 'info', 'warn', 'error'); // 显示所有级别的日志
setLogLevels('info', 'warn', 'error'); // 只显示 info、warn、error
setLogLevels('warn', 'error'); // 只显示 warn、error
setLogLevels('error'); // 只显示 error
```

## useLogger Hook

使用 `useLogger` hook 可以自动从上下文中提取命名空间创建日志记录器：

```typescript
import { useLogger } from '@jshow/logger';

// 使用字符串作为命名空间
const logger = useLogger('UserService');
logger.info('用户已创建'); // 输出: [UserService] 用户已创建

// 使用类作为上下文
class UserService {
  constructor() {
    this.logger = useLogger(this);
  }
}
// logger 的命名空间将是 'UserService'

// 使用函数作为上下文
function handleRequest() {
  const logger = useLogger(handleRequest);
  logger.debug('处理请求中');
}
// logger 的命名空间将是 'handleRequest'
```

### 使用 DEBUG_IGNORE 过滤日志

您可以使用 `DEBUG_IGNORE` 环境变量来过滤掉特定的命名空间：

```bash
# 忽略来自 UserService 和 ApiClient 命名空间的日志
DEBUG_IGNORE=UserService,ApiClient node app.js
```

当命名空间在忽略列表中时，`useLogger` 会返回一个空操作的日志记录器，不会输出任何内容。

---

# Color 模块

Color 模块提供了颜色处理和显示的工具函数：

```typescript
import { Color } from '@jshow/logger';

// 从文本生成颜色
const color = Color.makeColorHexFromText('error'); // 返回 [r, g, b]

// 反转颜色
const inverted = Color.invertHex([255, 128, 64]);

// 判断颜色是否为深色
const isDark = Color.isDarkColor([50, 50, 50]);

// 优化颜色以更好地显示日志
const optimized = Color.betterLogColor([255, 0, 0]);

// 使用 ANSI 颜色包装文本（Node.js 环境）
const ansiText = Color.wrapColorANSI('Hello', {
  contentColor: [255, 0, 0],
  backgroundColor: [0, 0, 0]
});

// 使用 CSS 颜色包装文本（浏览器环境）
const [cssContent, cssStyle] = Color.wrapColorCSS('Hello', {
  contentColor: [255, 0, 0],
  backgroundColor: [0, 0, 0]
});
```

---

# API Reference

## Logger Methods

### `logger.error(...msg: unknown[])`
记录错误级别日志

### `logger.warn(...msg: unknown[])`
记录警告级别日志

### `logger.info(...msg: unknown[])`
记录信息级别日志

### `logger.debug(...msg: unknown[])`
记录调试级别日志

### `logger.fork(context: LoggerSubContext)`
创建一个新的子日志记录器

### `logger.scope(context: LoggerSubContext, fn: (logger: Logger) => void)`
在指定上下文中执行回调函数

### `logger.setLevel(level: LogLevel)`
设置当前日志记录器的输出级别

### `logger.setLevels(...levels: LogLevel[])`
为当前日志记录器设置多个允许的日志级别

### `useLogger(ctx: string | Function | object)`
从上下文中提取命名空间创建日志记录器实例。如果命名空间在 DEBUG_IGNORE 环境变量中，则返回空操作的日志记录器。

### `setLoggerIgnore(ignore: string)`
以编程方式设置要忽略的命名空间列表。接受逗号分隔的命名空间名称字符串（不区分大小写）。

```typescript
import { setLoggerIgnore } from '@jshow/logger';

// 忽略来自 UserService 和 ApiClient 命名空间的日志
setLoggerIgnore('UserService,ApiClient');
```

## Functions

### `setLogLevel(level: LogLevel)`
设置全局日志级别阈值

### `setLogLevels(...levels: LogLevel[])`
设置全局允许的日志级别列表

### `useLogger(ctx: string | Function | object)`
从上下文中提取命名空间创建日志记录器

### `setLoggerIgnore(ignore: string)`
以编程方式设置要忽略的命名空间列表

## Types

### `LogLevel`
```typescript
type LogLevel = 'error' | 'warn' | 'info' | 'debug';
```

### `LoggerContext`
```typescript
interface LoggerContext {
  tags?: { [x: string]: unknown };
  extra?: { [x: string]: string | number | boolean | undefined | null };
  namespace?: string[];
  readonly config: LoggerConfig;
}
```

### `LoggerConfig`
```typescript
interface LoggerConfig {
  readonly format: 'text' | 'json';
  readonly enableNamespacePrefix: boolean;
  readonly enableNamespacePrefixColors: boolean;
  readonly appendTagsForTextPrint: boolean;
  readonly appendExtraForTextPrint: boolean;
  readonly transformTagsForTextPrint?: (tags, context) => unknown;
  readonly transformExtraForTextPrint?: (extra, context) => unknown;
  readonly filter?: (namespace, tags) => boolean;
  readonly hook?: (level, context, ...messages) => void;
}
```

---

# 最佳实践

1. **在启动时配置一次**：只在应用启动时调用一次 `configure()`
2. **使用命名空间**：使用命名空间按功能或模块组织日志
3. **使用标签进行过滤**：使用标签对日志进行分类，以便后续过滤
4. **使用额外信息存储上下文**：使用额外信息存储结构化数据，如请求 ID
5. **设置适当的日志级别**：在不同环境中使用 `setLogLevel()` 或 `setLogLevels()` 来控制详细程度
6. **使用钩子进行监控**：实现钩子函数将关键日志发送到监控系统
7. **在生产环境使用过滤器**：使用过滤器减少生产环境中的日志噪音
8. **使用 TypeScript**：充分利用完整的 TypeScript 支持，获得更好的类型安全和 IDE 自动补全
9. **利用 useLogger**：使用 `useLogger` 钩子从类和函数中自动提取命名空间
10. **基于环境的配置**：为开发、预发布和生产环境使用不同的配置

---

# Examples

更多使用示例请查看 [examples](./examples/) 目录：

- [基础使用示例](./examples/basic.ts)
- [高级功能示例](./examples/advanced.ts)
- [配置示例](./examples/configuration.ts)
- [颜色功能示例](./examples/color.ts)
- [真实场景示例](./examples/real-world.ts)

---

# 环境变量

## DEBUG_IGNORE

逗号分隔的命名空间名称列表（不区分大小写），用于忽略。使用 `useLogger` 时，命名空间在此列表中的日志记录器将返回空操作的日志记录器。

```bash
DEBUG_IGNORE=UserService,ApiClient,Database
```

您也可以通过编程方式设置：

```typescript
import { setLoggerIgnore } from '@jshow/logger';

setLoggerIgnore('UserService,ApiClient,Database');
```

---

# TypeScript 支持

`@jshow/logger` 使用 TypeScript 编写，开箱即用提供完整的类型定义。所有 API 都完全类型化，提供出色的 IDE 自动补全和类型安全。

```typescript
import { logger, type Logger, type LogLevel } from '@jshow/logger';

// 所有方法都完全类型化
const appLogger: Logger = logger.fork({ namespace: 'app' });
const level: LogLevel = 'info';
```

---

# 浏览器支持

该库同时支持 Node.js 和浏览器环境：

- **Node.js**：使用 ANSI 颜色代码进行终端输出
- **浏览器**：使用 CSS 样式进行控制台输出（与浏览器 DevTools 兼容）

相同的 API 在两个环境中都可以工作，无需任何代码更改。

---

# 性能

`@jshow/logger` 在设计时考虑了性能：

- 当日志被过滤时开销最小
- 高效的命名空间和上下文管理
- 被忽略命名空间的空操作日志记录器零开销
- 安全的 JSON 序列化高效处理循环引用

---

# 贡献

欢迎贡献！请随时提交 Pull Request。对于重大更改，请先打开一个 issue 来讨论您想要更改的内容。

---

# Questions

该仓库的 [issue](https://github.com/j-show/logger/issues) 列表**仅**用于错误报告和功能请求。

---

# License

[MIT](http://opensource.org/licenses/MIT)

---

**Copyright (c) 2022 jShow.org**

