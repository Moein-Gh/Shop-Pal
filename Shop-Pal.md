# Shop Pal

## Overview

A shared shopping list app where users can create multiple named lists, add items to them, and manage those items collaboratively. The backend is a REST API built with Express and Prisma. Real-time sync and AI-assisted categorization are planned but not yet implemented.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite + TypeScript |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL hosted on Neon |
| ORM | Prisma |
| Auth | JWT (30-day expiry) + Google OAuth |
| Validation | Zod |

### Why Neon?

Neon is a free serverless PostgreSQL hosting service. Sign up at [neon.tech](https://neon.tech), create a project, copy the connection string, and paste it into your `.env` as `DATABASE_URL`. No credit card needed.

---

## What the App Does (Current State)

Users register or sign in via Google, then create and manage any number of named shopping lists. Each list has an owner. Items on a list can be added, edited, checked/unchecked, and deleted. Authorization is enforced: you can only interact with lists and items you are a member of.

---

## Data Model

### User

- `id`, `email`, `name`
- `password` (hashed with bcrypt — only set for email/password accounts)
- `googleId` (only set for Google OAuth accounts)

### List

- `id`, `name`, `ownerId`, `createdAt`
- A user can own and belong to multiple lists

### UserList (join table)

- Links a `userId` to a `listId`
- `status`: currently `OWNER` — designed to support membership roles (e.g. collaborator) in the future

### Item

- `id`, `name`, `listId`, `creatorUserId`
- Optional fields: `quantity` (string), `category` (string), `note` (string)
- `checked` (boolean, defaults to false)
- `createdAt` — items are returned ordered newest-first

---

## API

All routes except `/auth/*` require a `Bearer <token>` JWT in the `Authorization` header.

### Auth — `/auth`

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | `{ email, password, name? }` | Create account with email and password |
| POST | `/auth/login` | `{ email, password }` | Log in with email and password |
| POST | `/auth/google` | `{ idToken }` | Sign in or register via Google OAuth |

All three return `{ token, user: { id, email, name } }`.

### Lists — `/lists`

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| GET | `/lists` | — | Get all lists the authenticated user belongs to |
| POST | `/lists` | `{ name }` | Create a new list; caller becomes the owner |

### Items — `/items`

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| GET | `/items/:listId` | — | Get all items for a list (newest first) |
| POST | `/items` | `{ listId, name, quantity?, category?, note? }` | Add an item to a list you belong to |
| PATCH | `/items/:itemId` | `{ name, quantity?, category?, note? }` | Edit an item's fields |
| PATCH | `/items/check/:itemId` | — | Mark an item as checked |
| PATCH | `/items/uncheck/:itemId` | — | Mark an item as unchecked |
| DELETE | `/items/:itemId` | — | Delete an item |

**Authorization rules:**

- `POST /items` — verifies the caller is a member of the target list via `UserList`
- `check`, `uncheck`, `delete` — verify the caller is a member of the item's list
- `PATCH /items/:itemId` (edit) — currently only checks that the item exists, not list membership (to be fixed)

---

## Planned Features (Not Yet Implemented)

- **Real-time sync** — WebSocket support so both users see changes instantly without refreshing
- **AI categorization** — an agent that takes raw text input ("milk bread chicken") and organizes items into grocery categories automatically
- **List sharing / invites** — the `UserList` join table and `status` field are already in place to support adding collaborators to a list

---

## Notes

- This is a learning project — not production ready
- No email verification or password reset
- Google OAuth and email/password auth coexist; a user created via Google has no password and cannot log in via email
