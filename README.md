# SplitIt - Frontend

> 💰 **Split expenses effortlessly with friends and groups**

A modern, responsive web application built with Angular 18 and Material Design for managing shared expenses, group settlements, and financial tracking among friends.

[![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Material Design](https://img.shields.io/badge/Material-Design-757575?logo=material-design)](https://material.angular.io/)

## 🌟 Features

### 👤 User Management
- **Authentication & Authorization** - Secure JWT-based login/registration
- **Profile Management** - Update personal info, phone, and currency preferences
- **Friend System** - Add and manage friends for easy expense splitting

### 💳 Expense Tracking
- **Create & Split Expenses** - Easily add expenses and split among participants
- **Multiple Categories** - Food, Transport, Entertainment, Utilities, and more
- **Expense History** - View all your expenses with detailed information
- **Group Expenses** - Organize expenses by groups (trips, roommates, etc.)

### 👥 Group Management
- **Create Groups** - Set up groups for different occasions (trips, shared apartments, etc.)
- **Member Management** - Add/remove members from groups
- **Group Dashboard** - View group-specific expenses and settlements
- **Group Statistics** - Track total spending per group

### 💰 Settlement & Payments
- **Balance Overview** - See who owes you and whom you owe
- **Smart Settlement Suggestions** - Optimal payment paths to minimize transactions
- **Record Payments** - Mark settlements as paid
- **Settlement History** - Track all payment activities

### 📊 Dashboard
- **Financial Overview** - Quick stats on amounts owed and owing
- **Recent Activity** - Latest expenses at a glance
- **Quick Actions** - Fast access to create groups and add expenses

## 🛠️ Tech Stack

- **Framework**: Angular 18 (Standalone Components)
- **UI Library**: Angular Material Design
- **Language**: TypeScript 5.5
- **State Management**: RxJS
- **HTTP Client**: Angular HttpClient with JWT Interceptor
- **Routing**: Angular Router with Guards
- **Styling**: SCSS with Material Theming

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Angular CLI** (v18 or higher)
- **Backend API** running on `http://localhost:8080`

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Dhruv1030/splitit-frontend.git
cd splitit-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Backend API

The app is configured to connect to the backend at `http://localhost:8080`. If your backend runs on a different port, update:

- `src/environments/environment.ts`
- `proxy.conf.json`

### 4. Start Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/` - the app will auto-reload on file changes.

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core services, models, guards, interceptors
│   │   ├── guards/              # Route guards (auth)
│   │   ├── interceptors/        # HTTP interceptors (JWT)
│   │   ├── models/              # TypeScript interfaces/models
│   │   └── services/            # Business logic services
│   ├── features/                # Feature modules
│   │   ├── auth/                # Login & Registration
│   │   ├── dashboard/           # Main dashboard
│   │   ├── expenses/            # Expense management
│   │   ├── groups/              # Group management
│   │   ├── profile/             # User profile
│   │   └── settlements/         # Settlement tracking
│   ├── shared/                  # Shared components
│   │   ├── layout/              # Main layout wrapper
│   │   ├── navbar/              # Top navigation bar
│   │   └── sidebar/             # Side navigation menu
│   └── environments/            # Environment configurations
└── styles.scss                  # Global styles
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 4200 |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm test` | Run unit tests with Karma |
| `npm run lint` | Lint code with ESLint |

## 🌐 API Integration

The frontend connects to a microservices backend with the following services:

- **User Service** (port 8081) - Authentication & user management
- **Group Service** (port 8082) - Group operations
- **Expense Service** (port 8083) - Expense tracking
- **Settlement Service** (port 8084) - Payment settlements
- **API Gateway** (port 8080) - Unified API entry point

All requests go through the proxy configured in `proxy.conf.json`.

## 🔐 Authentication

The app uses JWT (JSON Web Tokens) for authentication:

1. User logs in → Backend returns JWT token
2. Token stored in `localStorage`
3. JWT Interceptor automatically adds token to all API requests
4. Auth Guard protects routes requiring authentication

## 🎨 Theming

The app uses Angular Material's theming system. Customize the theme in `src/styles.scss`:

```scss
@use '@angular/material' as mat;

$primary: mat.define-palette(mat.$indigo-palette);
$accent: mat.define-palette(mat.$pink-palette);
```

## 📱 Responsive Design

Fully responsive layout optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🐛 Known Issues & Workarounds

See `BACKEND_FIXES_COMPLETED.md` for backend integration notes and resolved issues.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Dhruv Patel**

- GitHub: [@Dhruv1030](https://github.com/Dhruv1030)

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Angular Material for beautiful UI components
- Backend Team for the robust API services

---

**Made with ❤️ using Angular & Material Design**
