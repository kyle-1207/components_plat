import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { CustomError } from './errorHandler';

// 扩展 Express Request 类型
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * JWT 认证中间件
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 从 Header 中获取 token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new CustomError('未提供认证令牌', 401, 'NO_TOKEN');
    }

    // 验证 token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      email: string;
      role: string;
    };

    // 验证用户是否存在且活跃
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new CustomError('用户不存在或已被禁用', 401, 'INVALID_USER');
    }

    // 将用户信息添加到请求对象
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(new CustomError('无效的认证令牌', 401, 'INVALID_TOKEN'));
    } else if (error.name === 'TokenExpiredError') {
      next(new CustomError('认证令牌已过期', 401, 'TOKEN_EXPIRED'));
    } else {
      next(error);
    }
  }
};

/**
 * 角色权限验证中间件
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new CustomError('未认证', 401, 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      throw new CustomError('权限不足', 403, 'FORBIDDEN');
    }

    next();
  };
};

/**
 * 可选认证中间件（用户可以是匿名或已认证）
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as {
        userId: string;
        email: string;
        role: string;
      };

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    }

    next();
  } catch (error) {
    // 忽略认证错误，继续执行
    next();
  }
};

