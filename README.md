# Eventlink — Blockchain Event Registration

## Stack
- **Frontend**: React + Vite + External CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas (users, events, bookings, KYC)
- **Blockchain**: Solidity + Hardhat + ethers.js
- **Payments**: Razorpay
- **Auth**: JWT + OTP via Nodemailer + bcrypt

## Project Structure
```
eventlink/
├── frontend/        React app
├── backend/         Express API
└── contracts/       Solidity smart contracts
```

## Quick Start
```bash
# 1. Backend
cd backend && npm install && cp .env.example .env  # fill in vars
npm run dev

# 2. Frontend
cd frontend && npm install && cp .env.example .env
npm run dev

# 3. Smart contracts (optional local dev)
cd contracts && npm install
npx hardhat compile
npx hardhat node          # local blockchain
npx hardhat run scripts/deploy.js --network localhost
```
