# Grocery List App

## Overview

A real-time shared grocery list app for two users (you and your partner). Items are added via text, organized by category using an AI agent, and synced in real time between both users.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Express.js + TypeScript |
| Real-time | WebSockets |
| Database | PostgreSQL hosted on Neon |
| ORM | Prisma |
| AI Agents | OpenAI Agents SDK (JS) |
| Auth | JWT (JSON Web Tokens) |

### Why Neon?
Neon is a free serverless PostgreSQL hosting service — similar to MongoDB Atlas but for PostgreSQL. Sign up at [neon.tech](https://neon.tech), create a project, copy the connection string, and paste it into your `.env` as `DATABASE_URL`. No credit card needed.

---

## What the App Does

You and your partner share one grocery list. Either of you can add, edit, check off, or delete items at any time. When one person makes a change, the other sees it instantly without refreshing the page.

Adding items is designed to be fast — you type a rough list like "milk bread chicken tomatoes" and the AI agent automatically organizes it into categories for you. No need to manually sort anything.

Each item can have additional details if needed — quantity, a note, and it shows who added it.

---

## Pages

### Login `/login`
- Email and password login
- Both you and your partner have separate accounts
- On success, redirects to the list page

### List `/list`
- The main page of the app
- Text input where you type one or multiple items at once
- The AI agent reads your input and organizes items by category (dairy, produce, meat, etc.)
- Items are displayed grouped by category
- Both users see the list update in real time as changes happen
- You can check off items as you shop
- You can delete items
- Click any item to see and edit its details

### Item `/list/:itemId`
- Dedicated page for a single item
- You can edit: name, category, quantity, note
- Shows who added the item
- Changes are saved and reflected on the list page instantly for both users

---

## AI Agent

The agent has one job: take raw text input and organize it into grocery categories.

**Example:**

Input from user:
```
milk bread chicken tomatoes eggs pasta
```

Agent output:
```
dairy:    milk, eggs
bakery:   bread, pasta
meat:     chicken
produce:  tomatoes
```

The agent runs every time a user submits the text input. It does not learn or remember — it just organizes whatever you give it each time.

---

## Real-time Behavior

Any change to the list is immediately visible to both users:
- Adding new items
- Checking off an item
- Editing an item's details
- Deleting an item

This is handled via WebSockets — both users are connected to the backend at all times, and the server pushes updates to everyone when something changes.

---

## Notes

- This is a tutorial/learning project — not production ready
- Only 2 users (you and your partner) — no multi-household support
- No email verification or password reset
- The AI agent organizes items on every submission — it does not remember past lists
