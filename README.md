# Minecraft Hosting Platform

Platform hosting Minecraft berbasis home server Proxmox dengan integrasi Pterodactyl panel, sistem billing otomatis, dan provisioning server yang terintegrasi penuh.

## 🎯 Fitur Utama

- ✅ **Automated Provisioning** - Server Minecraft otomatis dibuat setelah pembayaran
- ✅ **Pterodactyl Integration** - Integrasi penuh dengan Pterodactyl panel
- ✅ **Billing System** - Sistem invoice dan pembayaran terintegrasi
- ✅ **User Dashboard** - Dashboard modern untuk manajemen server
- ✅ **Payment Gateway** - Integrasi dengan Midtrans (sandbox mode)
- ✅ **Real-time Status** - Monitor status server secara real-time
- ✅ **SSO to Panel** - Akses langsung ke Pterodactyl panel

## 🏗️ Arsitektur

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Frontend  │─────▶│   Backend    │─────▶│  Pterodactyl    │
│  (Next.js)  │      │  (Express)   │      │     Panel       │
└─────────────┘      └──────────────┘      └─────────────────┘
                            │
                            ├─────▶ PostgreSQL
                            ├─────▶ Redis (Queue)
                            └─────▶ Midtrans API
```

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- Pterodactyl Panel (sudah terinstall)
- (Optional) Docker & Docker Compose

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd minecraft-hosting
```

### 2. Setup Backend

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env dengan konfigurasi Anda
# Minimal yang harus diisi:
# - Database credentials
# - Pterodactyl URL dan API Key
# - JWT secrets
```

### 3. Setup Database

```bash
# Jalankan migrations
npm run migrate
```

### 4. Setup Frontend

```bash
cd ../frontend
npm install

# Buat file .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### 5. Run Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Aplikasi akan berjalan di:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Menggunakan Docker Compose

```bash
# Jalankan semua services
docker-compose up -d

# Lihat logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ⚙️ Konfigurasi Pterodactyl

### 1. Dapatkan API Key

1. Login ke Pterodactyl panel sebagai admin
2. Buka **Application API** di menu Account
3. Buat API key baru dengan permission:
   - Servers: Read & Write
   - Users: Read & Write
   - Nodes: Read
   - Nests: Read
   - Eggs: Read

### 2. Dapatkan Node, Nest, dan Egg ID

```bash
# Node ID
curl -X GET "https://panel.yourdomain.com/api/application/nodes" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"

# Nest ID (biasanya 1 untuk Minecraft)
curl -X GET "https://panel.yourdomain.com/api/application/nests" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"

# Egg ID (cari yang sesuai, misal PaperMC)
curl -X GET "https://panel.yourdomain.com/api/application/nests/1/eggs" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

### 3. Update .env Backend

```env
PTERODACTYL_URL=https://panel.yourdomain.com
PTERODACTYL_API_KEY=your_api_key_here
PTERODACTYL_NODE_ID=1
PTERODACTYL_NEST_ID=1
PTERODACTYL_EGG_ID=1
```

## 💳 Testing Payment Flow

Aplikasi ini menggunakan **payment simulation** untuk testing:

1. Register akun baru
2. Pilih package hosting
3. Buat order dengan nama server
4. Di halaman Billing, klik **"Pay Now"**
5. Payment akan otomatis berhasil (simulasi)
6. Server akan otomatis di-provision dalam beberapa detik

Untuk production, ganti dengan Midtrans credentials asli di `.env`:

```env
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false
```

## 📁 Struktur Project

```
minecraft-hosting/
├── backend/
│   ├── config/          # Database config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & validation
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # External services (Pterodactyl, Payment)
│   ├── jobs/            # Background jobs (provisioning)
│   ├── migrations/      # Database migrations
│   └── server.js        # Entry point
├── frontend/
│   ├── components/      # React components
│   ├── pages/           # Next.js pages
│   ├── utils/           # Utilities (API, auth)
│   └── styles/          # Global styles
└── docker-compose.yml   # Docker orchestration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Packages
- `GET /api/packages` - List semua packages
- `GET /api/packages/:id` - Get package detail
- `POST /api/packages` - Create package (admin)
- `PUT /api/packages/:id` - Update package (admin)

### Orders
- `POST /api/orders` - Create order baru
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order detail

### Billing
- `GET /api/billing/invoices` - List invoices
- `GET /api/billing/invoices/:id` - Get invoice detail
- `POST /api/billing/payment/create` - Create payment
- `POST /api/billing/payment/simulate` - Simulate payment (testing)
- `POST /api/billing/payment/webhook` - Payment webhook

### Servers
- `GET /api/servers` - List user servers
- `GET /api/servers/:id` - Get server detail
- `GET /api/servers/:id/stats` - Get server statistics
- `GET /api/servers/:id/sso` - Generate SSO link

## 🔐 Security Features

- JWT-based authentication dengan refresh tokens
- Password hashing dengan bcrypt
- Rate limiting pada API endpoints
- CORS protection
- SQL injection prevention (parameterized queries)
- XSS protection
- Environment-based secrets

## 🎨 Frontend Features

- Modern dark theme dengan gradients
- Responsive design (mobile-friendly)
- Real-time server status
- Invoice management
- Payment simulation
- SSO ke Pterodactyl panel

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Pastikan PostgreSQL running
# Windows (jika install manual):
pg_ctl status

# Atau cek service:
services.msc
```

### Pterodactyl API Error

1. Pastikan API key valid dan memiliki permission yang cukup
2. Cek URL panel (harus HTTPS untuk production)
3. Verify Node ID, Nest ID, dan Egg ID benar

### Server Provisioning Gagal

1. Cek logs backend: `npm run dev`
2. Cek Redis running: `redis-cli ping` (harus return PONG)
3. Cek queue jobs: lihat console output
4. Verify Pterodactyl panel accessible dari backend

## 📚 Learning Resources

Project ini dibuat untuk pembelajaran:

- **Backend**: Express.js, PostgreSQL, Redis, Bull Queue
- **Frontend**: Next.js, React, Modern CSS
- **Integration**: REST API, Webhooks, Background Jobs
- **DevOps**: Docker, Environment Management
- **Security**: JWT, Authentication, Authorization

## 🚀 Production Deployment

### Backend (VPS/Cloud)

1. Setup PostgreSQL dan Redis
2. Clone repository
3. Install dependencies: `npm install --production`
4. Setup environment variables
5. Run migrations: `npm run migrate`
6. Use PM2 untuk process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name minecraft-hosting-api
   pm2 startup
   pm2 save
   ```

### Frontend (Vercel/Netlify)

1. Push ke GitHub
2. Connect repository ke Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📝 License

MIT License - Free to use for learning purposes

## 🤝 Contributing

Contributions welcome! Ini adalah learning project, jadi feel free untuk:
- Report bugs
- Suggest features
- Submit pull requests
- Share improvements

## 📧 Support

Untuk pertanyaan atau bantuan, silakan buka issue di repository ini.

---

**Built with ❤️ for learning Minecraft hosting infrastructure**
