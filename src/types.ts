/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ErrorMeta<T = { [key: string]: string }> {
  setTags?: T;
  [key: string]: any; // ts-coverage: disable-line
}

export interface LogMeta {
  [key: string]: any; // ts-coverage: disable-line
}

export type ErrorLiked = Error | { stack: string; message: string; name: string };

export const LogLevels = ['error', 'warn', 'info', 'debug'] as const;

export type LogLevel = typeof LogLevels[number];

export type LogFunction = (...msg: Array<unknown>) => unknown;

export interface LoggerConfig {
  readonly format: 'text' | 'json';
  readonly enableNamespacePrefix: boolean;
  readonly enableNamespacePrefixColors: boolean;
  readonly appendTagsForTextPrint: boolean;
  readonly appendExtraForTextPrint: boolean;
  readonly transformTagsForTextPrint?: (tags: LoggerContext['tags'], context: LoggerContext) => unknown;
  readonly transformExtraForTextPrint?: (extra: LoggerContext['extra'], context: LoggerContext) => unknown;
  readonly filter?: (
    namespace: NonNullable<LoggerContext['namespace']>,
    tags: NonNullable<LoggerContext['tags']>,
  ) => boolean;
  readonly hook?: (level: LogLevel, context: LoggerContext, ...messages: Array<unknown>) => unknown;
}

export interface LoggerContext {
  tags?: { [x: string]: unknown };
  extra?: { [x: string]: string | number | boolean | undefined | null };
  namespace?: string[];
  readonly config: LoggerConfig;
}

export type LoggerSubContext<CTX extends LoggerContext> = Partial<
  Omit<CTX, 'config' | 'namespace'> & { namespace?: string }
>;

type LogWithLevels = { [x in LogLevel]: LogFunction };
interface WithCluster<CTX extends LoggerContext> {
  fork: (context: LoggerSubContext<CTX>) => Logger<CTX>;
  scope: (context: LoggerSubContext<CTX>, fn: (logger: Logger<CTX>) => unknown) => unknown;
}

export interface Logger<CTX extends LoggerContext> extends LogWithLevels, WithCluster<CTX> {
  setLevel: (level: LogLevel) => void;
}

export interface CoreLogger<CTX extends LoggerContext> {
  print: (env: { level: LogLevel; context: CTX }, ...msg: Array<unknown>) => unknown;
}

export type CoreLoggerFactory<CTX extends LoggerContext> = () => CoreLogger<CTX>;
