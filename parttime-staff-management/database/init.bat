@echo off
echo =====================================================
echo Coffee House - Database Setup
echo =====================================================
echo.

set /p MYSQL_USER=Nhap MySQL username (mac dinh: root): 
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASS=123456: 

echo.
echo Dang tao database...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% < setup.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================
    echo Database da duoc tao thanh cong!
    echo =====================================================
    echo.
    echo Tiep theo, hay chay Backend:
    echo   cd backend
    echo   mvn spring-boot:run
    echo.
) else (
    echo.
    echo Loi: Khong the tao database. Vui long kiem tra lai MySQL.
)

pause








