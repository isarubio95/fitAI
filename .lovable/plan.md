

# TrackGym - Strength Training Tracker

## Overview
A mobile-first, dark-themed strength training tracker PWA built with React, Supabase, and Shadcn UI. Users log workouts with exercises and sets, browse an exercise library, and view history with analytics.

---

## Phase 1: Foundation & Auth

### Database Setup (Supabase Migrations)
- Create tables: `tipo_ejercicio`, `actividad`, `ejercicio`, `serie` with proper foreign keys
- Enable RLS on all tables with policies scoped to `auth.uid()`
- Seed exercise catalog: Press de Banca, Sentadilla, Peso Muerto, Dominadas, Press Militar

### Dark Theme & Design System
- Dark mode by default (slate/zinc palette, high contrast)
- Large touch targets (44px+), Inter/system fonts
- Mobile-first responsive layout

### Authentication
- Email/password login & signup using Supabase Auth
- Protected routes — redirect unauthenticated users to login
- User profile creation on signup

### Navigation
- **Mobile:** Sticky bottom nav bar (Home, Log, History, Profile)
- **Desktop:** Sidebar navigation

---

## Phase 2: Dashboard (Home)

- Weekly consistency visualization (bar chart using Recharts showing workouts per day)
- "Last Workout" summary card showing title, date, exercise count, total sets
- Floating Action Button (FAB) → "Start Workout"

---

## Phase 3: Workout Logger (Core Feature)

- Full-screen Sheet/Drawer experience
- **Workflow:**
  1. Enter workout title & date
  2. "Add Exercise" → opens Command Palette (Combobox) searching `tipo_ejercicio`
  3. Each exercise shows its sets in a list
  4. "Add Set" row with Reps & Weight (kg) inputs
  5. Delete sets/exercises via trash icon
- Local state management with React Hook Form + `useFieldArray`
- "Finish Workout" button saves everything (activity → exercises → sets) in a single transaction
- Validation with Zod

---

## Phase 4: Exercise Library

- Grid view of all exercises from `tipo_ejercicio`
- Search/filter bar by name
- Exercise detail cards with description and image

---

## Phase 5: History & Analytics

- Chronological list of past workouts (`actividad`)
- Accordion-style expansion showing exercises and sets for each workout
- Semantic HTML (`article`, `section`, `time`)

---

## Technical Approach
- **Data fetching:** TanStack Query for all Supabase reads with proper caching and invalidation
- **Supabase client:** Initialized via Lovable Cloud integration
- **Responsive:** iPhone SE through 4K desktop
- **Icons:** Lucide React throughout

