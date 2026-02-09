# 🚀 DALUXE Website - Production Deployment Guide

## 🌐 Hosting Options

### Recommended Hosting Providers:
1. **DigitalOcean** - $5/month droplet
2. **AWS EC2** - t2.micro (free tier)
3. **Linode** - $5/month VPS
4. **Vultr** - $2.50/month VPS

## 📋 Server Requirements

### Minimum Specifications:
- **CPU**: 1 vCPU
- **RAM**: 1GB (2GB recommended)
- **Storage**: 25GB SSD
- **OS**: Ubuntu 20.04 LTS or CentOS 8
- **Bandwidth**: 1TB/month

## 🛠️ Production Setup Steps

### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Web Server)
sudo apt install nginx -y
```

### 2. Upload Project Files
```bash
# Create project directory
sudo mkdir -p /var/www/daluxe
sudo chown $USER:$USER /var/www/daluxe

# Upload files (use SCP, SFTP, or Git)
scp -r DALUXE-Website/* user@your-server:/var/www/daluxe/
```

### 3. Database Setup
```bash
cd /var/www/daluxe

# Install dependencies
npm install

# Setup MySQL database
sudo mysql -u root -p
```

```sql
CREATE DATABASE luxe_beauty;
CREATE USER 'daluxe_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON luxe_beauty.* TO 'daluxe_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Configure Application
```bash
# Update database credentials in api-server.js
nano api-server.js

# Update the connection settings:
const db = mysql.createConnection({
    host: 'localhost',
    user: 'daluxe_user',
    password: 'secure_password_here',
    database: 'luxe_beauty'
});
```

### 5. Run Database Setup
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

### 6. Start with PM2
```bash
# Start both servers
pm2 start server.js --name "daluxe-web"
pm2 start api-server.js --name "daluxe-api"

# Save PM2 configuration
pm2 startup
pm2 save

# Check status
pm2 status
```

### 7. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/daluxe
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Main website
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/daluxe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔒 Security Hardening

### 1. Firewall Setup
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. MySQL Security
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Disable remote root login
sudo mysql -u root -p
```

```sql
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
FLUSH PRIVILEGES;
```

### 3. Application Security
- Change default admin credentials
- Use environment variables for sensitive data
- Regular security updates
- Monitor logs for suspicious activity

## 📊 Monitoring & Maintenance

### 1. PM2 Monitoring
```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart all
```

### 2. Database Backup
```bash
# Create backup script
nano /home/user/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u daluxe_user -p'secure_password_here' luxe_beauty > /home/user/backups/daluxe_$DATE.sql
find /home/user/backups/ -name "daluxe_*.sql" -mtime +7 -delete
```

```bash
# Make executable and schedule
chmod +x /home/user/backup-db.sh
crontab -e
# Add: 0 2 * * * /home/user/backup-db.sh
```

### 3. Log Rotation
```bash
sudo nano /etc/logrotate.d/daluxe
```

```
/var/www/daluxe/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 www-data www-data
}
```

## 🚀 Performance Optimization

### 1. Enable Gzip Compression
```nginx
# Add to nginx config
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. Static File Caching
```nginx
# Add to nginx config
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Database Optimization
```sql
# Add indexes for better performance
USE luxe_beauty;
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
```

## 📞 Troubleshooting

### Common Issues:

1. **Site not loading**: Check PM2 status, Nginx config
2. **Database errors**: Verify credentials, connection
3. **SSL issues**: Check certificate validity, renewal
4. **Performance issues**: Monitor resources, optimize queries

### Useful Commands:
```bash
# Check service status
sudo systemctl status nginx
sudo systemctl status mysql
pm2 status

# View logs
sudo tail -f /var/log/nginx/error.log
pm2 logs daluxe-web
pm2 logs daluxe-api

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

---

**Remember**: Always test changes on a staging environment first!