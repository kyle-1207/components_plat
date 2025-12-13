# 📍 数据库位置说明

## 正确的数据库配置

您的数据存储在以下位置：

### ✅ 实际使用的数据库
```
数据库名称: business_plat
连接地址: mongodb://localhost:27017/business_plat
```

**数据统计：**
- `components` 集合: **1,841,417 条记录** ✅
- 所有 `family_path` 字段已成功迁移为数组格式

### ❌ 不要使用的数据库
```
数据库名称: aerospace_platform
状态: 空数据库（仅作为配置示例）
```

---

## 如何在 MongoDB Compass 中查看数据

### 快速连接步骤

#### 方法 1：使用连接字符串（推荐）

1. **打开 MongoDB Compass**
2. **在连接字符串输入框中输入**：
   ```
   mongodb://127.0.0.1:27017
   ```
   或
   ```
   mongodb://localhost:27017
   ```
3. **点击 "Connect" 按钮**
4. **连接成功后，在左侧数据库列表中找到 `business_plat`**
5. **展开数据库，查看 `components` 集合**

#### 方法 2：使用连接表单

1. **打开 MongoDB Compass**
2. **点击 "Fill in connection fields individually"**
3. **填写连接信息**：
   - **Hostname**: `127.0.0.1` 或 `localhost`
   - **Port**: `27017`
   - **Authentication**: 选择 **"None"**（因为未启用认证）
4. **点击 "Connect" 按钮**
5. **选择数据库**: `business_plat` （不是 aerospace_platform）
6. **查看集合**: `components`

### 连接信息总结

- **连接地址**: `mongodb://127.0.0.1:27017` 或 `mongodb://localhost:27017`
- **数据库名称**: `business_plat`
- **端口**: `27017`
- **认证**: 无（开发环境）
- **数据目录**: `F:\Business_plat\backend\data`

---

## 环境变量配置

创建 `backend/.env` 文件并设置正确的数据库：

```bash
MONGODB_URI=mongodb://localhost:27017/business_plat
```

**注意**: 不要使用 `aerospace_platform`，那是旧的配置示例！

---

## 验证数据

运行以下命令验证数据：

```bash
cd backend
node test-connection.js
```

应该显示:
```
✅ MongoDB 连接成功!
📊 数据库统计:
   Components: 1,841,417
```

---

## 数据库命名历史

- `business_plat` - **当前使用** ✅
- `aerospace_platform` - 旧配置示例 ❌
- `doeet` - DoEEEt 原始数据（已导入到 business_plat）

**请统一使用 `business_plat` 作为主数据库名称！**

