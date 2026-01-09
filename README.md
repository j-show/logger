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

# Introduction

`@jshow/logger` is a powerful, flexible, and feature-rich logging library for TypeScript/JavaScript applications. It provides a clean API for structured logging with support for namespaces, tags, extra information, and customizable output formats.

## Features

- 🎯 **Multiple Log Levels**: Support for `error`, `warn`, `info`, and `debug` levels
- 🏷️ **Namespace Support**: Organize logs by module or feature using hierarchical namespaces
- 🏷️ **Tags & Extra Info**: Add structured metadata to logs for better filtering and analysis
- 🎨 **Color Support**: Beautiful colored output in both Node.js (ANSI) and Browser (CSS) environments
- 📝 **Flexible Output**: Support for both text and JSON output formats
- 🔧 **Highly Configurable**: Custom transformers, filters, and hooks for advanced use cases
- 🪝 **Hooks Support**: Execute custom logic after log output (e.g., send to monitoring systems)
- 🚫 **Filtering**: Built-in support for filtering logs by namespace using `DEBUG_IGNORE` environment variable
- 🔍 **TypeScript**: Full TypeScript support with comprehensive type definitions
- 🌐 **Cross-Platform**: Works in both Node.js and Browser environments
- ⚡ **Lightweight**: Minimal dependencies, optimized for performance

---

# Supporting

jShow is an MIT-Licensed open source project with its ongoing development made possible entirely by the support of these awesome [backers](https://github.com/j-show/jShow/blob/master/BACKERS.md). If you'd like to join them, please consider:

- [Become a backer or sponsor on Patreon](https://www.patreon.com/jshow).
- [Become a backer or sponsor on Open Collective](https://opencollective.com/jshow).

### What's the difference between Patreon and OpenCollective?

Funds donated via Patreon go directly to support [@jshow/logger][pro-github] You's full-time work on jShow. Funds donated via OpenCollective are managed with transparent expenses and will be used for compensating work and expenses for core team members or sponsoring community events. Your name/logo will receive proper recognition and exposure by donating on either platform.

---


---

# Installation

```bash
npm install @jshow/logger
# or
pnpm add @jshow/logger
# or
yarn add @jshow/logger
```

## Requirements

- Node.js >= 14 (for Node.js environment)
- Modern browsers with ES6+ support (for browser environment)
- TypeScript >= 4.0 (optional, for TypeScript projects)

---

# Quick Start

```typescript
import { configure, logger } from '@jshow/logger';

// Configure the logger (only need to call once at application startup)
configure();

// Use different log levels
logger.error('This is an error message');
logger.warn('This is a warning message');
logger.info('This is an info message');
logger.debug('This is a debug message');
```

---

# Basic Usage

## Log Levels

`@jshow/logger` supports four log levels, ordered by severity from high to low:

- `error` - Error level
- `warn` - Warning level
- `info` - Info level (default)
- `debug` - Debug level

```typescript
logger.error('Error message');
logger.warn('Warning message');
logger.info('Info message');
logger.debug('Debug message');
```

## Namespace

Use namespaces to organize and categorize logs:

```typescript
// Create a logger with namespace
const appLogger = logger.fork({ namespace: 'app' });
appLogger.info('Application started');

const dbLogger = logger.fork({ namespace: 'database' });
dbLogger.info('Database connected');

// Nested namespaces
const apiLogger = logger.fork({ namespace: 'api' });
const userApiLogger = apiLogger.fork({ namespace: 'user' });
userApiLogger.info('Get user information');
```

## Scope

Use the `scope` method to execute code in a specific context:

```typescript
logger.scope({ namespace: 'request' }, log => {
  log.info('Request processing started');
  log.info('Processing request...');
  log.info('Request processing completed');
});
```

---

# Advanced Features

## Tags

Use tags to categorize and filter logs:

```typescript
const taggedLogger = logger.fork({
  namespace: 'payment',
  tags: { module: 'payment', version: '1.0.0' }
});

taggedLogger.info('Processing payment request', { amount: 100, currency: 'USD' });
```

## Extra Information

Use extra information to add structured data:

```typescript
const loggerWithExtra = logger.fork({
  namespace: 'api',
  extra: { requestId: 'req-123', userId: 'user-456' }
});

loggerWithExtra.info('API request processing');
```

## Dynamic Log Level

Dynamically set log level:

```typescript
const debugLogger = logger.fork({ namespace: 'debug' });
debugLogger.setLevel('debug');
debugLogger.debug('This debug message will be shown');
debugLogger.setLevel('info');
debugLogger.debug('This debug message will not be shown');
```

---

# Configuration

## Basic Configuration

```typescript
import { configure, LoggerFactoryOfConsole } from '@jshow/logger';

configure(LoggerFactoryOfConsole, {
  format: 'text', // 'text' or 'json'
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

Use filters to control which logs are output:

```typescript
configure(LoggerFactoryOfConsole, {
  filter: (namespace, tags) => {
    // Only show logs from production environment
    return tags.env === 'production';
  }
});
```

## Hook

Use hook functions to execute custom logic after log output:

```typescript
configure(LoggerFactoryOfConsole, {
  hook: (level, context, ...messages) => {
    if (level === 'error') {
      // Send errors to monitoring system
      sendToMonitoring(level, context, messages);
    }
  }
});
```

## Global Log Level

Set global log level:

```typescript
import { setLogLevel, setLogLevels } from '@jshow/logger';

// Set a single log level threshold
setLogLevel('debug'); // Show all log levels
setLogLevel('info'); // Show only info, warn, error
setLogLevel('warn'); // Show only warn, error
setLogLevel('error'); // Show only error

// Set multiple allowed log levels
setLogLevels('debug', 'info', 'warn', 'error'); // Show all log levels
setLogLevels('info', 'warn', 'error'); // Show only info, warn, error
setLogLevels('warn', 'error'); // Show only warn, error
setLogLevels('error'); // Show only error
```

## useLogger Hook

Use the `useLogger` hook to automatically create loggers with namespaces extracted from context:

```typescript
import { useLogger } from '@jshow/logger';

// Use string as namespace
const logger = useLogger('UserService');
logger.info('User created'); // Output: [UserService] User created

// Use class as context
class UserService {
  constructor() {
    this.logger = useLogger(this);
  }
}
// logger namespace will be 'UserService'

// Use function as context
function handleRequest() {
  const logger = useLogger(handleRequest);
  logger.debug('Processing request');
}
// logger namespace will be 'handleRequest'
```

### Filtering Logs with DEBUG_IGNORE

You can filter out specific namespaces using the `DEBUG_IGNORE` environment variable:

```bash
# Ignore logs from UserService and ApiClient namespaces
DEBUG_IGNORE=UserService,ApiClient node app.js
```

When a namespace is in the ignore list, `useLogger` returns a no-op logger that won't output anything.

---

# Color Module

The Color module provides utilities for color manipulation and display:

```typescript
import { Color } from '@jshow/logger';

// Generate color from text
const color = Color.makeColorHexFromText('error'); // Returns [r, g, b]

// Invert color
const inverted = Color.invertHex([255, 128, 64]);

// Check if color is dark
const isDark = Color.isDarkColor([50, 50, 50]);

// Optimize color for better log display
const optimized = Color.betterLogColor([255, 0, 0]);

// Wrap text with ANSI colors (Node.js)
const ansiText = Color.wrapColorANSI('Hello', {
  contentColor: [255, 0, 0],
  backgroundColor: [0, 0, 0]
});

// Wrap text with CSS colors (Browser)
const [cssContent, cssStyle] = Color.wrapColorCSS('Hello', {
  contentColor: [255, 0, 0],
  backgroundColor: [0, 0, 0]
});
```

---

# API Reference

## Logger Methods

### `logger.error(...msg: unknown[])`
Log error level messages

### `logger.warn(...msg: unknown[])`
Log warning level messages

### `logger.info(...msg: unknown[])`
Log info level messages

### `logger.debug(...msg: unknown[])`
Log debug level messages

### `logger.fork(context: LoggerSubContext)`
Create a new child logger instance

### `logger.scope(context: LoggerSubContext, fn: (logger: Logger) => void)`
Execute callback function in specified context

### `logger.setLevel(level: LogLevel)`
Set the output level for current logger

### `logger.setLevels(...levels: LogLevel[])`
Set multiple allowed log levels for current logger

### `useLogger(ctx: string | Function | object)`
Create a logger instance with namespace extracted from context. Returns a no-op logger if namespace is in DEBUG_IGNORE environment variable.

### `setLoggerIgnore(ignore: string)`
Programmatically set the list of namespaces to ignore. Takes a comma-separated string of namespace names (case-insensitive).

```typescript
import { setLoggerIgnore } from '@jshow/logger';

// Ignore logs from UserService and ApiClient namespaces
setLoggerIgnore('UserService,ApiClient');
```

## Functions

### `setLogLevel(level: LogLevel)`
Set global log level threshold

### `setLogLevels(...levels: LogLevel[])`
Set global allowed log levels

### `useLogger(ctx: string | Function | object)`
Create a logger with namespace extracted from context

### `setLoggerIgnore(ignore: string)`
Programmatically set the list of namespaces to ignore

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

# Best Practices

1. **Configure once at startup**: Call `configure()` only once when your application starts
2. **Use namespaces**: Organize logs by feature or module using namespaces
3. **Use tags for filtering**: Use tags to categorize logs that can be filtered later
4. **Use extra for context**: Use extra information for structured data like request IDs
5. **Set appropriate log levels**: Use `setLogLevel()` or `setLogLevels()` to control verbosity in different environments
6. **Use hooks for monitoring**: Implement hooks to send critical logs to monitoring systems
7. **Use filters for production**: Use filters to reduce log noise in production environments
8. **Use TypeScript**: Take advantage of full TypeScript support for better type safety and IDE autocomplete
9. **Leverage useLogger**: Use `useLogger` hook for automatic namespace extraction from classes and functions
10. **Environment-based configuration**: Use different configurations for development, staging, and production

---

# Examples

For more usage examples, see the [examples](./examples/) directory:

- [Basic Usage Example](./examples/basic.ts)
- [Advanced Features Example](./examples/advanced.ts)
- [Configuration Example](./examples/configuration.ts)
- [Color Features Example](./examples/color.ts)
- [Real-world Scenario Example](./examples/real-world.ts)

---

# Environment Variables

## DEBUG_IGNORE

Comma-separated list of namespace names (case-insensitive) to ignore. When using `useLogger`, loggers with namespaces in this list will return no-op loggers.

```bash
DEBUG_IGNORE=UserService,ApiClient,Database
```

You can also set this programmatically:

```typescript
import { setLoggerIgnore } from '@jshow/logger';

setLoggerIgnore('UserService,ApiClient,Database');
```

---

# TypeScript Support

`@jshow/logger` is written in TypeScript and provides full type definitions out of the box. All APIs are fully typed, providing excellent IDE autocomplete and type safety.

```typescript
import { logger, type Logger, type LogLevel } from '@jshow/logger';

// All methods are fully typed
const appLogger: Logger = logger.fork({ namespace: 'app' });
const level: LogLevel = 'info';
```

---

# Browser Support

The library works in both Node.js and browser environments:

- **Node.js**: Uses ANSI color codes for terminal output
- **Browser**: Uses CSS styles for console output (works with browser DevTools)

The same API works in both environments without any code changes.

---

# Performance

`@jshow/logger` is designed with performance in mind:

- Minimal overhead when logs are filtered out
- Efficient namespace and context management
- No-op loggers for ignored namespaces have zero overhead
- Safe JSON serialization handles circular references efficiently

---

# Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

---

# Questions

The [issue](https://github.com/j-show/logger/issues) list of this repo is **exclusively** for bug reports and feature requests.

---

# License

[MIT](http://opensource.org/licenses/MIT)

---

**Copyright (c) 2022 jShow.org**
