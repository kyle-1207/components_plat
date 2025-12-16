# Docker 容器打包脚本（Windows PowerShell）
# 用于将项目打包为 Docker 镜像以便离线迁移

param(
    [string]$OutputDir = ".\docker_package",
    [switch]$SkipBuild = $false,
    [switch]$SkipBackup = $false,
    [switch]$Compress = $true
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Docker 容器打包脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否可用
$dockerPath = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerPath) {
    Write-Host "❌ Docker 未找到！" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 Docker:" -ForegroundColor Yellow
    Write-Host "  - Windows 10+: Docker Desktop" -ForegroundColor Cyan
    Write-Host "  - Windows 7: Docker Toolbox" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✓ 找到 Docker: $($dockerPath.Source)" -ForegroundColor Green
Write-Host "  Docker 版本:" -ForegroundColor Yellow
docker --version
Write-Host ""

# 检查 docker-compose 是否可用
$dockerComposePath = Get-Command docker-compose -ErrorAction SilentlyContinue
if (-not $dockerComposePath) {
    Write-Host "⚠ docker-compose 未找到，尝试使用 'docker compose'..." -ForegroundColor Yellow
    $dockerComposeCmd = "docker compose"
} else {
    $dockerComposeCmd = "docker-compose"
}

Write-Host ""

# 创建输出目录
$OutputPath = Join-Path $PSScriptRoot ".." $OutputDir
if (Test-Path $OutputPath) {
    Write-Host "清理现有输出目录..." -ForegroundColor Yellow
    Remove-Item $OutputPath -Recurse -Force
}
New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
Write-Host "输出目录: $OutputPath" -ForegroundColor Green
Write-Host ""

# 获取项目根目录
$ProjectRoot = Join-Path $PSScriptRoot ".."

# 1. 构建 Docker 镜像
if (-not $SkipBuild) {
    Write-Host "1. 构建 Docker 镜像..." -ForegroundColor Yellow
    Write-Host ""
    
    Push-Location $ProjectRoot
    
    try {
        Write-Host "  使用生产环境配置构建镜像..." -ForegroundColor Cyan
        Write-Host "  构建后端镜像..." -ForegroundColor Yellow
        Invoke-Expression "$dockerComposeCmd -f docker-compose.prod.yml build backend"
        
        Write-Host "  构建前端镜像..." -ForegroundColor Yellow
        Invoke-Expression "$dockerComposeCmd -f docker-compose.prod.yml build frontend"
        
        Write-Host "  ✓ 生产环境镜像构建完成" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ 镜像构建失败: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    } finally {
        Pop-Location
    }
    Write-Host ""
}

# 2. 备份 MongoDB 数据库
if (-not $SkipBackup) {
    Write-Host "2. 备份 MongoDB 数据库..." -ForegroundColor Yellow
    
    $BackupDir = Join-Path $OutputPath "mongodb_backup"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    # 检查 MongoDB 是否运行
    $mongodbRunning = docker ps --filter "name=business_plat_mongodb" --format "{{.Names}}" | Select-String "business_plat_mongodb"
    
    if ($mongodbRunning) {
        Write-Host "  检测到运行中的 MongoDB 容器，开始备份..." -ForegroundColor Cyan
        try {
            docker exec business_plat_mongodb mongodump --db=business_plat --out=/backup/business_plat_backup
            docker cp business_plat_mongodb:/backup/business_plat_backup $BackupDir
            Write-Host "  ✓ 数据库备份完成" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠ 数据库备份失败: $_" -ForegroundColor Yellow
            Write-Host "  提示: 可以稍后手动备份" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠ MongoDB 容器未运行，跳过备份" -ForegroundColor Yellow
        Write-Host "  提示: 可以稍后手动备份或使用 mongodump" -ForegroundColor Yellow
    }
    Write-Host ""
}

# 3. 导出 Docker 镜像
Write-Host "3. 导出 Docker 镜像..." -ForegroundColor Yellow

# 获取镜像列表
$Images = @(
    "business_plat_backend:latest",
    "business_plat_frontend:latest",
    "mongo:5.0",
    "redis:7-alpine",
    "nginx:alpine",
    "node:16-alpine"
)

# 检查镜像是否存在
$MissingImages = @()
foreach ($image in $Images) {
    $exists = docker images --format "{{.Repository}}:{{.Tag}}" | Select-String "^$image$"
    if (-not $exists) {
        $MissingImages += $image
    }
}

if ($MissingImages.Count -gt 0) {
    Write-Host "  ⚠ 以下镜像不存在，将从 Docker Hub 拉取:" -ForegroundColor Yellow
    foreach ($image in $MissingImages) {
        Write-Host "    - $image" -ForegroundColor Cyan
        docker pull $image
    }
    Write-Host ""
}

# 导出镜像
$ImagesFile = Join-Path $OutputPath "business_plat_images.tar"
Write-Host "  导出镜像到: $ImagesFile" -ForegroundColor Cyan
Write-Host "  ⚠ 这可能需要一些时间，请耐心等待..." -ForegroundColor Yellow

$StartTime = Get-Date
try {
    docker save $Images -o $ImagesFile
    
    if (Test-Path $ImagesFile) {
        $EndTime = Get-Date
        $Duration = $EndTime - $StartTime
        $FileSize = (Get-Item $ImagesFile).Length / 1GB
        Write-Host "  ✓ 镜像导出完成" -ForegroundColor Green
        Write-Host "    文件大小: $([math]::Round($FileSize, 2)) GB" -ForegroundColor Cyan
        Write-Host "    耗时: $($Duration.ToString('mm\:ss'))" -ForegroundColor Cyan
    } else {
        Write-Host "  ✗ 镜像导出失败" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ✗ 镜像导出失败: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. 压缩镜像文件
if ($Compress) {
    Write-Host "4. 压缩镜像文件..." -ForegroundColor Yellow
    
    $7zPath = Get-Command 7z -ErrorAction SilentlyContinue
    if ($7zPath) {
        $CompressedFile = "$ImagesFile.7z"
        Write-Host "  使用 7-Zip 压缩..." -ForegroundColor Cyan
        & 7z a -t7z -mx=9 $CompressedFile $ImagesFile
        
        if (Test-Path $CompressedFile) {
            $CompressedSize = (Get-Item $CompressedFile).Length / 1GB
            $OriginalSize = (Get-Item $ImagesFile).Length / 1GB
            $CompressionRatio = [math]::Round((1 - $CompressedSize / $OriginalSize) * 100, 1)
            
            Write-Host "  ✓ 压缩完成" -ForegroundColor Green
            Write-Host "    压缩后大小: $([math]::Round($CompressedSize, 2)) GB" -ForegroundColor Cyan
            Write-Host "    压缩率: $CompressionRatio%" -ForegroundColor Cyan
            
            # 删除未压缩的文件
            Remove-Item $ImagesFile -Force
            Write-Host "    已删除未压缩文件" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠ 7-Zip 未找到，跳过压缩" -ForegroundColor Yellow
        Write-Host "  提示: 可以手动使用 7-Zip 或 WinRAR 压缩" -ForegroundColor Yellow
    }
    Write-Host ""
}

# 5. 复制配置文件
Write-Host "5. 复制配置文件..." -ForegroundColor Yellow

$ConfigFiles = @(
    "docker-compose.prod.yml",
    "docker-compose.yml",
    ".dockerignore"
)

foreach ($file in $ConfigFiles) {
    $sourcePath = Join-Path $ProjectRoot $file
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $OutputPath -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
    }
}
Write-Host ""

# 6. 生成迁移说明
Write-Host "6. 生成迁移说明..." -ForegroundColor Yellow

$ReadmePath = Join-Path $OutputPath "README_MIGRATION.txt"
$Readme = @"
Docker 容器迁移说明
========================================

打包信息:
----------
打包时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Docker 版本: $(docker --version)

文件说明:
----------
1. business_plat_images.tar(.7z) - Docker 镜像文件（生产环境）
2. docker-compose.prod.yml - 生产环境 Docker Compose 配置
3. docker-compose.yml - 开发环境配置（参考）
4. mongodb_backup/ - MongoDB 数据库备份（如果有）

迁移步骤（Windows 7 生产环境）:
----------
1. 安装 Docker Toolbox:
   - 下载：https://github.com/docker/toolbox/releases
   - 安装并启动 Docker Quickstart Terminal

2. 导入 Docker 镜像:
   # 如果已压缩，先解压
   7z x business_plat_images.7z
   
   # 在 Docker Quickstart Terminal 中导入
   docker load -i business_plat_images.tar

3. 准备数据目录:
   # 在 Windows 中创建
   mkdir C:\Business_plat\data\mongodb
   mkdir C:\Business_plat\data\redis
   mkdir C:\Business_plat\backend\logs
   mkdir C:\Business_plat\backend\uploads

4. 恢复数据库（如果需要）:
   # 在 Docker Quickstart Terminal 中执行
   docker run -d --name temp_mongodb -v /c/Business_plat/data/mongodb:/data/db -p 27017:27017 mongo:5.0
   sleep 15
   docker run --rm --link temp_mongodb:mongo -v /c/Business_plat/docker_migration_package/mongodb_backup:/backup mongo:5.0 mongorestore --host=mongo:27017 --db=business_plat /backup/business_plat_backup/business_plat
   docker stop temp_mongodb && docker rm temp_mongodb

5. 启动生产环境服务:
   docker-compose -f docker-compose.prod.yml up -d

6. 验证服务:
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs -f

访问地址（Docker Toolbox）:
----------
注意：Docker Toolbox 使用虚拟机 IP（通常是 192.168.99.100）
- 前端: http://192.168.99.100:3000
- 后端 API: http://192.168.99.100:3001
- MongoDB: 192.168.99.100:27017
- Redis: 192.168.99.100:6379

详细说明请参考: DOCKER_MIGRATION_GUIDE.md

"@

$Readme | Out-File -FilePath $ReadmePath -Encoding UTF8
Write-Host "  ✓ 迁移说明已生成: $ReadmePath" -ForegroundColor Green
Write-Host ""

# 完成
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  打包完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "输出目录: $OutputPath" -ForegroundColor Green
Write-Host ""

# 显示文件列表
Write-Host "生成的文件:" -ForegroundColor Yellow
$Files = Get-ChildItem -Path $OutputPath -Recurse
foreach ($file in $Files) {
    if (-not $file.PSIsContainer) {
        $size = $file.Length
        $sizeStr = if ($size -gt 1GB) {
            "$([math]::Round($size / 1GB, 2)) GB"
        } elseif ($size -gt 1MB) {
            "$([math]::Round($size / 1MB, 2)) MB"
        } else {
            "$([math]::Round($size / 1KB, 2)) KB"
        }
        $relativePath = $file.FullName.Replace($OutputPath, "").TrimStart("\")
        Write-Host "  - $relativePath ($sizeStr)" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "  1. 将 $OutputPath 目录复制到目标机器" -ForegroundColor Cyan
Write-Host "  2. 在目标机器上按照 README_MIGRATION.txt 中的步骤操作" -ForegroundColor Cyan
Write-Host ""

