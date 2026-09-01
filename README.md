# Clario

<div align="center">

<img src="./apps/web/public/logos/clario-logo.svg" alt="Clario Logo" width="140" />

### Team communication, collaboration, and productivity reimagined.

Modern, mobile-first workspace built for teams to chat, organize work, manage tasks, and stay connected with real-time messaging and instant notifications.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?logo=turborepo)](https://turbo.build/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

[Live App](https://clario-tma.vercel.app) • [Marketing Website](./apps/web) • [Documentation](./apps/docs)

</div>

---

## ✨ Overview

**Clario** is a unified, mobile-first team collaboration platform and Progressive Web App (PWA) designed to bring messaging, channel management, task tracking, and announcements together into one fast, intuitive experience.

Instead of fragmenting work across different tools for chat, to-do lists, announcements, and team administration, Clario combines everything inside synchronized workspaces.

---

## 🚀 Key Features

### 💬 Channels & Messaging
- **Multi-Channel Workspaces**: Organize conversations by team topics (e.g. `#messages`, `#announcements`, `#design`, `#development`).
- **Rich Message Types**: Post standard messages, high-priority **Announcements**, or checkable **Tasks** directly inside any channel.
- **Task & Chat Sync**: Messages marked as tasks automatically appear in the team's Task dashboard and channel tasks tab. Checking or completing a task in chat synchronizes in real time everywhere.
- **Message Moderation & Deletion**: Delete any message type with built-in modal confirmation and admin override capabilities.
- **Unread & Read Receipts**: Automatic unread badge counters and channel read timestamps.

### 📋 Integrated Task Management
- **Central & Team Task Boards**: Global view across all teams (`/tasks`) and team-specific boards (`/teams/[id]/info`).
- **Interactive Completion**: Check off tasks directly from chat or task boards with instant optimistic UI updates.
- **Safe Task Deletion**: Clean confirmation modals before removing tasks with automatic soft-deletion of associated chat messages.

### 🔔 In-App & Web Push Notifications
- **In-App Notification Center**: Dedicated notification feed (`/notifications`) with relative timestamps, unread counts, and direct deep-linking.
- **Web Push Notifications**: Service worker integration with browser push notifications for incoming messages, announcements, and tasks.
- **Customizable Preferences**: Toggle settings to filter task updates, announcements, and browser push alerts.

### 🛡️ Team & Account Governance
- **Role-Based Permissions**: Admin and Member roles with creator ownership safeguards.
- **Protected Actions**: Channel and Team deletions are restricted strictly to Admins and Creators with explicit confirmation prompts.
- **Secure Account Deletion**: GitHub/Render-style typed verification (`delete my account`) required before permanent data purging.
- **Secure Authentication**: NextAuth.js credential and OAuth flows with bcrypt password hashing.

### 📱 Installable PWA & Responsive Design
- **Cross-Platform PWA**: Installable on Android, iOS, macOS, Windows, and Linux via Web App Manifest and Service Worker.
- **Offline Fallback**: Offline detection banner with dedicated precached offline view.
- **Theme & Dark Mode**: Persistent Light / Dark mode with pre-hydration script preventing theme flicker.
- **Safe Area Insets**: Native-like navigation bars and drawer menus formatted for mobile notch and home indicators.

---

## 🏗 Monorepo Structure

```text
clario/
├── apps/
│   ├── app/               # Main full-stack Next.js application (App Router, PWA, API, Prisma)
│   ├── web/               # Marketing landing page and product showcase
│   ├── mobile/            # Expo / React Native mobile client
│   └── docs/              # Developer documentation site
│
├── packages/
│   ├── ui/                # Shared UI component library
│   ├── eslint-config/     # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript tsconfig bases
│
├── turbo.json             # Turborepo pipeline configuration
├── pnpm-workspace.yaml    # pnpm workspace definition
└── package.json           # Root package.json
```

---

## 🛠 Tech Stack

### Main Application (`apps/app`)
- **Framework**: Next.js 16.x (App Router, Server Actions & Route Handlers)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons, shadcn/ui primitives
- **State & Theme**: Custom ThemeProvider with local storage persistence and pre-hydration head scripts
- **Database & ORM**: PostgreSQL (Neon Serverless) with Prisma ORM 7.x
- **Authentication**: NextAuth.js (JWT strategy, bcryptjs)
- **PWA**: Custom Service Worker (`public/sw.js`), Web Push Notifications API, Web App Manifest

### Monorepo & Tooling
- **Build System**: Turborepo
- **Package Manager**: pnpm Workspaces
- **Code Quality**: ESLint, TypeScript Strict Mode, Prettier

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** 20.x or 22+
- **pnpm** 9.x or 10+
- **PostgreSQL** database (Local or [Neon](https://neon.tech))

### 1. Clone the repository
```bash
git clone https://github.com/POA200/Clario.git
cd Clario
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure environment variables
Create a `.env` file in `apps/app/`:
```env
# Database
DATABASE_URL="postgresql://user:password@host/clario?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="your-super-secret-key"

# Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3002"
```

### 4. Initialize the database
```bash
pnpm --filter app exec prisma db push
```

### 5. Start the development server
```bash
# Run all apps in development mode:
pnpm dev

# Or run only the main Clario app:
pnpm --filter app dev
```

The application will be running at [http://localhost:3002](http://localhost:3002).

---

## 📦 Common Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start all applications in watch mode via Turborepo |
| `pnpm build` | Build all applications and packages for production |
| `pnpm --filter app dev` | Start only the main Clario web app on port 3002 |
| `pnpm --filter app build` | Generate Prisma client and compile Next.js production build |
| `pnpm --filter web dev` | Start the marketing landing page |
| `pnpm --filter docs dev` | Start the documentation site |
| `pnpm lint` | Run ESLint across all workspaces |

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Peter Oluwaseyi**
- GitHub: [@POA200](https://github.com/POA200)

<div align="center">

Built with ❤️ for seamless team collaboration.

</div>
