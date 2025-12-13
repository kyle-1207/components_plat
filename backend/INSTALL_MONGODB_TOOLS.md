# MongoDB Database Tools 安装指南

## 为什么需要安装？

迁移脚本需要使用 `mongodump` 工具来备份数据库。该工具是 MongoDB Database Tools 的一部分，需要单独安装。

## 快速安装步骤

### Windows 系统

#### 方法 1：使用 Chocolatey（推荐）

```powershell
# 1. 以管理员身份打开 PowerShell

# 2. 安装 MongoDB Database Tools
choco install mongodb-database-tools -y

# 3. 验证安装
mongodump --version
```

#### 方法 2：手动下载安装

1. **下载工具包**
   - 访问：https://www.mongodb.com/try/download/database-tools
   - 选择：Windows x64
   - 点击：Download

2. **解压并安装**
   ```powershell
   # 假设下载到 Downloads 文件夹
   cd ~/Downloads
   
   # 解压 zip 文件（假设文件名为 mongodb-database-tools-windows-x86_64-100.9.4.zip）
   Expand-Archive mongodb-database-tools-windows-*.zip -DestinationPath ./
   
   # 将 bin 目录添加到系统 PATH
   # 方法 A：临时添加（本次会话有效）
   $env:PATH += ";$HOME\Downloads\mongodb-database-tools-windows-x86_64-100.9.4\bin"
   
   # 方法 B：永久添加
   # 1. 按 Win+R，输入 sysdm.cpl
   # 2. 高级 -> 环境变量
   # 3. 在"系统变量"中找到 Path，点击编辑
   # 4. 新建，添加路径：C:\Users\你的用户名\Downloads\mongodb-database-tools-windows-x86_64-100.9.4\bin
   ```

3. **验证安装**
   ```powershell
   # 重新打开 PowerShell 窗口
   mongodump --version
   mongorestore --version
   ```

## 验证工具是否可用

运行以下命令检查：

```powershell
# 检查 mongodump
Get-Command mongodump

# 检查 mongorestore  
Get-Command mongorestore

# 查看版本
mongodump --version
```

如果看到版本信息（例如 "mongodump version: 100.9.4"），说明安装成功！

## 安装后继续迁移

安装完成后，重新运行迁移脚本：

```powershell
cd F:\Business_plat\backend
powershell -ExecutionPolicy Bypass -File .\scripts\run_migration.ps1
```

## 故障排除

### 问题 1：找不到 mongodump 命令

**解决方案**：
```powershell
# 确认 PATH 环境变量
$env:PATH -split ';' | Select-String mongo

# 如果没有结果，需要手动添加到 PATH
```

### 问题 2：下载速度慢

**解决方案**：
- 使用国内镜像源
- 或者使用提供的备用下载链接

### 问题 3：Chocolatey 未安装

**安装 Chocolatey**：
```powershell
# 以管理员身份运行 PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

## 需要帮助？

如果遇到问题，请提供：
1. Windows 版本
2. PowerShell 版本（运行 `$PSVersionTable`）
3. 错误信息截图

