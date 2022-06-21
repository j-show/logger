import {
  betterLogColor,
  isDarkColor,
  LogColorStyle,
  makeColorHexFromText,
  wrapColorANSI,
  wrapColorCSS,
} from '../color';
import { CoreLoggerFactory, LoggerContext } from '../types';
import { stringify } from '../utils';

const makeContentStyle = (content: string): LogColorStyle => {
  const majorColor = makeColorHexFromText(content);
  const enhancedMajorColor = betterLogColor(majorColor);
  return {
    backgroundColor: enhancedMajorColor,
    contentColor: isDarkColor(enhancedMajorColor) ? [0, 0, 0] : [255, 255, 255],
  };
};

const processColoringPrefixChunks: (namespace: NonNullable<LoggerContext['namespace']>) => string[] =
  // @ts-ignore
  typeof window === 'undefined'
    ? (namespace) => {
        return [namespace.map((ns) => wrapColorANSI(ns, makeContentStyle(ns))).join('/')];
      }
    : (namespace) => {
        const { contents, styles } = namespace
          .map((ns) => wrapColorCSS(ns, makeContentStyle(ns)))
          .reduce(
            (collection, [content, style]) => {
              collection.contents.push(content);
              collection.styles.push(style);
              return collection;
            },
            { contents: [] as string[], styles: [] as string[] },
          );
        return [contents.join('/'), ...styles];
      };

export const LoggerFactoryOfConsole: CoreLoggerFactory<LoggerContext> = () => ({
  print: ({ level, context }, ...messages) => {
    const { config, ...rest } = context;

    if (context.config.format === 'json') {
      console[level]?.(stringify({ level, ...rest, messages }));
    }

    if (context.config.format === 'text') {
      const chunks: Array<unknown> = [];
      if (config.enableNamespacePrefix && context.namespace?.length)
        if (config.enableNamespacePrefixColors) chunks.push(...processColoringPrefixChunks(context.namespace));
        else chunks.push(`${context.namespace.join('/')}`);

      chunks.push(...messages);

      if (config.appendTagsForTextPrint && context.tags && Object.keys(context.tags).length)
        if (config.transformTagsForTextPrint) chunks.push(config.transformTagsForTextPrint(context.tags, context));
        else chunks.push(context.tags);

      if (config.appendExtraForTextPrint && context.extra && Object.keys(context.extra).length)
        if (config.transformExtraForTextPrint) chunks.push(config.transformExtraForTextPrint(context.extra, context));
        else chunks.push(context.extra);

      console[level](...chunks);
    }

    if (config.hook) config.hook(level, context, ...messages);
  },
});
