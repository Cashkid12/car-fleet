# Fleet Manager

A premium mobile-first fleet management PWA built for car fleet owners in Kenya.

## Features

- 📊 **Dashboard** — Fleet summary, statistics, quick actions, recent activity
- 🚗 **Fleet Management** — Add, edit, delete vehicles with driver details
- 💰 **Income Tracking** — Record daily driver collections with reference numbers
- 🔧 **Damage & Repairs** — Report damages, track repair status
- 💸 **Expense Management** — Log fuel, maintenance, insurance, and other costs
- 📈 **Reports & Analytics** — Profit charts, expense breakdowns, vehicle rankings, business insights
- 🔔 **Smart Notifications** — Auto-generated notifications for every action
- ⚙️ **Account & Settings** — Theme, font size, layout, currency, notification preferences
- 📱 **PWA** — Installable on phone, works offline, auto-syncs when back online

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Tailwind CSS, React Router, Recharts, Dexie.js |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | Clerk |
| PWA | vite-plugin-pwa, Workbox |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Clerk account

### Installation

1. Clone the repository
```bash
git clone https://github.com/Cashkid12/car-fleet.git
cd car-fleet