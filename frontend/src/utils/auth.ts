import type { User } from '@/types';

// 获取存储的token
export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// 设置token
export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

// 移除token
export const removeToken = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

// 获取存储的用户信息
export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// 设置用户信息
export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// 检查用户权限
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    admin: 3,
    staff: 2,
    tenant: 1,
  };
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  
  return userLevel >= requiredLevel;
};

// 登出
export const logout = (): void => {
  removeToken();
  window.location.href = '/login';
};
