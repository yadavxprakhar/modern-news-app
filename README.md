<div align="center">

<h1>⚡ e-akhbar</h1>
<p><strong>A premium, production-ready news portal built on a modern microservices architecture.</strong></p>

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel" />
  <img src="https://img.shields.io/badge/API_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" />
</p>

</div>

---

## 🏗️ System Architecture

A fully decoupled, multi-layer architecture with a dedicated API Gateway sitting between the React client and the backend services.

```
        ┌──────────────────────────────────────┐
        │       React SPA (Vite + TS)          │  → Deployed on Vercel
        └──────────────────┬───────────────────┘
                           │  REST (Axios + JWT Interceptors)
                           ▼
        ┌──────────────────────────────────────┐
        │       Node.js API Gateway            │  → Deployed on Render
        │  • Rate Limiting  • Helmet Security  │
        │  • NewsAPI Client • Redis Caching    │
        └────────────┬─────────────────────────┘
                     │                    │
          [Cache Layer]           [Reverse Proxy]
                     │                    │
             ┌───────────┐    ┌───────────────────────┐
             │   Redis   │    │  Spring Boot Service  │  → Deployed on Render
             └───────────┘    │  • JWT Auth  • JPA    │
                              └───────────┬───────────┘
                                          │  JPA / Hibernate
                                          ▼
                              ┌───────────────────────┐
                              │  PostgreSQL Database  │  → Neon (Cloud)
                              └───────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Stateless auth with auto-refresh token interceptors |
| 📰 **Live News Feed** | Real-time articles from NewsAPI with Redis caching |
| 🔖 **Bookmarks** | Persist and sync saved articles across sessions |
| 🎨 **Dark Mode** | System-aware theme toggle with smooth transitions |
| 🏷️ **Category Filters** | Filter news by topic (Tech, Sports, Business, etc.) |
| 🔍 **Search** | Live search across article titles and descriptions |
| 📱 **Responsive Design** | Fully adaptive layout from mobile to 4K |
| ⚡ **Performance** | Image preloading, Redis caching, and Vite bundling |

---

## 📂 Repository Structure

```
e-akhbar/
├── frontend/              # React 18 + TypeScript SPA (Vite)
│   ├── src/
│   │   ├── api/           # Axios clients with JWT interceptors
│   │   ├── components/    # ArticleCard, SearchBar, CategoryFilter, etc.
│   │   ├── hooks/         # useNews, useBookmarks custom hooks
│   │   ├── pages/         # LoginPage, RegisterPage, CompanyPages
│   │   ├── store/         # Auth context & global state
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Helper functions
│   └── vercel.json        # Vercel SPA rewrite + API proxy rules
│
├── backend-node/          # Express API Gateway
│   ├── Rate limiting & Helmet security headers
│   ├── NewsAPI integration with Redis caching
│   └── Reverse proxy to Spring Boot service
│
├── backend-spring/        # Spring Boot User Microservice
│   ├── JWT token provider & security filters
│   ├── JPA User & Preferences models
│   └── REST auth controllers (login, register, profile)
│
├── database/              # PostgreSQL schemas & init scripts
└── docker-compose.yml     # Local dev orchestration (Postgres + Redis)
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+, Java 17+, Docker

### 1. Start Databases
```bash
docker-compose up -d
```

### 2. Start Spring Boot Service
```bash
cd backend-spring
./mvnw spring-boot:run
```

### 3. Start Node.js Gateway
```bash
cd backend-node
npm install && npm run dev
```

### 4. Start React Frontend
```bash
cd frontend
npm install && npm run dev
```

App will be available at **http://localhost:3000**

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | Auto-deploys on push to `main` |
| API Gateway | Render | `news-backend-node-36tn.onrender.com` |
| User Service | Render | Spring Boot container |
| Database | Neon | Managed PostgreSQL |

---

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, Vanilla CSS, Lucide Icons  
**Gateway:** Node.js, Express, Redis, Axios, Helmet, express-rate-limit  
**Backend:** Spring Boot 3, Spring Security, JWT, JPA / Hibernate  
**Database:** PostgreSQL 16, Redis 7  
**DevOps:** Docker Compose, Vercel, Render, Neon

---

<div align="center">
  <p>Built with ❤️ by <strong>Prakhar</strong></p>
</div>
