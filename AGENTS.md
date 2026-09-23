# Raghu Real Estate CRM: Project Guidelines & Rules

This project is a plotted real estate development CRM with role-based access control and Supabase integration.

## 🎯 Core Project Identity & Business Rules
1. **Plots Only**: This CRM is exclusively for selling plotted land layouts. No apartments or houses. Plot sizes are in Sq.Ft. or Cents.
2. **Phone & WhatsApp Mirroring**: Primary customer phone number automatically copies to WhatsApp field unless an alternate WhatsApp number is specified.
3. **Follow-up Driven Customer Profiling**: Detailed customer budget ranges and plot size requirements are captured during follow-up interactions rather than in initial lead forms.
4. **Strict Role-Based Access Control (RBAC)**:
   - **Admin Only**: Adding leads (`+ Add Lead`, bulk `Import Leads`), reassigning leads between Channel Partners, editing lead contact details, deleting leads, creating sites, and onboarding partners.
   - **Channel Partner / Sales User**: Managing assigned leads (pipeline drag-and-drop, calls, WhatsApp, scheduling follow-ups, notes). Add/assign/delete actions are locked.
5. **Mandatory Email Confirmation**:
   - Creating an account in Supabase requires email verification.
   - The CRM must never open directly on account creation; user must confirm via email link first.
   - Unconfirmed login attempts are blocked with clear messaging and an inline resend option.
   - Clicking the verification link automatically validates the token and logs the user in.
6. **Pure Purple SaaS Design System**:
   - Primary: `#6C3BFF`
   - Dark/Hover: `#5A2FE0`
   - Light Tint: `#F5F0FF`, `#E5DAFF`, `#FAF8FF`
   - Dark Theme Backgrounds: `#140226`, `#210647`
   - Integrated Web Audio sound effects (`src/lib/soundManager.ts`) for user interactions.

## 🛠️ Build and Deployment
- Always verify with `npm run build` (`tsc -b && vite build`) before finishing tasks.
- Keep `origin` pointed to `https://github.com/msragothaman/raghu-real-estate-crm.git` without storing credentials in the config.
