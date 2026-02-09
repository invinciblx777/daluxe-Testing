# DALUXE - Luxury Ayurvedic Skincare E-commerce Website

## 🚀 Project Overview
A complete e-commerce website for luxury ayurvedic skincare products with admin panel, order management, and payment integration.

## 📋 Prerequisites
Before running this project, ensure you have:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
3. **Git** (optional) - [Download here](https://git-scm.com/)

## 🛠️ Installation & Setup

### Step 1: Extract Project Files
Extract the project zip file to your desired location.

### Step 2: Install Dependencies
```bash
cd DALUXE-Website
npm install
```

### Step 3: Database Setup
1. **Start MySQL service** on your system
2. **Create MySQL user** (if not using root):
   ```sql
   CREATE USER 'your_username'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON *.* TO 'your_username'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Update database credentials** in `api-server.js` (line 25):
   ```javascript
   const db = mysql.createConnection({
       host: 'localhost',
       user: 'root',              // Change if needed
       password: 'Malaveeka@20',  // Change to your MySQL password
       database: 'luxe_beauty'
   });
   ```

4. **Run database setup**:
   ```bash
   node setup-database.js
   node setup-categories.js
   node setup-messages.js
   node update-orders-db.js
   node setup-coupons.js
   node setup-ads.js
   node setup-product-images.js
   node run-image-migration.js
   ```

### Step 4: Start the Application
```bash
# Option 1: Use the batch file (Windows)
start-all.bat

# Option 2: Start servers manually
# Terminal 1 - Main Website Server
node server.js

# Terminal 2 - API Server  
node api-server.js
```

## 🌐 Access URLs

- **Main Website**: http://localhost:3001
- **Admin Panel**: http://localhost:3001/admin
- **API Server**: http://localhost:3002

### Admin Login Credentials
- **Username**: admin
- **Password**: admin123

## 📁 Project Structure

```
DALUXE-Website/
├── public/                 # Frontend files
│   ├── index.html         # Main website
│   ├── admin-dashboard.html # Admin panel
│   ├── styles.css         # Main styles
│   └── *.js              # Frontend JavaScript
├── uploads/               # Product & ad images
├── server.js             # Main web server
├── api-server.js         # Backend API server
├── setup-*.js           # Database setup scripts
└── package.json         # Dependencies
```

## 🔧 Configuration

### Database Configuration
- **Database Name**: luxe_beauty
- **Default Password**: Malaveeka@20
- **Port**: 3306 (MySQL default)

### Server Ports
- **Main Server**: 3001
- **API Server**: 3002

## 📊 Features

### Customer Features
- Product browsing and search
- Shopping cart and wishlist
- Checkout with multiple payment options
- Order tracking
- Coupon system

### Admin Features
- Product management (CRUD)
- Order management
- Customer management
- Coupon management
- Ad management
- Analytics dashboard

## 🛡️ Security Notes

1. **Change default passwords** before production
2. **Update MySQL credentials** for security
3. **Configure HTTPS** for production deployment
4. **Set up proper firewall rules**

## 🚀 Production Deployment

### For VPS/Cloud Deployment:
1. Install Node.js and MySQL on server
2. Upload project files
3. Configure domain and SSL
4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "daluxe-web"
   pm2 start api-server.js --name "daluxe-api"
   pm2 startup
   pm2 save
   ```

### Environment Variables (Recommended):
Create `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=luxe_beauty
WEB_PORT=3001
API_PORT=3002
```

## 📞 Support

For technical support or questions:
- Check the troubleshooting section below
- Review server logs for errors
- Ensure all prerequisites are installed

## 🔍 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Verify MySQL is running
   - Check credentials in api-server.js
   - Ensure luxe_beauty database exists

2. **Port Already in Use**
   - Change ports in server.js and api-server.js
   - Kill existing processes using the ports

3. **Images Not Loading**
   - Check uploads folder permissions
   - Verify image paths in database

4. **Admin Panel Not Working**
   - Clear browser cache
   - Check browser console for errors
   - Verify API server is running

## 📝 License
This project is proprietary software developed for DALUXE.

---
**Developed by**: Glacier Studios  
**Version**: 1.0.0  
**Last Updated**: January 2026