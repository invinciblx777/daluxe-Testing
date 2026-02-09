# 🚀 DALUXE Website - Quick Installation Guide

## ⚡ Quick Start (5 Minutes)

### 1. Prerequisites Check
- ✅ Node.js installed? Run: `node --version`
- ✅ MySQL installed and running?
- ✅ Project files extracted?

### 2. One-Command Setup
```bash
# Navigate to project folder
cd DALUXE-Website

# Install dependencies
npm install

# Setup database (run these in order)
node setup-database.js
node setup-categories.js  
node setup-messages.js
node update-orders-db.js
node setup-coupons.js
node setup-ads.js
node setup-product-images.js
node run-image-migration.js
```

### 3. Start Application
```bash
# Windows users - double click this file:
start-all.bat

# OR run manually:
# Terminal 1: node server.js
# Terminal 2: node api-server.js
```

### 4. Access Website
- **Website**: http://localhost:3001
- **Admin**: http://localhost:3001/admin (admin/admin123)

## 🔧 If Something Goes Wrong

### MySQL Password Issue?
Edit `api-server.js` line 25:
```javascript
password: 'YOUR_MYSQL_PASSWORD_HERE'
```

### Port Already Used?
Edit ports in `server.js` and `api-server.js`:
```javascript
const PORT = 3001; // Change to 3005 or any free port
```

### Database Errors?
1. Make sure MySQL is running
2. Check if you can connect: `mysql -u root -p`
3. Re-run setup scripts

## 📞 Need Help?
Check the full README.md for detailed troubleshooting.