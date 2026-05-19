# 📰 Production-Ready News Website Portal

A robust, decoupled, and high-performance full-stack news web application. This project uses a modern microservices architecture with a React frontend, a Node.js API Gateway, and a Spring Boot user service, backed by PostgreSQL and Redis.

---

## 🏗️ Decoupled System Architecture

```text
       ┌────────────────────────┐
       │   Vite React Client    │ (Port 3000)
       └───────────┬────────────┘
                   │
                   ▼ [REST API Proxy]
       ┌────────────────────────┐
       │  Node.js API Gateway   │ (Port 5000)
       └─────┬────────────┬─────┘
             │            │
   [Rate Limit / Cache]   └────────────────────────┐
             │                                     │ [Reverse Proxy Route]
             ▼                                     ▼
       ┌───────────┐                     ┌────────────────────────┐
       │Redis Cache│ (Port 6379)         │Spring Boot User Service│ (Port 8082)
       └───────────┘                     └───────────┬────────────┘
                                                     │
                                           [JPA Database Interface]
                                                     │
                                                     ▼
                                         ┌────────────────────────┐
                                         │  PostgreSQL Database   │ (Port 5432)
                                         └────────────────────────┘
```

---

## 📂 Project Repository Structure

```text
modern-news-app/
├── frontend/             # React SPA (Vite, TypeScript, Tailwind/Vanilla CSS)
├── backend-node/         # Express API Gateway (Redis integration, Rate limiting)
├── backend-spring/       # Spring Boot User service (Security, PostgreSQL JPA)
├── database/             # PostgreSQL database schemas and initialization scripts
└── docker-compose.yml    # Database containers orchestration profile
```

---

## 🚦 Project Implementation Progress

### 🏗️ Phase 1: Environment Setup & Architecture
- [x] Create root `.gitignore` rules
- [x] Configure PostgreSQL and Redis in `docker-compose.yml`
- [x] Design relational database schemas in `database/init.sql`
- [ ] Establish backend and frontend workspace folders
- [x] Write Spring Boot microservice build dependencies (`pom.xml`)
- [x] Write Node.js Express API Gateway configurations (`package.json`, `tsconfig.json`)

### 🔑 Phase 2: Core User & Database Setup (Spring Boot)
- [x] Configure database connection (`application.properties`)
- [x] Write JPA User model (`User.java`)
- [x] Write JPA Preference model (`UserPreference.java`)
- [x] Establish JPA database repositories (`UserRepository`, `UserPreferenceRepository`)
- [x] Implement stateless JWT token provider (`JwtTokenProvider.java`)
- [x] Build Spring Boot security UserDetails loader (`CustomUserDetailsService.java`)
- [x] Build Spring Boot JWT authentication filters & context config
- [x] Implement signup, login, and profile controllers

### ⚡ Phase 3: Gateway Setup & External Feeds (Node.js)
- [x] Create Gateway environment variables loader (`env.ts`)
- [x] Implement Redis server integration
- [x] Establish rate limiters and helmet shields
- [x] Build external NewsAPI client and cached request pipeline
- [x] Design mock-news article fallbacks
- [x] Configure Spring Boot routing gateway proxy

### ⚛️ Phase 4: Client Shell & Authentication (React)
- [ ] Initialize React + TS scaffold
- [ ] Map Outfit & typography styles
- [ ] Configure Axios clients with JWT auto-refresh interceptors
- [ ] Build global state store (`authStore.ts`)
- [ ] Create login and registration visual pages

### 📰 Phase 5: Dashboard, Bookmarks & Final Polish
- [ ] Build breaking category tag filters
- [ ] Create search-bar indices
- [ ] Create articles grid layout and card animations
- [ ] Establish bookmark syncing logic
- [ ] Final end-to-end integration and run validation
