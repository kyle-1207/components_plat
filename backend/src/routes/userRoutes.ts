import express from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // 验证必填字段
    if (!email || !password || !name) {
      throw new CustomError('邮箱、密码和姓名都是必填项', 400, 'MISSING_FIELDS');
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError('该邮箱已被注册', 409, 'USER_EXISTS');
    }

    // 创建新用户
    const user = new User({
      email,
      password,
      name,
      role: role || 'user' // 默认角色为 user
    });

    await user.save();

    // 生成 JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn } as SignOptions
    );

    logger.info(`新用户注册: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/users/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      throw new CustomError('邮箱和密码都是必填项', 400, 'MISSING_FIELDS');
    }

    // 查找用户（包含密码字段）
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new CustomError('邮箱或密码错误', 401, 'INVALID_CREDENTIALS');
    }

    // 检查用户是否活跃
    if (!user.isActive) {
      throw new CustomError('账号已被禁用', 403, 'ACCOUNT_DISABLED');
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new CustomError('邮箱或密码错误', 401, 'INVALID_CREDENTIALS');
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成 JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn } as SignOptions
    );

    logger.info(`用户登录: ${email}`);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/profile
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    
    if (!user) {
      throw new CustomError('用户不存在', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    更新当前用户信息
 * @access  Private
 */
router.put('/profile', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('用户不存在', 404, 'USER_NOT_FOUND');
    }

    // 如果更新邮箱，检查是否已被使用
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new CustomError('该邮箱已被使用', 409, 'EMAIL_EXISTS');
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    logger.info(`用户更新资料: ${user.email}`);

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/password
 * @desc    修改密码
 * @access  Private
 */
router.put('/password', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!currentPassword || !newPassword) {
      throw new CustomError('当前密码和新密码都是必填项', 400, 'MISSING_FIELDS');
    }

    if (newPassword.length < 6) {
      throw new CustomError('新密码至少6个字符', 400, 'INVALID_PASSWORD');
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new CustomError('用户不存在', 404, 'USER_NOT_FOUND');
    }

    // 验证当前密码
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new CustomError('当前密码错误', 401, 'INVALID_PASSWORD');
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    logger.info(`用户修改密码: ${user.email}`);

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users
 * @desc    获取所有用户（管理员）
 * @access  Private/Admin
 */
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:id/status
 * @desc    启用/禁用用户（管理员）
 * @access  Private/Admin
 */
router.put('/:id/status', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      throw new CustomError('isActive 字段是必填项', 400, 'MISSING_FIELDS');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new CustomError('用户不存在', 404, 'USER_NOT_FOUND');
    }

    user.isActive = isActive;
    await user.save();

    logger.info(`管理员${isActive ? '启用' : '禁用'}用户: ${user.email}`);

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:id/role
 * @desc    修改用户角色（管理员）
 * @access  Private/Admin
 */
router.put('/:id/role', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user', 'supplier'].includes(role)) {
      throw new CustomError('无效的角色', 400, 'INVALID_ROLE');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new CustomError('用户不存在', 404, 'USER_NOT_FOUND');
    }

    user.role = role;
    await user.save();

    logger.info(`管理员修改用户角色: ${user.email} -> ${role}`);

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

