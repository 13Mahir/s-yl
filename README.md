# TrustID Platform - National Governance Simulation

## Project Overview
TrustID is a comprehensive identity verification and governance simulation platform designed to manage digital identities, consent-based data sharing, and cross-departmental governance workflows. It connects Citizens, Government Authorities, and Service Providers in a secure ecosystem.

### Key Features
- **Identity & Authentication**: 
  - Mobile OTP-based login for Citizens.
  - Unique ID + 2FA login for Entitites (Government & Organizations).
- **Consent Architecture**: 
  - Granular consent requests (Service Provider -> Citizen).
  - Citizen dashboard to Approve/Revoke consents.
  - "Purpose-bound" data access.
- **Governance Workflows**:
  - Integrated workflows for Healthcare (Emergency Verification), Transport (License Checks), and Urban services.
  - Regulatory Authority oversight (Approve/Reject cases).
- **AI Governance Assistant**:
  - Integrated Google Gemini AI to explain consent risks and summarize data usage to citizens in plain language.
- **Audit Trails**:
  - Immutable audit logs for every data access and status change.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (using `mysql2`)
- **AI Integration**: Google Generative AI (Gemini)
- **Security**: Helmet, CORS, Rate Limiting, Express Validator
- **Authentication**: Custom Session Management, OTP/2FA simulation

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix Primitives)
- **State Management**: React Query

---

## Setup & How to Run Locally

### Prerequisites
- Node.js (v18+)
- MySQL Database

### 1. Database Setup
Ensure you have a MySQL instance running. Create a database named `trustid_platform` (or matched to your `.env` config).

### 2. Backend Setup
1. Navigate to the Backend directory:
   ```sh
   cd Backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the `Backend` directory (see [Environment Variables](#environment-variables)).
4. Seed the database with initial data (Users, Roles, Test Cases):
   ```sh
   node seed_governance_complete.js
   ```
5. Start the server:
   ```sh
   npm run dev
   ```
   Server will run on `http://localhost:5001`.

### 3. Frontend Setup
1. Navigate to the Frontend directory:
   ```sh
   cd Frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
   Access the UI at `http://localhost:5173` (default Vite port).

---

## Environment Variables
Create a `.env` file in the `Backend` directory.

```ini
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trustid_platform

GEMINI_API_KEY=your_gemini_api_key

TWO_FACTOR_API_KEY=your_2factor_key
```

---

## Test Login Credentials (Demo Environment)

### 1. Citizen Login
- **Mobile**: `7383654894`
- **OTP**: `123456` (Mock OTP for verification)
- All other phone numbers will receive a call containing the OTP

### 2. Government & Organization Login
Use **Actor ID** and the **Mock 2FA Code**.

| Role | Login ID (Actor ID) | 2FA Code |
|------|---------------------|----------|
| **Regulatory Authority** | `gov-root-admin` | `root_paas_123` |
| **Hospital (Govt)** | `GOV-GJ-CIVIL-HOSPITAL` | `GJ-HOSPITAL@123` |
| **Transport Dept** | `GOV-RJ-TRANSPORT-DEPT` | `RJ-TRANSPORT@123` |
| **Apollo Hospital (Org)** | `ORG-APOLLO-AHM` | `APOLLO@123` |

---


## Security & Secrets
- **Secrets Management**: This repository enforces strict separation of secrets. `.env` files are ignored by git to prevent accidental leakage of API keys and database credentials.
- The credentials listed above are hardcoded **only** for local demonstration and testing purposes. In a production environment, strong password policies and real SMS/Email OTP providers are enforced.
