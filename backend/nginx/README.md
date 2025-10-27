# Nginx Configuration

This directory contains the nginx reverse proxy configuration for production deployments.

## Files

- **nginx.conf** - Main nginx configuration with rate limiting and security headers

## Usage

### With Docker Compose

```bash
# Start with nginx proxy
docker-compose -f docker-compose.prod.yml --profile nginx up -d
```

### SSL/TLS Setup

1. Obtain SSL certificates (Let's Encrypt recommended):
   ```bash
   # Using certbot
   sudo certbot certonly --standalone -d your-domain.com
   ```

2. Copy certificates to `nginx/ssl/`:
   ```bash
   mkdir -p nginx/ssl
   cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
   cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
   ```

3. Uncomment HTTPS configuration in `nginx.conf`

4. Restart nginx:
   ```bash
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

## Features

- **Rate Limiting**: Protects against abuse
  - API endpoints: 10 requests/second
  - Auth endpoints: 5 requests/minute

- **Security Headers**: 
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Referrer-Policy

- **Gzip Compression**: Reduces bandwidth usage

- **Health Check**: `/health` endpoint for monitoring

## Logs

Nginx logs are stored in `nginx/logs/`:
- `access.log` - All requests
- `error.log` - Errors and warnings

## Customization

Edit `nginx.conf` to:
- Adjust rate limits
- Add custom headers
- Configure SSL settings
- Add additional locations
- Set up load balancing
