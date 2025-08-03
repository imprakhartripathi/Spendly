# 💰 Spendly - Personal Finance Management System

<div align="center">

![Spendly Logo](client/public/logo.png)

**A comprehensive personal finance tracker with freemium tier system**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

[🚀 Quick Start](#-quick-start) • [📖 Features](#-features) • [🛠️ Tech Stack](#️-technology-stack) • [🔒 Security](#-security) • [📚 API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [🎯 About Spendly](#-about-spendly)
- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ Architecture](#️-architecture)
- [📚 API Documentation](#-api-documentation)
- [🔒 Security](#-security)
- [📱 User Interface](#-user-interface)
- [💳 Subscription Tiers](#-subscription-tiers)
- [🐳 Docker Deployment](#-docker-deployment)
- [🔧 Development](#-development)
- [📜 Scripts Overview](#-scripts-overview)
- [🌐 Environment Variables](#-environment-variables)
- [🧪 Testing](#-testing)
- [📈 Performance](#-performance)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 About Spendly

**Spendly** is a modern, full-stack personal finance management application designed to help users track their income, expenses, budgets, and financial goals. Built with the MERN stack and featuring a comprehensive freemium model, Spendly offers different feature sets across Free, Plus, and Premium tiers.

### 🌟 Key Highlights

- **💡 Smart Financial Tracking** - Intuitive expense and income management
- **📊 Advanced Analytics** - Beautiful charts and spending insights
- **🔄 Automated Features** - Recurring transactions and autopay (Premium)
- **🎨 Modern UI/UX** - Responsive design with Material-UI components
- **🔒 Enterprise Security** - JWT authentication with role-based access control
- **🐳 Production Ready** - Dockerized deployment with optimized builds
- **⚡ High Performance** - Fast loading with optimized caching strategies

---

## ✨ Features

### 🆓 Free Tier
- ✅ **User Authentication** - Secure signup and login
- ✅ **Transaction Management** - Add, edit, delete income and expenses
- ✅ **Transaction History** - View all your financial transactions
- ✅ **Basic Analytics** - Monthly income and expense summaries
- ✅ **Responsive Design** - Works on all devices

### ⭐ Plus Tier (₹99/month)
- ✅ **All Free Features**
- ✅ **Budget Management** - Set and track spending budgets
- ✅ **Category Analytics** - Detailed charts by spending categories
- ✅ **Trend Analysis** - View spending trends by category

### 🚀 Premium Tier (₹199/month)
- ✅ **All Plus Features**
- ✅ **Recurring Transactions** - Automated recurring transaction setup
- ✅ **Smart Notifications** - Alerts and reminders for bills/budget limits
- ✅ **Goal Tracking** - Monthly financial goal tracking

---

## 🚀 Quick Start

### 🎮 Interactive Runner (Recommended)

The easiest way to get started is using our beautiful interactive runner scripts:

#### Windows (PowerShell)
```powershell
.\start-spendly.ps1
```

#### Linux/macOS (Bash)
```bash
./run-spendly.sh
```

### 🎯 Direct Commands

#### Production Mode (Docker)
```powershell
.\start-spendly.ps1 -Mode production
# or
docker-compose up -d
```

#### Development Mode (Local)
```powershell
.\start-spendly.ps1 -Mode development
```

### 🌐 Access URLs

| Environment | Frontend | Backend |
|-------------|----------|---------|
| **Production** | http://localhost:5000 | http://localhost:4200 |
| **Development** | http://localhost:5173 | http://localhost:4200 |

---

## 🛠️ Technology Stack

### 🎨 Frontend
- **⚛️ React 19.1.0** - Modern UI library with latest features
- **🔷 TypeScript 5.8.3** - Type-safe JavaScript development
- **⚡ Vite 6.3.5** - Lightning-fast build tool and dev server
- **🎨 Material-UI 7.2.0** - Beautiful, accessible React components
- **📊 Recharts 3.1.0** - Responsive chart library for analytics
- **🎭 Framer Motion 12.23.0** - Smooth animations and transitions
- **🧭 React Router 7.6.3** - Client-side routing
- **🌐 Axios 1.10.0** - HTTP client for API communication
- **🎨 Sass 1.89.2** - Advanced CSS preprocessing

### 🔧 Backend
- **🟢 Node.js 20** - JavaScript runtime environment
- **⚡ Express 4.21.2** - Fast, minimalist web framework
- **🔷 TypeScript 5.7.2** - Type-safe server development
- **🍃 MongoDB 6.14.2** - NoSQL database with Mongoose ODM
- **🔐 JWT** - JSON Web Tokens for authentication
- **🔒 bcrypt 6.0.0** - Password hashing and security
- **📧 Nodemailer 6.10.0** - Email service integration
- **💳 Razorpay 2.9.6** - Payment gateway integration
- **⏰ node-cron 3.0.3** - Scheduled task automation
- **🔄 Nodemon 3.1.9** - Development auto-restart

### 🐳 DevOps & Deployment
- **🐳 Docker** - Containerization for consistent deployments
- **🌐 Nginx** - High-performance web server and reverse proxy
- **📦 Docker Compose** - Multi-container application orchestration
- **🔧 ESLint** - Code quality and consistency
- **🎯 Vite** - Optimized production builds

### 🗄️ Database
- **🍃 MongoDB Atlas** - Cloud-hosted MongoDB database
- **📊 Mongoose 8.9.6** - Elegant MongoDB object modeling
- **🔍 Indexing** - Optimized query performance
- **🔄 Aggregation Pipeline** - Complex data processing

---

## 🏗️ Architecture

### 📁 Project Structure
```
Spendly/
├── 🎨 client/                    # React frontend application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── utils/               # Utility functions
│   │   ├── assets/              # Static assets
│   │   └── main.tsx             # Application entry point
│   ├── public/                  # Public static files
│   ├── dockerfile               # Client Docker configuration
│   ├── nginx.conf               # Nginx server configuration
│   └── package.json             # Frontend dependencies
├── 🔧 server/                   # Node.js backend application
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Custom middleware
│   │   ├── mongodb/             # Database models and config
│   │   ├── services/            # Business logic services
│   │   ├── router.ts            # API route definitions
│   │   └── server.ts            # Server entry point
│   ├── dockerfile               # Server Docker configuration
│   └── package.json             # Backend dependencies
├── 🐳 docker-compose.yml        # Multi-container orchestration
├── 🚀 start-spendly.ps1        # Interactive Windows runner
├── 🚀 run-spendly.sh           # Interactive Unix runner
├── 🔨 build-fresh.ps1          # Fresh Docker build script
└── 📚 Documentation files
```

### 🔄 Data Flow
1. **Client Request** → React components make API calls via Axios
2. **Authentication** → JWT middleware validates user tokens
3. **Authorization** → Role-based access control checks user permissions
4. **Business Logic** → Controllers process requests and validate data
5. **Database** → MongoDB operations via Mongoose ODM
6. **Response** → JSON data returned to client
7. **UI Update** → React components re-render with new data

---

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/signup` | User registration | Public |
| `POST` | `/login` | User authentication | Public |
| `GET` | `/check-token` | Validate JWT token | Public |
| `GET` | `/getuserinfo` | Get user profile | Authenticated |

### 👤 User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `PATCH` | `/user/edit/:id` | Update user profile | Owner |
| `DELETE` | `/user/delete/:id` | Delete user account | Owner |

### 💰 Transaction Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/user/:id/add/transection` | Create new transaction | Owner |
| `GET` | `/user/:id/transections` | Get all transactions | Owner |
| `GET` | `/user/:id/transection` | Get specific transaction | Owner |
| `GET` | `/user/:id/search/transections` | Search transactions | Owner |
| `PATCH` | `/user/:id/edit/transection` | Update transaction | Owner |
| `DELETE` | `/user/:id/delete/transection` | Delete transaction | Owner |

### 🔔 Notification System

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/user/:id/notifications` | Get user notifications | Owner |
| `PATCH` | `/user/:id/notifications/read` | Mark notifications as read | Owner |
| `DELETE` | `/user/:id/notifications/clear` | Clear all notifications | Owner |

### 🔄 Autopay (Premium Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/user/:id/autopay` | Get autopay transactions | Premium |
| `POST` | `/user/:id/autopay` | Create autopay rule | Premium |
| `PATCH` | `/user/:id/autopay` | Update autopay rule | Premium |
| `DELETE` | `/user/:id/autopay` | Delete autopay rule | Premium |

### 💳 Payment Integration

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/create-subscription` | Create Razorpay subscription | Authenticated |
| `POST` | `/verify-payment/:id` | Verify payment status | Owner |
| `POST` | `/cancel-subs/:id` | Cancel subscription | Owner |

### 🛠️ Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/admin/process-monthly-savings` | Process monthly savings | Admin |
| `POST` | `/admin/send-savings-reminder` | Send savings reminders | Admin |

---

## 🔒 Security

### 🛡️ Authentication & Authorization
- **JWT Tokens** - Secure, stateless authentication
- **Password Hashing** - bcrypt with salt rounds for password security
- **Token Expiry** - Automatic session management
- **Role-Based Access Control (RBAC)** - Tier-based feature access
- **Ownership Middleware** - Users can only access their own data

### 🔐 Data Protection
- **Input Validation** - Comprehensive request validation
- **SQL Injection Prevention** - MongoDB's built-in protection
- **XSS Protection** - Content sanitization and security headers
- **CORS Configuration** - Controlled cross-origin requests
- **Environment Variables** - Sensitive data stored securely

### 🌐 Network Security
- **HTTPS Ready** - SSL/TLS encryption support
- **Security Headers** - Comprehensive HTTP security headers
- **Rate Limiting** - API abuse prevention (configurable)
- **Request Size Limits** - Protection against large payload attacks

### 🔍 Security Headers Implemented
```nginx
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 📱 User Interface

### 🎨 Design System
- **Material Design 3** - Modern, accessible design language
- **Responsive Layout** - Mobile-first approach with breakpoints
- **Dark/Light Theme** - User preference support
- **Accessibility** - WCAG 2.1 AA compliance
- **Smooth Animations** - Framer Motion for delightful interactions

### 📊 Key Components
- **📈 Dashboard** - Financial overview with key metrics
- **💰 Transaction Manager** - Add, edit, and categorize transactions
- **📊 Analytics Charts** - Interactive spending visualizations
- **🎯 Budget Tracker** - Visual budget progress indicators
- **🔔 Notification Center** - Real-time alerts and reminders
- **⚙️ Settings Panel** - User preferences and account management

### 📱 Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## 💳 Subscription Tiers

### 🆓 Free Tier - $0/month
Perfect for basic personal finance tracking
- ✅ Unlimited transactions
- ✅ Basic monthly summaries
- ✅ Mobile responsive interface
- ✅ Secure data storage

### ⭐ Plus Tier - ₹99/month
Enhanced features for serious budgeters
- ✅ **Everything in Free**
- ✅ Set and track budgets
- ✅ Category-wise analytics (charts)
- ✅ View spending trends by category

### 🚀 Premium Tier - ₹199/month
Complete financial management solution
- ✅ **Everything in Plus**
- ✅ Recurring transactions setup
- ✅ Alerts and reminders for bills/budget limits
- ✅ Monthly financial goal tracking
- ✅ Priority customer support

---

## 🐳 Docker Deployment

### 🚀 Production Deployment

#### Quick Start
```bash
# Using interactive script (recommended)
.\start-spendly.ps1 -Mode production

# Or directly with Docker Compose
docker-compose up -d
```

#### Fresh Build
```bash
# Complete rebuild with latest changes
.\build-fresh.ps1
```

### 📦 Container Details

#### 🎨 Client Container
- **Base Image**: `nginx:alpine` (81.7MB)
- **Build Process**: Multi-stage build with Node.js 20
- **Features**: Gzip compression, SPA routing, security headers
- **Port**: 5000 → 80

#### 🔧 Server Container
- **Base Image**: `node:20-alpine` (367MB)
- **Runtime**: TypeScript with ts-node and nodemon
- **Features**: Hot reload, MongoDB connection, cron jobs
- **Port**: 4200 → 4200

### 🔧 Docker Optimizations
- ✅ Multi-stage builds for smaller images
- ✅ .dockerignore files for faster builds
- ✅ Layer caching optimization
- ✅ Production-ready Nginx configuration
- ✅ Health checks and restart policies

---

## 🔧 Development

### 🛠️ Prerequisites
- **Node.js 20+** - JavaScript runtime
- **npm 10+** - Package manager
- **MongoDB Atlas** - Database (or local MongoDB)
- **Docker** - For containerized development (optional)

### 🚀 Development Setup

#### Using Interactive Script (Recommended)
```bash
.\start-spendly.ps1 -Mode development
```

#### Manual Setup
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Start development servers
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend
cd client && npm run dev
```

### 🔄 Development Features
- **⚡ Hot Module Replacement** - Instant UI updates
- **🔄 Auto-restart** - Server restarts on file changes
- **🗺️ Source Maps** - Easy debugging
- **🎯 Error Overlay** - Development error display
- **📊 Dev Tools** - React and Redux DevTools support

### 🧪 Available Scripts

#### Server Scripts
```bash
npm start          # Start with nodemon (development)
npm run fresh      # Clear console and start
npm run setup      # Install, fund, and start
```

#### Client Scripts
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## 📜 Scripts Overview

### 🎮 Interactive Runners

#### `start-spendly.ps1` (Windows PowerShell)
Beautiful, interactive script with:
- 🎨 ASCII art banner and colorful logging
- 🎯 Interactive mode selection
- 🔍 Automatic dependency detection
- 🛡️ Comprehensive error handling
- 🪟 Separate terminal windows for dev servers

#### `run-spendly.sh` (Linux/macOS Bash)
Cross-platform script featuring:
- 🌈 Same beautiful interface as PowerShell
- 🔄 Background process management
- 📝 Auto-creation of stop scripts
- 🐧 Native Unix tools integration

### 🐳 Docker Scripts

#### `build-fresh.ps1`
Complete Docker rebuild script:
- 🧹 Cleans existing containers and images
- 🔨 Builds fresh images without cache
- 🚀 Starts application in production mode
- 📊 Shows final status and URLs



### 📚 Documentation
- `DOCKER_DEPLOYMENT.md` - Complete Docker guide
- `RUNNER_SCRIPTS.md` - Detailed script documentation
- `SCRIPTS_OVERVIEW.md` - Quick reference guide

---

## 🌐 Environment Variables

### 🔧 Server Configuration
Create `server/src/.env`:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendly

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration (Nodemailer)
APP_MAIL=your-email@gmail.com
MAIL_PASS=your-app-password

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Subscription Plan IDs
PLUS_ID=your-plus-plan-id
PREMIUM_ID=your-premium-plan-id

# Server Configuration
PORT=4200
CLIENT_PORT=5000
TUNNEL_URL=your-tunnel-url
NODE_ENV=production
```

### 🎨 Client Configuration
Create `client/.env`:
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id

```

---

## 🧪 Testing

### 🔬 Testing Strategy
- **Unit Tests** - Individual component and function testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user workflow testing
- **Security Tests** - Authentication and authorization testing

### 🛠️ Testing Tools
- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing
- **Supertest** - HTTP assertion library
- **MongoDB Memory Server** - In-memory database for testing

### 🚀 Running Tests
```bash
# Server tests
cd server && npm test

# Client tests
cd client && npm test

# Coverage reports
npm run test:coverage
```

---

## 📈 Performance

### ⚡ Optimization Features
- **Code Splitting** - Lazy loading of components
- **Tree Shaking** - Unused code elimination
- **Image Optimization** - Compressed and responsive images
- **Caching Strategy** - Browser and server-side caching
- **Bundle Analysis** - Webpack bundle analyzer integration

### 📊 Performance Metrics
- **First Contentful Paint** - < 1.5s
- **Largest Contentful Paint** - < 2.5s
- **Time to Interactive** - < 3.5s
- **Cumulative Layout Shift** - < 0.1

### 🔧 Database Optimization
- **Indexing** - Optimized database queries
- **Aggregation Pipeline** - Efficient data processing
- **Connection Pooling** - Optimized database connections
- **Query Optimization** - Minimized database calls

---

## 🤝 Contributing

### 🌟 How to Contribute
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 📋 Development Guidelines
- Follow **TypeScript** best practices
- Write **comprehensive tests** for new features
- Update **documentation** for API changes
- Follow **conventional commits** format
- Ensure **responsive design** for UI changes

### 🐛 Bug Reports
Please include:
- **Environment details** (OS, Node.js version, browser)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](Lisence) file for details.

---

## 👨‍💻 Author

**Prakhar Tripathi**
- 🌐 Portfolio: https://imprakhartripathi.github.io/Portfolio/
- 💼 LinkedIn: https://www.linkedin.com/in/imprakhartripathi/
- 📧 Email: imprakhartripathiofficial@gmail.com
- 🐙 GitHub: https://github.com/imprakhartripathi

---

## 🙏 Acknowledgments

- **Material-UI Team** - For the beautiful component library
- **MongoDB Team** - For the excellent database solution
- **React Team** - For the amazing frontend framework
- **Node.js Community** - For the robust backend runtime
- **Docker Team** - For containerization technology

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

**Made with ❤️ by Prakhar Tripathi**


</div>

