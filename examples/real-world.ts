/**
 * @fileoverview 真实场景使用示例
 * @description 展示在实际项目中的使用方式
 */

import { configure, logger, setLevel } from '../src';
import type { LoggerConfig } from '../src/types';

// 类型定义
interface User {
  id: string;
  name: string;
  email?: string;
}

interface ApiRequestHeaders {
  'user-agent'?: string;
}

interface ApiRequestUser {
  id?: string;
}

interface ApiRequest {
  id?: string;
  method?: string;
  path?: string;
  ip?: string;
  headers?: ApiRequestHeaders;
  user?: ApiRequestUser;
}

interface ApiResponse {
  json: (data: Record<string, unknown>) => void;
  status: (code: number) => ApiResponse;
}

interface ErrorContext {
  requestId?: string;
  userId?: string;
}

interface ErrorWithCode extends Error {
  code?: string;
}

interface DatabaseRecord {
  id?: string;
  name?: string;
}

// 1. 应用启动时配置
configure({
  config: {
    format: (process.env.NODE_ENV === 'production'
      ? 'json'
      : 'text') as LoggerConfig['format'],
    enableNamespacePrefix: true,
    enableNamespacePrefixColors: true,
    appendTagsForTextPrint: true,
    appendExtraForTextPrint: true
  }
});

// 根据环境设置日志级别
if (process.env.NODE_ENV === 'production') {
  setLevel('info');
} else {
  setLevel('debug');
}

// 2. 创建模块日志记录器
export const createModuleLogger = (moduleName: string) => {
  return logger.fork({
    namespace: moduleName,
    tags: {
      module: moduleName,
      version: process.env.APP_VERSION || '1.0.0'
    }
  });
};

// 3. 在 HTTP 请求处理中使用
export const createRequestLogger = (requestId: string, userId?: string) => {
  return logger.fork({
    namespace: 'http',
    tags: { requestId },
    extra: {
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString()
    }
  });
};

// 示例：用户服务
const userServiceLogger = createModuleLogger('user-service');

export class UserService {
  public async getUser(userId: string): Promise<User> {
    const requestLogger = createRequestLogger(`req-${Date.now()}`, userId);

    requestLogger.info('开始获取用户信息', { userId });

    try {
      // 模拟数据库查询
      const user: User = { id: userId, name: 'John Doe' };
      requestLogger.info('用户信息获取成功', user);
      return user;
    } catch (error) {
      requestLogger.error('获取用户信息失败', error);
      throw error;
    }
  }

  public async createUser(userData: Partial<User>): Promise<User> {
    userServiceLogger.info('创建新用户', { email: userData.email });

    try {
      // 模拟创建用户
      const user: User = { id: '123', name: '', ...userData };
      userServiceLogger.info('用户创建成功', { userId: user.id });
      return user;
    } catch (error) {
      userServiceLogger.error('用户创建失败', error);
      throw error;
    }
  }
}

// 示例：API 路由处理
export const handleApiRequest = async (
  req: ApiRequest,
  res: ApiResponse
): Promise<void> => {
  const requestLogger = createRequestLogger(
    req.id as string,
    req.user?.id as string
  );

  requestLogger.scope(
    {
      namespace: 'api',
      tags: { method: req.method, path: req.path },
      extra: {
        ip: req.ip,
        userAgent: req.headers?.['user-agent']
      }
    },
    log => {
      log.info('收到 API 请求');

      // 处理请求
      try {
        // ... 业务逻辑
        log.info('请求处理成功');
        res.json({ success: true });
      } catch (error) {
        log.error('请求处理失败', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );
};

// 示例：数据库操作
export const createDbLogger = (tableName: string) => {
  // 先创建 database 命名空间的 logger，再创建 table 命名空间的 logger
  const dbLogger = logger.fork({ namespace: 'database' });
  return dbLogger.fork({
    namespace: tableName,
    tags: { table: tableName },
    extra: { db: 'main' }
  });
};

const userTableLogger = createDbLogger('users');

export const dbOperations = {
  async insert(data: DatabaseRecord): Promise<void> {
    userTableLogger.debug('执行插入操作', { data });
    // ... 数据库操作
    userTableLogger.info('插入成功');
  },

  async update(id: string, data: Partial<DatabaseRecord>): Promise<void> {
    userTableLogger.debug('执行更新操作', { id, data });
    // ... 数据库操作
    userTableLogger.info('更新成功');
  },

  async delete(id: string): Promise<void> {
    userTableLogger.warn('执行删除操作', { id });
    // ... 数据库操作
    userTableLogger.info('删除成功');
  }
};

// 示例：错误处理中间件
export const errorHandler = (error: Error, context: ErrorContext): void => {
  const errorWithCode = error as ErrorWithCode;
  const errorLogger = logger.fork({
    namespace: 'error-handler',
    tags: {
      errorType: error.name,
      errorCode: errorWithCode.code || 'UNKNOWN'
    },
    extra: {
      stack: error.stack,
      timestamp: new Date().toISOString()
    }
  });

  errorLogger.error('捕获到错误', {
    message: error.message,
    stack: error.stack,
    context
  });

  // 可以在这里发送错误到监控服务
};

// 使用示例
if (require.main === module) {
  const userService = new UserService();

  // 模拟请求
  userService.getUser('user-123').catch(console.error);
  userService.createUser({ email: 'test@example.com' }).catch(console.error);

  // 数据库操作
  dbOperations.insert({ name: 'Test User' });
  dbOperations.update('user-123', { name: 'Updated User' });

  // 错误处理
  try {
    throw new Error('测试错误');
  } catch (error) {
    errorHandler(error as Error, { requestId: 'test-req' });
  }
}
