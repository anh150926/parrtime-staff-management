# =====================================================
# Coffee House - Database Setup (PowerShell)
# =====================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Coffee House - Database Setup" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$MYSQL_USER = Read-Host "Nhap MySQL username (mac dinh: root)"
if ([string]::IsNullOrEmpty($MYSQL_USER)) {
    $MYSQL_USER = "root"
}

$MYSQL_PASS = Read-Host "Nhap MySQL password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($MYSQL_PASS)
$MYSQL_PASS_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Dang tao database..." -ForegroundColor Yellow

try {
    # Kiem tra MySQL co san khong
    $mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
    
    if ($null -eq $mysqlPath) {
        Write-Host "Khong tim thay MySQL. Vui long cai dat MySQL va them vao PATH." -ForegroundColor Red
        Write-Host ""
        Write-Host "Hoac ban co the tao database thu cong:" -ForegroundColor Yellow
        Write-Host "1. Mo MySQL Workbench hoac phpMyAdmin" -ForegroundColor White
        Write-Host "2. Chay lenh: CREATE DATABASE coffee_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" -ForegroundColor White
        exit 1
    }
    
    # Tao database
    $setupSql = Join-Path $PSScriptRoot "setup.sql"
    
    if ([string]::IsNullOrEmpty($MYSQL_PASS_PLAIN)) {
        mysql -u $MYSQL_USER -e "source $setupSql"
    } else {
        mysql -u $MYSQL_USER -p"$MYSQL_PASS_PLAIN" -e "source $setupSql"
    }
    
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host "Database da duoc tao thanh cong!" -ForegroundColor Green
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tiep theo, hay chay Backend:" -ForegroundColor White
    Write-Host "  cd backend" -ForegroundColor Yellow
    Write-Host "  mvn spring-boot:run" -ForegroundColor Yellow
    Write-Host ""
}
catch {
    Write-Host "Loi: $_" -ForegroundColor Red
}

Read-Host "Nhan Enter de dong..."








