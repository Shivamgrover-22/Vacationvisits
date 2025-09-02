# VacationVisits Deployment Guide

## Nginx Configuration

### 1. Install Nginx (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nginx
```

### 2. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/vacationvisits
```

Copy the contents from `nginx.conf` and update these paths:
- `/path/to/your/vacation/frontend` → Your actual frontend directory
- `/path/to/your/certificate.crt` → Your SSL certificate path
- `/path/to/your/private.key` → Your SSL private key path

### 3. Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/vacationvisits /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

## Node.js Backend Setup

### 1. Install Node.js and Dependencies
```bash
cd /path/to/your/backend
npm install
```

### 2. Environment Variables
Create `.env` file:
```bash
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Backend
```bash
# Development
npm run dev

# Production (with PM2)
npm install -g pm2
pm2 start server.js --name vacationvisits-backend
pm2 startup
pm2 save
```

## SSL Certificate Setup

### Option 1: Let's Encrypt (Free)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d vacationvisits.in -d www.vacationvisits.in
```

### Option 2: Custom Certificate
Update the SSL paths in nginx.conf to point to your certificate files.

## File Structure
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
    └── .env
```

## Testing

1. **Frontend**: Visit `https://vacationvisits.in`
2. **API**: Test `https://vacationvisits.in/api/health`
3. **Admin**: Visit `https://vacationvisits.in/admin.html`

## Troubleshooting

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check Node.js Backend
```bash
pm2 status
pm2 logs vacationvisits-backend
```

### Test API Endpoints
```bash
curl https://vacationvisits.in/api/health
curl -X POST https://vacationvisits.in/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"1234567890","destination":"Dubai","message":"Test message"}'
```

## Firewall Configuration

### UFW (Ubuntu Firewall)
```bash
# Enable UFW
sudo ufw enable

# Allow SSH (be careful - don't lock yourself out!)
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow Node.js backend (only if not using Nginx proxy)
# sudo ufw allow 3000

# Check status
sudo ufw status
```

### Alternative: iptables
```bash
# Allow HTTP and HTTPS
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Save rules (Ubuntu/Debian)
sudo iptables-save > /etc/iptables/rules.v4
```

## Security Notes

1. **Protect Admin Panel**: Add authentication to `/admin.html`
2. **Rate Limiting**: Consider adding rate limiting to API endpoints
3. **Firewall**: Ensure only ports 80, 443, and 22 are open
4. **Updates**: Keep Nginx and Node.js updated
5. **SSL**: Always use HTTPS in production
6. **Environment Variables**: Never commit `.env` files to version control
