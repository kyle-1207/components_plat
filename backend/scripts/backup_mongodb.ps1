# MongoDB 数据库备份脚本
# 用于备份 business_plat 数据库以便离线迁移

param(
    [string]$OutputDir = ".\mongodb_backup",
    [string]$DatabaseName = "business_plat",
    [string]$MongoUri = "mongodb://127.0.0.1:27017",
    [switch]$Compress = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MongoDB 数据库备份脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 mongodump 是否可用
$mongodumpPath = Get-Command mongodump -ErrorAction SilentlyContinue
if (-not $mongodumpPath) {
    Write-Host "❌ mongodump 未找到！" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 MongoDB Database Tools:" -ForegroundColor Yellow
    Write-Host "  1. 下载: https://www.mongodb.com/try/download/database-tools" -ForegroundColor Cyan
    Write-Host "  2. 解压并添加到 PATH 环境变量" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✓ 找到 mongodump: $($mongodumpPath.Source)" -ForegroundColor Green
Write-Host ""

# 检查 MongoDB 连接
Write-Host "检查 MongoDB 连接..." -ForegroundColor Yellow
try {
    $testResult = mongosh --quiet --eval "db.version()" $MongoUri 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MongoDB 连接成功" -ForegroundColor Green
    } else {
        Write-Host "⚠ MongoDB 连接测试失败，但继续备份..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ 无法测试连接，但继续备份..." -ForegroundColor Yellow
}
Write-Host ""

# 创建备份目录
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupPath = Join-Path $OutputDir "$DatabaseName`_backup_$Timestamp"

if (Test-Path $BackupPath) {
    Write-Host "清理现有备份目录..." -ForegroundColor Yellow
    Remove-Item $BackupPath -Recurse -Force
}
New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null

Write-Host "备份配置:" -ForegroundColor Yellow
Write-Host "  数据库: $DatabaseName" -ForegroundColor Cyan
Write-Host "  输出目录: $BackupPath" -ForegroundColor Cyan
Write-Host ""

# 执行备份
Write-Host "开始备份数据库..." -ForegroundColor Yellow
Write-Host "⚠ 这可能需要 15-30 分钟，请耐心等待..." -ForegroundColor Yellow
Write-Host ""

$StartTime = Get-Date

try {
    $BackupCommand = "mongodump --uri=`"$MongoUri/$DatabaseName`" --out=`"$BackupPath`""
    Invoke-Expression $BackupCommand
    
    if ($LASTEXITCODE -eq 0) {
        $EndTime = Get-Date
        $Duration = $EndTime - $StartTime
        
        # 计算备份大小
        $BackupSize = (Get-ChildItem -Path $BackupPath -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  备份完成！" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "备份信息:" -ForegroundColor Yellow
        Write-Host "  位置: $BackupPath" -ForegroundColor Cyan
        Write-Host "  大小: $([math]::Round($BackupSize / 1GB, 2)) GB" -ForegroundColor Cyan
        Write-Host "  耗时: $($Duration.ToString('mm\:ss'))" -ForegroundColor Cyan
        Write-Host ""
        
        # 压缩备份（如果请求）
        if ($Compress) {
            Write-Host "压缩备份文件..." -ForegroundColor Yellow
            $CompressedPath = "$BackupPath.7z"
            
            # 检查是否有 7z
            $7zPath = Get-Command 7z -ErrorAction SilentlyContinue
            if ($7zPath) {
                & 7z a -t7z -mx=9 $CompressedPath $BackupPath
                $CompressedSize = (Get-Item $CompressedPath).Length
                Write-Host "✓ 备份已压缩: $CompressedPath" -ForegroundColor Green
                Write-Host "  压缩后大小: $([math]::Round($CompressedSize / 1GB, 2)) GB" -ForegroundColor Cyan
                Write-Host "  压缩率: $([math]::Round((1 - $CompressedSize / $BackupSize) * 100, 1))%" -ForegroundColor Cyan
            } else {
                Write-Host "⚠ 7-Zip 未找到，使用 PowerShell 压缩..." -ForegroundColor Yellow
                $CompressedPath = "$BackupPath.zip"
                Compress-Archive -Path "$BackupPath\*" -DestinationPath $CompressedPath -Force
                $CompressedSize = (Get-Item $CompressedPath).Length
                Write-Host "✓ 备份已压缩: $CompressedPath" -ForegroundColor Green
                Write-Host "  压缩后大小: $([math]::Round($CompressedSize / 1GB, 2)) GB" -ForegroundColor Cyan
            }
            Write-Host ""
        }
        
        # 生成恢复说明
        $ReadmePath = Join-Path $OutputDir "RESTORE_README.txt"
        $Readme = @"
MongoDB 数据库恢复说明
========================================

备份信息:
----------
数据库名称: $DatabaseName
备份时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
备份位置: $BackupPath
备份大小: $([math]::Round($BackupSize / 1GB, 2)) GB

恢复步骤:
----------
1. 确保 MongoDB 服务正在运行
   net start MongoDB
   或
   "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --dbpath C:\data\db

2. 如果备份已压缩，先解压:
   7z x $BackupPath.7z
   或
   Expand-Archive $BackupPath.zip

3. 恢复数据库:
   mongorestore --db=$DatabaseName $BackupPath\$DatabaseName\

   或使用 URI:
   mongorestore --uri="mongodb://127.0.0.1:27017" --db=$DatabaseName $BackupPath\$DatabaseName\

4. 验证恢复:
   mongosh mongodb://127.0.0.1:27017/$DatabaseName
   
   在 mongosh 中:
   show collections
   db.components.countDocuments()
   db.parameters.countDocuments()

注意事项:
----------
- 恢复时间约 30-60 分钟
- 确保有足够的磁盘空间（至少 20 GB）
- 如果数据库已存在，mongorestore 会合并数据
- 如需完全替换，先删除现有数据库:
  mongosh --eval "use $DatabaseName; db.dropDatabase()"

"@
        $Readme | Out-File -FilePath $ReadmePath -Encoding UTF8
        Write-Host "恢复说明已生成: $ReadmePath" -ForegroundColor Green
        
    } else {
        Write-Host ""
        Write-Host "❌ 备份失败！" -ForegroundColor Red
        Write-Host "请检查:" -ForegroundColor Yellow
        Write-Host "  1. MongoDB 服务是否运行" -ForegroundColor Cyan
        Write-Host "  2. 数据库名称是否正确" -ForegroundColor Cyan
        Write-Host "  3. 连接 URI 是否正确" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ 备份过程出错: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

