# E-Commerce Platform

A full-stack e-commerce application with product catalog, shopping cart, user authentication, order management, and Stripe checkout. Built as a Turborepo monorepo with a Next.js 15 storefront and an Express 5 API backed by PostgreSQL.

## Live Demo

[e-commerce-web-eight-alpha.vercel.app](https://e-commerce-web-eight-alpha.vercel.app)

## Features

- **Product Catalog** — Browse products by category with search and filtering
- **Shopping Cart** — Add/remove items, update quantities, persistent cart (user-based or session-based)
- **User Authentication** — Register/login with Passport.js local strategy and bcrypt password hashing
- **Checkout** — Stripe-powered payment flow with order creation
- **Order History** — View past orders with itemized details and price-at-time tracking
- **Shared UI Library** — Reusable component package (`@e-commerce/ui`) with Box, Button, Card, Stack, and Loading primitives
- **API Documentation** — Swagger/OpenAPI auto-generated docs
- **Dark/Light Mode** — Theme toggle

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Express.js 5, TypeScript, PostgreSQL |
| **Auth** | Passport.js (local strategy), bcrypt, express-session |
| **Payments** | Stripe |
| **Monorepo** | Turborepo, pnpm workspaces |
| **Shared Packages** | UI components, ESLint config, TypeScript config, shared types |
| **API Docs** | swagger-jsdoc, swagger-ui-express |

## Project Structure

```
e-commerce/
├── apps/
│   ├── server/       # Express.js REST API
│   │   ├── database/         # PostgreSQL schema (DDL)
│   │   └── src/
│   │       ├── routes/       # Products, carts, orders, checkout, users, categories
│   │       └── utils/        # Auth middleware, DB seeding, camelCase converter
│   └── web/          # Next.js storefront
│       └── src/
│           ├── app/          # App Router pages (products, cart, checkout, login, profile)
│           ├── components/   # Cart, Products, Login, Nav, Profile, Checkout
│           └── contexts/     # AuthContext, CartContext (React Context API)
└── packages/
    ├── eslint-config/        # Shared ESLint rules
    ├── types/                # Shared TypeScript types
    ├── typescript-config/    # Shared tsconfig presets
    └── ui/                   # Shared React component library
```

## Database Schema

PostgreSQL with UUID primary keys, automatic `updated_at` triggers, and referential integrity:

- **user** — Accounts with email verification and login tracking
- **category** — Hierarchical product categories (self-referencing)
- **product** — Catalog with Stripe product/price IDs, stock tracking, and JSONB dimensions
- **cart / cart_item** — User or session-based carts with quantity constraints
- **order / order_item** — Orders with price-at-time snapshots

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 9+
- PostgreSQL instance
- Stripe account

### Installation

```bash
pnpm install
pnpm run dev
```

### Seed the Database

```bash
cd apps/server
pnpm run seed
```
