#  DEGENARCADE
> **"Bloomberg for Degens."** > The first hybrid on-chain betting ecosystem on Sui: Zero-Gravity UI meets High-Density Sportsbook.

![Banner Image Placeholder](https://placehold.co/1200x400/1e293b/white?text=DEGENARCADE+X+SPORTS)

[![Sui Network](https://img.shields.io/badge/Network-Sui_Mainnet-3b82f6?style=flat-square)](https://sui.io)
[![Status](https://img.shields.io/badge/Status-Alpha-orange?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)]()

---

## The Problem vs. The Solution

**The Problem:**
Web3 betting is currently boring. It’s either slow, looks like a generic token swap interface, or lacks the "rush" of a real casino. It fails to capture the high-density information flow of professional tools like Bet9ja or SportyBet.

**The Solution:**
**DegenArcade.** We are building the strongest consumer-facing gambling product on Sui. We combine the **physics-based chaos** of arcade gaming with the **analytical density** of a pro trading terminal.

---

## Key Features

### Zero-Gravity Interface
Forget static forms. We use **Matter.js** to make bet slips and game assets physical objects in the DOM.
* **Floating Bet Slips:** Drag, drop, and "throw" your bets onto the chain.
* **Physics-Driven UX:** Menus collide, bounce, and react to user gestures.

### Sportsbook Terminal (The "Bet9ja" Mode)
For the serious handicapper. A high-density, API-driven data grid.
* **Live Odds Feed:** Real-time integration via custom Oracle architecture.
* **Instant Updates:** WebSockets push odds changes instantly (sub-second latency).

### Instant SUI Settlement
Leveraging Sui's **parallel execution model**.
* **No Global State Locks:** Thousands of users can bet on the same match simultaneously without congestion.
* **Settlement:** Smart contract logic handles payouts immediately upon Oracle resolution.

### Pan-African Leaderboard
Built for the strongest crypto-adopting region.
* **SuiHub Nodes:** Optimized endpoints for low-latency access across Nigeria and Africa.
* **Localized Fiat On-Ramps:** (Coming Soon) Direct integration with local payment rails.

### Shared Identity & XP
* **The "DegenProfile":** An on-chain Object that travels with you.
* **Cross-Pollination:** Betting on football earns XP to upgrade your Arcade character. Winning arcade games unlocks better odds visuals (Cosmetics).

---

## Tech Stack

**Frontend (The Experience)**
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Physics Engine:** Matter.js (2D rigid body physics)
* **Animation:** Framer Motion
* **Blockchain Integration:** `@mysten/dapp-kit`, `@mysten/sui.js`

**Backend (The Oracle & Data)**
* **Runtime:** Node.js / Rust
* **Database:** PostgreSQL (User history, soft state)
* **Indexing:** Sui Indexer

**On-Chain (The Trust)**
* **Language:** Sui Move
* **Architecture:** Object-Centric (BetTicket Objects, Shared OracleCap)

---

##  Getting Started & Setup

Follow these steps to spin up the local development environment.

### 1. Prerequisites
* [Node.js 18+](https://nodejs.org/)
* [Rust & Cargo](https://rustup.rs/) (for Move development)
* [Sui Binaries](https://docs.sui.io/guides/developer/getting-started/sui-install)
* Docker (optional, for local DB)

### 2. Installation

```bash
# Clone the repository
git clone [https://github.com/your-org/DEGENARCADE.git]
cd degenarcade

# Install Frontend Dependencies
npm install

# Install Backend/Oracle Dependencies
cd backend
npm install
