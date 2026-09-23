---
name: raghu-real-estate-crm
description: >-
  Comprehensive guide, business logic, architecture rules, and operational runbooks for
  Raghu Real Estate CRM. Use whenever developing, modifying, refactoring, or deploying
  features for this plotted land real estate CRM codebase.
---

# Raghu Real Estate CRM: Project Specification & Procedures

Raghu Real Estate CRM is a high-performance, Pure Purple-themed SaaS platform designed specifically for plotted land developments, layout sales, channel partner networks, and customer lifecycle management.

---

## 🏛️ Project Architecture & Tech Stack

- **Framework**: React 18 with TypeScript and Vite
- **Styling**: Tailwind CSS with custom Pure Purple palette (`#6C3BFF`, `#5A2FE0`, `#F5F0FF`, `#E5DAFF`, `#140226`)
- **Backend & Database**: Supabase (PostgreSQL with Realtime and Auth)
- **Local Fallback / Reactive Store**: `src/lib/dataStore.ts` (Reactive observer pattern with localStorage caching)
- **Icons**: Lucide React (`lucide-react`)
- **Drag-and-Drop**: `@hello-pangea/dnd`
- **Audio & Haptics**: Native Web Audio API sound synthesizer (`src/lib/soundManager.ts`)
- **Spreadsheets**: SheetJS (`xlsx`) for CSV, XLS, and XLSX bulk import & export
- **Repository**: [msragothaman/raghu-real-estate-crm](https://github.com/msragothaman/raghu-real-estate-crm) on branch `main`
- **Hosting**: Vercel automated CI/CD deployment

---

## 🔒 Mandatory Business & Security Rules

### 1. Plots Only Policy
- The CRM specializes strictly in **plotted land layouts** (residential, commercial, villa plots, farm plots).
- Never add options for standalone houses, apartments, or villas in core forms; only land plots measured in Sq.Ft. or Cents.

### 2. Contact Phone & WhatsApp Synchronization
- When entering a customer's primary phone number in lead creation or follow-ups, the WhatsApp number automatically mirrors it unless the customer explicitly uses a different WhatsApp number.

### 3. Budget & Requirement Capture During Follow-ups
- Budget ranges, plot size requirements, and purchase timelines are collected during follow-up conversations and recorded in the Follow-up drawer rather than cluttering initial cold lead creation.

### 4. Role-Based Access Control (RBAC)
- **ADMIN**:
  - Exclusively authorized to add new leads (`+ Add Lead` and `Import Leads`).
  - Exclusively authorized to allocate or re-distribute leads to Channel Partners.
  - Exclusively authorized to edit core lead identity (Name, Phone) and delete leads.
  - Exclusively authorized to create new project sites and onboard/edit Channel Partners.
- **CHANNEL PARTNER / SALES USER**:
  - Full access to manage assigned leads: advance statuses across the pipeline (`NEW` → `CONTACTED` → `FOLLOW UP` → `SITE VISIT` → `INTERESTED` → `NEGOTIATION` → `BOOKED` → `REGISTRATION COMPLETED`).
  - Full access to trigger 1-click calls, WhatsApp messages, schedule follow-ups, and log customer notes.
  - Adding leads, deleting leads, and re-assigning partners are locked and hidden.

### 5. Email Verification & Authentication Flow
- New user account creation in Supabase requires **mandatory email confirmation**.
- Registering an account **must not open the CRM directly**. The user is shown the "Check Your Inbox" verification screen.
- Unconfirmed accounts attempting to log in are blocked by Supabase Auth with `"Email not confirmed"`, accompanied by an inline resend option.
- When the user opens the verification link from their email, the app detects `#access_token` or `?code`, confirms the account, and automatically opens the CRM.

---

## 📁 Key File Map

| Path | Purpose |
| :--- | :--- |
| `src/lib/supabase.ts` | Supabase client singleton with auth auto-refresh, session detection, and credential normalization |
| `src/lib/dataStore.ts` | Central reactive store managing users, sites, plots, leads, partners, and follow-ups |
| `src/lib/soundManager.ts` | Web Audio synthesizer producing subtle click, drop, success, error, and popup sounds |
| `src/components/auth/SignInPage.tsx` | Login, account registration, email verification screen, and 1-click quick demo roles |
| `src/components/leads/LeadManagementView.tsx` | Pipeline Kanban board, Table view, CSV/XLS export & import triggers, partner workspace view |
| `src/components/leads/ImportLeadsModal.tsx` | Drag-and-drop CSV/XLSX/XLS bulk importer with sample templates and column mapping |
| `src/components/leads/LeadDetailDrawer.tsx` | Slide-over lead profile with call/WhatsApp buttons, status progression, notes, and follow-ups |
| `src/components/partners/PartnerManagementView.tsx` | Channel partner performance directory and partner reassignment board |
| `src/components/partners/PartnerReassignBoard.tsx` | 3D drag-and-drop partner lead distribution board (Admin only) |
| `src/components/reports/ReportsView.tsx` | Site-wise, Channel Partner-wise, Lead Source attribution, and Sales Revenue analytics |
| `src/components/calendar/DailyFollowupModal.tsx` | Automated daily pop-up briefing for follow-ups due today |

---

## 🛠️ Verification & Build Commands

Always run production builds before committing changes:
```bash
npm run build
```
Verify that `tsc -b && vite build` completes with 0 errors.

Git workflow:
```bash
git add src/ && git add -f dist/index.html
git commit -m "Description of change"
git remote set-url origin https://msragothaman:<PAT>@github.com/msragothaman/raghu-real-estate-crm.git
git push origin main
git remote set-url origin https://github.com/msragothaman/raghu-real-estate-crm.git
```
