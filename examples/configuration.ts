/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jshow/unused-variable */
/**
 * @fileoverview 配置示例
 * @description 展示如何配置日志记录器的各种选项
 */

import { configure, logger } from '../src';
import type { LoggerConfig } from '../src/types';

// 基础配置：使用 JSON 格式
configure({
  config: {
    format: 'json',
    enableNamespacePrefix: true,
    enableNamespacePrefixColors: true,
    appendTagsForTextPrint: true,
    appendExtraForTextPrint: true
  }
});

logger.info('JSON 格式的日志');

// 文本格式配置"
configure({
  config: {
    format: 'text',
    enableNamespacePrefix: true,
    enableNamespacePrefixColors: true,
    appendTagsForTextPrint: true,
    appendExtraForTextPrint: false // 不追加额外信息
  }
});

// 自定义标签转换函数
const customConfig: Partial<LoggerConfig> = {
  format: 'text',
  enableNamespacePrefix: true,
  transformTagsForTextPrint: (tags, context) => {
    return `[Tags: ${Object.keys(tags || {}).join(', ')}]`;
  }
};

// 自定义额外信息转换函数
const configWithExtraTransform: Partial<LoggerConfig> = {
  format: 'text',
  appendExtraForTextPrint: true,
  transformExtraForTextPrint: (extra, context) => {
    return `[Extra: ${JSON.stringify(extra)}]`;
  }
};

// 使用过滤器
const configWithFilter: Partial<LoggerConfig> = {
  format: 'text',
  filter: (namespace, tags) => {
    // 只显示 production 环境的日志
    return tags.env === 'production';
  }
};

// 使用钩子函数
const configWithHook: Partial<LoggerConfig> = {
  format: 'text',
  hook: (level, context, ...messages) => {
    // 可以在这里发送日志到远程服务器、写入文件等
    console.log('Hook called:', level, context.namespace, messages);
  }
};

// 组合配置
configure({
  config: {
    format: 'text',
    enableNamespacePrefix: true,
    enableNamespacePrefixColors: true,
    appendTagsForTextPrint: true,
    appendExtraForTextPrint: true,
    transformTagsForTextPrint: tags => `[${Object.keys(tags || {}).join('|')}]`,
    filter: (namespace, tags) => {
      // 过滤掉 debug 命名空间的日志
      return !namespace.includes('debug');
    },
    hook: (level, context, ...messages) => {
      if (level === 'error') {
        // 错误日志可以发送到监控系统
        console.log('Error logged:', messages);
      }
    }
  }
});

const configuredLogger = logger.fork({
  namespace: 'app',
  tags: { env: 'production', version: '1.0.0' },
  extra: { instance: 'server-1' }
});

configuredLogger.info('配置后的日志');
configuredLogger.error('错误日志会触发钩子');
