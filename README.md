# Raghu Real Estate CRM

> Modern, simple, intuitive SaaS CRM designed specifically for residential plotted development sales, channel partner tracking, lead management, and plot inventory visualization.

---

## 🎨 Design System & Theme

- **Primary Purple Theme**:
  - Primary Purple: `#6C3BFF`
  - Dark Purple: `#4B1FB8`
  - Light Purple Tint: `#F3EFFF`
  - Surface Background: `#F8F8FC`
  - Card White: `#FFFFFF`
- **Plot & Lead Status Badges**:
  - `AVAILABLE` (Emerald Green)
  - `HOLD` (Amber Orange)
  - `BOOKED` (Royal Blue)
  - `SOLD` (Brand Purple)
  - `REGISTRATION COMPLETED` (Deep Indigo)
  - `LOST` (Rose Red)

---

## 🚀 Key Features

1. **Executive Dashboard**:
   - 10 Summary Cards: Total Sites, Total Plots, Available, Booked, Sold, Registered, Total Leads, New Leads, Follow-ups Due, Active Partners.
   - Lead Pipeline Stage Breakdown.
   - Site Sales Velocity and plot inventory progress bars.
   - Channel Partner Performance Leaderboard.
   - Follow-up Action Center with quick Call and WhatsApp triggers.

2. **Sites & Plot Inventory Matrix**:
   - Gated layout cards and table view with land areas, RERA/DTCP approvals, and Google Maps links.
   - **Interactive Plot Matrix Visualization**: Color-coded plot grid (e.g. `[01 AVAILABLE] [02 SOLD] [03 BOOKED]`).
   - Click any plot to edit price, change buyer/customer name, link to CRM lead, or update status.
   - Single plot intake or bulk plot generator.

3. **Lead Management & Kanban Board**:
   - Drag-and-drop Kanban across 9 stages (`NEW` → `CONTACTED` → `FOLLOW UP` → `SITE VISIT` → `INTERESTED` → `NEGOTIATION` → `BOOKED` → `REGISTRATION COMPLETED` & `LOST`).
   - Automatic `lead_status_history` logging and toast notification.
   - Table view with multi-dimensional filtering (Source, Site, Channel Partner, Status, Date) and global search.
   - **Lead Detail Slide-over Drawer**: Customer contacts, Call (`tel:`), WhatsApp (`wa.me`), Requirement, Channel Partner assignment, Next scheduled follow-up, and chronological audit timeline.

4. **Channel Partner Management & Drag-and-Drop Reassignment**:
   - Partner directory with conversion rate, site visits, and booking tallies.
   - **Dedicated Drag-and-Drop Reassignment Board**: Drag leads directly from one Channel Partner column to another with instant audit logging into `partner_assignment_history` and confirmation alerts.

5. **Follow-up Calendar**:
   - Month View with event badges and quick scheduling.
   - Categorized Agenda Tabs: **Today's Follow-ups**, **Overdue Follow-ups**, **Upcoming Follow-ups**, **All**.
   - One-click Mark Completed, In-line Reschedule (date & time), and Call/WhatsApp shortcuts.

6. **Reports & Conversion Funnel**:
   - Full 5-step conversion funnel (`Total Leads` → `Contacted` → `Site Visits` → `Bookings` → `Registrations`).
   - Leads by Source (Google, Meta, WhatsApp, Website, Referral, Channel Partner).
   - Site-wise and Partner-wise sales breakdown.
   - **CSV Export** for offline reporting.

7. **Supabase PostgreSQL Database**:
   - Complete schema in `supabase/schema.sql` (9 tables, foreign keys, indexes, and RLS policies).
   - Connect via `.env` or the in-app Settings UI.
   - Built-in adaptive data layer with realistic Tamil Nadu plot layouts (Lakshmipuram, Green Valley, Sri Balaji Nagar, etc.) allowing immediate offline testing.

---

## 🛠️ Development & Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🗄️ Supabase Setup

1. Create a project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in Supabase.
3. Paste and run `supabase/schema.sql`.
4. Copy your **Project URL** and **Anon Key** into `.env` or paste them in the **Settings** tab inside the CRM.
