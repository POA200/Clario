# Clario

<div align="center">

<img src="./apps/web/public/logos/clario-logo.svg" alt="Clario Logo" width="120" />

### Team communication, collaboration, and productivity reimagined.

Modern messaging built for teams to chat, organize work, manage tasks, and stay connected in one beautiful mobile experience.

[Website](https://clario-tma.vercel.app) • [Documentation](./apps/docs) • [Report Bug](../../issues) • [Request Feature](../../issues)

</div>

---

## ✨ Overview

Clario is a modern mobile-first team communication platform designed to simplify collaboration.

Instead of switching between multiple applications for messaging, task management, announcements, and team organization, Clario brings everything together into one seamless experience.

The project consists of:

- 📱 A mobile application built with Expo and React Native.
- 🌐 A responsive marketing website built with Next.js.
- 📚 Documentation for developers and contributors.
- 📦 A shared monorepo architecture for scalability.

---

## 🚀 Features

### Messaging

- Real-time team chat
- Direct Messages
- Group conversations
- Read receipts
- Message reactions
- Media sharing

### Team Collaboration

- Team creation
- Invite members
- Role management
- Announcements
- Shared workspaces

### Productivity

- Task management
- Assign tasks
- Due dates
- Progress tracking
- Team organization

### User Experience

- Beautiful modern interface
- Responsive landing page
- Dark mode
- Fast performance
- Smooth animations

---

# 🏗 Project Structure

```text
clario/
│
├── apps/
│   ├── mobile/        # Expo React Native application
│   ├── web/           # Next.js landing page
│   └── docs/          # Documentation
│
├── packages/
│   ├── ui/            # Shared UI components
│   ├── eslint-config/
│   └── typescript-config/
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

# 🛠 Tech Stack

## Mobile

- Expo SDK 57
- React Native
- Expo Router
- TypeScript

## Web

- Next.js
- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui

## Tooling

- Turborepo
- pnpm Workspaces
- ESLint
- Prettier

---

# ⚡ Getting Started

## Prerequisites

- Node.js 22+
- pnpm
- Git

---

## Clone the repository

```bash
git clone https://github.com/POA200/Clario.git

cd Clario
```

---

## Install dependencies

```bash
pnpm install
```

---

## Run the web app

```bash
pnpm --filter web dev
```

---

## Run the mobile app

```bash
pnpm --filter mobile start
```

---

# 📂 Applications

## Web

The web application serves as Clario's public website.

Features include:

- Landing page
- Product showcase
- Responsive design
- Download links
- Marketing pages

---

## Mobile

The mobile application is the core product.

Features include:

- Authentication
- Team management
- Messaging
- Tasks
- Profile
- Notifications

---

# 🎨 Design Principles

Clario follows a simple philosophy:

- Clean
- Modern
- Accessible
- Fast
- Mobile-first
- Minimal distractions

---

# 🛣 Roadmap

## Phase 1

- [x] Turborepo setup
- [x] Landing page
- [x] Mobile project setup
- [ ] Design system
- [ ] Onboarding

---

## Phase 2

- [ ] Authentication
- [ ] Team creation
- [ ] Team invitations

---

## Phase 3

- [ ] Channels
- [ ] Real-time messaging

---

## Phase 4

- [ ] Tasks
- [ ] Notifications
- [ ] User settings

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Peter Oluwaseyi**

- GitHub: https://github.com/POA200

---

<div align="center">

Built with ❤️ using Expo, Next.js and Turborepo.

</div>
