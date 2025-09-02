# Production Deployment Testing Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Create `.env` file on your VPS:
```bash
PORT=3000
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 2. File Structure on VPS
```
/var/www/vacationvisits/
├── frontend/          # Your HTML, CSS, JS files
│   ├── index.html
│   ├── style.css
│   ├── main.js
│   ├── admin.html
│   └── vacation_logo.png
└── backend/           # Your Node.js backend
    ├── server.js
    ├── db.js
    ├── package.json
    ├── .env
    └── data/          # SQLite database will be created here
```

## Step-by-Step Deployment

### 1. Upload Files to VPS
```bash
# Upload frontend files
scp -r frontend/* user@your-vps:/var/www/vacationvisits/frontend/

# Upload backend files
scp -r backend/* user@your-vps:/var/www/vacationvisits/backend/
```

### 2. Install Dependencies
```bash
cd /var/www/vacationvisits/backend
npm install
```

### 3. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/vacationvisits
# Copy contents from nginx.conf and update paths:
# - root /var/www/vacationvisits/frontend;
# - ssl_certificate /path/to/your/certificate.crt;
# - ssl_certificate_key /path/to/your/private.key;

sudo ln -s /etc/nginx/sites-available/vacationvisits /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Start Backend with PM2
```bash
cd /var/www/vacationvisits/backend
npm install -g pm2
pm2 start server.js --name vacationvisits-backend
pm2 startup
pm2 save
```

## Testing Commands

### 1. Test Backend Directly
```bash
# Test if backend is running
curl http://localhost:3000/api/health

# Test enquiry submission
curl -X POST http://localhost:3000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"1234567890","destination":"Dubai","message":"Test message"}'
```

### 2. Test Through Nginx (Production)
```bash
# Test health endpoint
curl https://vacationvisits.in/api/health

# Test enquiry submission
curl -X POST https://vacationvisits.in/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"1234567890","destination":"Dubai","message":"Test message"}'

# Test admin endpoints
curl https://vacationvisits.in/api/admin/enquiries
curl https://vacationvisits.in/api/admin/searches
```

### 3. Test Frontend
1. Visit `https://vacationvisits.in`
2. Fill out the enquiry form and submit
3. Check if data appears in admin panel: `https://vacationvisits.in/admin.html`
4. Test search functionality
5. Test deal modals

## Troubleshooting

### Backend Not Starting
```bash
# Check PM2 status
pm2 status
pm2 logs vacationvisits-backend

# Check if port 3000 is in use
sudo netstat -tlnp | grep :3000

# Check Node.js version
node --version
npm --version
```

### CORS Issues
```bash
# Check browser console for CORS errors
# Verify CORS configuration in server.js
# Check Nginx CORS headers
```

### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### Database Issues
```bash
# Check if database file exists
ls -la /var/www/vacationvisits/backend/data/

# Check database permissions
sudo chown -R www-data:www-data /var/www/vacationvisits/backend/data/
```

## Performance Monitoring

### 1. Monitor Backend
```bash
# PM2 monitoring
pm2 monit

# Check system resources
htop
```

### 2. Monitor Nginx
```bash
# Check Nginx status
sudo systemctl status nginx

# Monitor access logs
sudo tail -f /var/log/nginx/access.log | grep -E "(POST|GET) /api/"
```

## Security Verification

### 1. SSL Certificate
```bash
# Test SSL configuration
openssl s_client -connect vacationvisits.in:443 -servername vacationvisits.in
```

### 2. Firewall
```bash
# Check UFW status
sudo ufw status

# Test if port 3000 is blocked from outside
telnet your-vps-ip 3000  # Should fail if firewall is working
```

### 3. Admin Panel Security
- Verify admin panel is accessible at `https://vacationvisits.in/admin.html`
- Consider adding basic authentication to admin panel
- Monitor admin access logs

## Rollback Plan

If deployment fails:
```bash
# Stop current backend
pm2 stop vacationvisits-backend

# Restore previous version
pm2 start previous-server.js --name vacationvisits-backend

# Or restore from backup
cp /backup/server.js /var/www/vacationvisits/backend/
pm2 restart vacationvisits-backend
```
