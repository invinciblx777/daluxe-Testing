@echo off
echo ═══════════════════════════════════════════════════════
echo   DALUXE Website - Complete Setup Script
echo ═══════════════════════════════════════════════════════
echo.

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

echo 🗄️ Setting up database...
echo   Creating main database...
call node setup-database.js
if %errorlevel% neq 0 (
    echo ❌ Database setup failed
    pause
    exit /b 1
)

echo   Setting up categories...
call node setup-categories.js

echo   Setting up messages...
call node setup-messages.js

echo   Setting up orders...
call node update-orders-db.js

echo   Setting up coupons...
call node setup-coupons.js

echo   Setting up ads...
call node setup-ads.js

echo   Setting up product images...
call node setup-product-images.js

echo   Running image migration...
call node run-image-migration.js

echo ✅ Database setup completed successfully
echo.

echo ═══════════════════════════════════════════════════════
echo   🎉 Setup Complete!
echo ═══════════════════════════════════════════════════════
echo.
echo   To start the website, run: start-all.bat
echo   Or double-click start-all.bat
echo.
echo   Website will be available at:
echo   📱 Main Site: http://localhost:3001
echo   🔧 Admin Panel: http://localhost:3001/admin
echo.
echo   Admin Login: admin / admin123
echo ═══════════════════════════════════════════════════════
echo.
pause