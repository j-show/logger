import {
  CoreLogger,
  CoreLoggerFactory,
  Logger,
  LoggerConfig,
  LoggerContext,
  LoggerSubContext,
  LogLevel,
  LogLevels,
} from '../types';

import { LoggerFactoryOfConsole } from './console';

export { LoggerFactoryOfConsole };

// ------------

const logLevelIndexMap = LogLevels.reduce((col, key, index) => ({ ...col, [key]: index }), {}) as {
  [x in LogLevel]: number;
};

let globalPrintLevel: LogLevel = 'info';
let coreLogger: CoreLogger<LoggerContext> | undefined;

export function setLevel(level: LogLevel) {
  globalPrintLevel = level;
}

export function canPrintLevel(level: LogLevel, printLevel: LogLevel) {
  return logLevelIndexMap[level] <= logLevelIndexMap[printLevel];
}

const LOGGER_APPEND_CONFIG: unique symbol = Symbol('Logger Append Config');

// ------------

function mergeContexts(majorCtx: LoggerContext, ...subCtxList: Array<LoggerSubContext<LoggerContext>>) {
  return subCtxList.reduce(
    (collection, { namespace, tags, extra }) => ({
      ...collection,
      namespace: namespace ? [...(collection.namespace || []), namespace] : collection.namespace,
      tags: { ...collection.tags, ...tags },
      extra: { ...collection.extra, ...extra },
    }),
    majorCtx,
  );
}

function createLoggerWrap(context: LoggerContext, printLevel?: LogLevel): Logger<LoggerContext> {
  let currentPrintLevel = printLevel;
  const print = (level: LogLevel, ...msg: Array<unknown>) => {
    if (!canPrintLevel(level, currentPrintLevel || globalPrintLevel)) return;
    if (!coreLogger) return;
    if (context.config.filter && !context.config.filter(context.namespace || [], context.tags || {})) return;
    coreLogger.print({ level, context }, ...msg);
  };
  return {
    error: (...msg) => print('error', ...msg),
    warn: (...msg) => print('warn', ...msg),
    info: (...msg) => print('info', ...msg),
    debug: (...msg) => print('debug', ...msg),
    // ----
    fork: (ctx) => createLoggerWrap({ ...mergeContexts(context, ctx), config: context.config }),
    scope: (ctx, cb) => cb(createLoggerWrap({ ...mergeContexts(context, ctx), config: context.config })),
    // ----
    setLevel: (level) => (currentPrintLevel = level),
    // ----
    [LOGGER_APPEND_CONFIG]: (conf: Partial<LoggerConfig>) =>
      ((context as { config: typeof context['config'] }).config = { ...context.config, ...conf }),
  };
}

// ------------

let configureFucntionCallCount = 0;
export function configure(
  createCoreLogger: CoreLoggerFactory<LoggerContext> = LoggerFactoryOfConsole,
  config: Partial<LoggerConfig> = {},
) {
  if (configureFucntionCallCount++) throw new Error('Logger has been configured');
  coreLogger = createCoreLogger();
  logger[LOGGER_APPEND_CONFIG](config);
}

// ------------

export const logger = createLoggerWrap({
  config: {
    format: 'text',
    enableNamespacePrefix: true,
    enableNamespacePrefixColors: true,
    appendTagsForTextPrint: true,
    appendExtraForTextPrint: true,
  },
});

export default logger;
