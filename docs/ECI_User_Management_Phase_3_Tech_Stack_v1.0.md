# ECI User Management — Phase 3: Tech Stack
## Implementation-Ready Technical Architecture v1.0

> **Architecture decision:** Supabase-first, with React/Vite as the client application and Supabase Edge Functions for server-side business logic that should not run directly in the browser.
>
> The architecture intentionally avoids an unnecessary permanent Node.js/Express backend for the MVP.

---

# 1. Final Technology Stack

## Frontend

```text
React
Vite
TypeScript
Tailwind CSS
shadcn/ui
Lucide Icons
Motion for React
```

## Backend Platform

```text
Supabase
├── PostgreSQL
├── Supabase Auth
├── Row Level Security
├── Storage
├── Realtime
├── Edge Functions
└── Database Functions / RPC
```

## Deployment

```text
GitHub
   ↓
Vercel
   ↓
React + Vite PWA
```

```text
Supabase
   ├── PostgreSQL
   ├── Auth
   ├── Storage
   ├── Realtime
   └── Edge Functions
```

---

# 2. Important Architecture Decision — Node.js / Express

Vercel can host Node.js/Express applications, so technically a Node/Express backend could be deployed there.

However, **ECI User Management should NOT use a separate Node.js/Express backend for the MVP.**

Vercel officially supports Express deployments, but introducing a second backend layer would add another service, another deployment path, another authorization boundary and another place where failures can occur. citeturn0search12

For this application, Supabase already provides the required backend capabilities:

- PostgreSQL
- Authentication
- Storage
- Realtime
- Server-side Edge Functions
- Database functions / RPC
- Row Level Security

Supabase's architecture is explicitly built around these services working with a central Postgres database. citeturn0search2

Therefore the final decision is:

> **Do not add Node.js/Express unless a future requirement genuinely cannot be handled cleanly by Supabase.**

---

# 3. Recommended Data Flow

The primary data flow should be:

```text
User
 ↓
React / Vite PWA
 ↓
Supabase Client
 ↓
Supabase Auth
 ↓
PostgreSQL
 ↓
RLS
 ↓
Data
```

For sensitive or complex operations:

```text
React
 ↓
Supabase Edge Function
 ↓
Authorization / Validation
 ↓
Database Function / Supabase Client
 ↓
PostgreSQL
 ↓
Audit Log
 ↓
Response
 ↓
React
```

This gives the application a clear separation between:

- UI
- Authentication
- Authorization
- Data
- Business logic
- Audit

Supabase Edge Functions are server-side TypeScript functions and can be used for authenticated endpoints, webhooks and business logic. citeturn0search0turn0search1

---

# 4. Why Supabase-First

The user's requirement is:

> Data flow must be clear, smooth and reliable with minimal loading/failure problems.

Supabase-first reduces unnecessary moving parts.

Instead of:

```text
React
 ↓
Vercel
 ↓
Express
 ↓
Supabase API
 ↓
PostgreSQL
```

Use:

```text
React
 ↓
Supabase
 ↓
PostgreSQL
```

and only when required:

```text
React
 ↓
Supabase Edge Function
 ↓
PostgreSQL
```

This makes the architecture easier to:

- understand
- debug
- secure
- maintain
- deploy
- monitor

---

# 5. Frontend Architecture

## Core

```text
React + TypeScript + Vite
```

React is responsible for:

- UI
- routing
- state presentation
- forms
- user interactions
- optimistic UI where safe
- loading states
- error states
- responsive behavior
- PWA interface

Vite is responsible for:

- development server
- build system
- production bundling
- fast development workflow

---

# 6. UI System

## Tailwind CSS

Tailwind is used for:

- layout
- spacing
- responsive behavior
- typography
- colors
- states
- design tokens

## shadcn/ui

Use shadcn/ui as the base component system.

Use it for:

- Dialog
- Dropdown
- Select
- Tabs
- Sheet
- Tooltip
- Popover
- Command
- Form controls
- Toast
- Table primitives
- Alert
- Calendar
- Date picker

Components should be customized to match the ECI visual system.

Do not leave the application looking like default shadcn/ui.

---

# 7. Icon System

Use:

```text
Lucide Icons
```

Guidelines:

- Outline icons
- Usually 16–18px
- Consistent stroke weight
- Avoid mixing unrelated icon libraries
- Icons should communicate function, not decorate empty space

---

# 8. Animation System

The user explicitly requires animation.

Use:

```text
Motion for React
```

Animation should be:

> Subtle, purposeful and premium — never distracting.

## Appropriate animation

### Page transition

```text
opacity: 0 → 1
small translateY
```

### Modal

```text
opacity
scale
```

### Dropdown

```text
opacity
translateY
```

### User Details sections

```text
expand / collapse
```

### Table interactions

- row hover
- selection feedback
- action feedback

### Save operation

```text
Saving
 ↓
Success
 ↓
Content refresh
```

### Notification

Small entrance animation.

---

# 9. Animation Timing

Recommended:

```text
Micro interaction: 120–150ms
Normal transition: 150–180ms
Complex transition: 180–240ms
```

Use ease-out curves.

Avoid:

- bouncing UI
- large scaling
- excessive parallax
- continuous movement
- animation on every component
- slow page transitions

Animation must never interfere with productivity.

---

# 10. Routing

Use a React-compatible routing solution such as:

```text
React Router
```

Recommended route structure:

```text
/
├── /login
├── /dashboard
├── /users
├── /users/:userId
├── /bookings
│   ├── /meeting-rooms
│   └── /cars
├── /ip-phone-directory
├── /it-support
├── /it-support/:issueId
├── /renewals
├── /notifications
└── /settings
    ├── /profile
    ├── /password
    ├── /notifications
    └── /system
```

---

# 11. Authentication

Use:

```text
Supabase Auth
```

Authentication method:

```text
Email + Password
```

MVP does not require:

- Google Login
- Microsoft Login
- Social Login

---

# 12. Password Reset / IT Password Management

The organization has a specific operational requirement:

> If a user forgets their password, they contact IT.

Therefore User Details should include an IT-only action:

```text
User Details
 ↓
Account
 ↓
Password Action
```

Possible actions:

```text
Generate Temporary Password
Reset Password
```

Only authorized IT users can access this action.

## Important Security Rule

The frontend must never directly expose privileged service-role credentials.

The password reset/generation operation should be handled by a protected server-side Edge Function.

Conceptual flow:

```text
IT Admin
 ↓
User Details
 ↓
Reset / Generate Password
 ↓
Frontend calls Edge Function
 ↓
Verify IT authorization
 ↓
Perform Auth operation
 ↓
Audit event
 ↓
Return controlled result
```

The system should not store plaintext passwords in the database.

---

# 13. Authorization Architecture

There is intentionally NO user-facing Role & Permission management panel.

Roles are predefined by the application.

Roles:

```text
System / IT Administrator
General Manager
Admin
General User
```

Authorization exists at two levels:

```text
Frontend
+
Backend / Database
```

Frontend:

- hides unauthorized actions
- shows read-only states

Backend:

- actually enforces authorization

Never rely on frontend visibility as the security boundary.

---

# 14. Row Level Security

Supabase PostgreSQL Row Level Security is mandatory.

RLS should enforce rules such as:

### General User

Can read/update:

- own permitted profile data
- own issues
- own bookings
- allowed personal records

Can read:

- organization IP Phone directory

Cannot modify:

- User ID
- official email
- organization-controlled fields
- IT-managed assets

### IT Administrator

Can access operational IT data according to the approved IT scope.

### General Manager

Can read IT Support issues but cannot perform IT actions.

### Admin

Can access approved booking/admin capabilities.

---

# 15. Database

Primary database:

```text
PostgreSQL
```

Provided by Supabase.

PostgreSQL is the system of record.

No separate database should be introduced.

---

# 16. Data Access Strategy

Use:

```text
@supabase/supabase-js
```

for normal client operations.

Supabase's JavaScript client supports database access, Auth, Realtime, Storage and Edge Function invocation. citeturn0search5

## Normal read

```text
React
 ↓
supabase-js
 ↓
PostgREST / Supabase APIs
 ↓
RLS
 ↓
PostgreSQL
```

## Normal safe write

```text
React
 ↓
supabase-js
 ↓
RLS
 ↓
PostgreSQL
 ↓
Audit trigger / controlled audit
```

## Sensitive write

```text
React
 ↓
Edge Function
 ↓
Validate user + role
 ↓
Perform transaction
 ↓
Audit
 ↓
Response
```

---

# 17. When to Use Edge Functions

Do NOT route every database request through Edge Functions.

Use direct Supabase access for normal CRUD operations where RLS is sufficient.

Use Edge Functions for:

- Password reset / privileged Auth operations
- Complex multi-step business operations
- Operations requiring service-role privileges
- Secure server-side workflows
- Notification orchestration
- Scheduled/automated tasks
- Complex booking actions if required
- Sensitive administrative operations
- Future third-party integrations

Supabase Edge Functions support HTTP methods including GET, POST, PUT, PATCH and DELETE, so they can also provide structured server-side API endpoints when required. citeturn0search9

---

# 18. Database Transactions

Critical multi-step operations should be transactional.

Examples:

### Device Replacement

```text
Return old assignment
+
Create new assignment
+
Update current device
+
Create audit record
```

These should succeed together or fail together.

### IP Change

```text
Release old IP
+
Assign new IP
+
Update user
+
Audit
```

### Booking

```text
Check availability
+
Create booking
+
Prevent conflict
+
Create audit
```

### License Renewal

```text
Update license
+
Create renewal history
+
Create audit
```

For operations where multiple records must change together, use PostgreSQL transactions/functions or a protected Edge Function.

---

# 19. Realtime Architecture

Realtime is required, but should be used selectively.

Use Realtime for:

- New IT Support issues
- IT Support status changes
- Notifications
- Booking status changes where useful
- Important live operational updates

Do NOT subscribe every page to every database table.

This avoids unnecessary:

- network traffic
- client updates
- rendering
- complexity

---

# 20. Notification Architecture

MVP notification channels:

```text
In-App Notifications
+
Browser Push Notifications
```

Explicitly excluded:

```text
WhatsApp
Email
SMS
```

## In-App Flow

```text
Database Event
 ↓
Notification Record
 ↓
Realtime
 ↓
Client receives update
 ↓
Notification dropdown updates
```

## Browser Push Flow

```text
Important Event
 ↓
Notification Service
 ↓
Push Subscription
 ↓
Browser Push
 ↓
PWA / Browser
```

Browser push must require explicit user permission.

---

# 21. Notification Data

A dedicated notification table should store:

- notification ID
- recipient user ID
- type
- title
- message
- related entity
- related entity ID
- read status
- created timestamp
- read timestamp
- metadata

Notifications should remain auditable.

---

# 22. File Storage

Use:

```text
Supabase Storage
```

for IT Support attachments.

Storage bucket should be private.

Example:

```text
it-support-attachments
```

Access must be controlled through authenticated policies.

Do not expose permanent public file URLs for private IT issues.

---

# 23. IT Support Attachment Flow

```text
Create Issue
 ↓
Select Attachment
 ↓
Validate file type / size
 ↓
Upload to private Storage
 ↓
Create issue record
 ↓
Store file metadata/reference
 ↓
Submit issue
```

If upload fails:

```text
Upload failed
 ↓
Do not submit incomplete attachment state
 ↓
Allow retry
```

---

# 24. PWA Architecture

The application will be a Progressive Web App.

Required:

- Installable
- Responsive
- App shell
- Service worker
- Web manifest
- Browser push support
- Cached static assets

## Offline Strategy

The application should support limited offline behavior:

### Allowed offline

- Load previously cached app shell
- Display basic offline state
- Show previously cached non-sensitive UI where appropriate

### Not allowed

Do not allow critical database editing while offline.

Examples:

- Device assignment
- IP assignment
- License renewal
- Booking
- IT issue creation requiring server confirmation

These should require an active connection.

---

# 25. Network Failure Strategy

The application must clearly distinguish:

```text
Loading
Empty
Offline
Permission denied
Server error
Validation error
Success
```

Example:

```text
Connection lost

Your changes have not been submitted.
Please reconnect and try again.
```

Never silently lose user input.

For important forms, preserve unsent local form state during temporary network failure where practical.

---

# 26. Loading Strategy

Avoid global blocking loaders.

Prefer:

- Section-level loading
- Skeleton where useful
- Inline progress
- Button loading state
- Optimistic updates only where safe

Example:

```text
Save Device
 ↓
Saving...
 ↓
Success
```

For dangerous or transactional operations, wait for confirmed server success before updating the UI as final.

---

# 27. Error Handling

Errors should have three levels:

## 1. User-facing message

Simple explanation.

## 2. Recovery action

Example:

```text
Try Again
```

## 3. Technical logging

Store technical information in monitoring/logging without exposing sensitive implementation details to users.

---

# 28. Form Validation

Use a schema-based validation library such as:

```text
Zod
```

Use validation consistently for:

- User forms
- Device forms
- Printer forms
- IP forms
- License forms
- IT Support forms
- Booking forms
- Service history

Validate:

```text
Frontend
+
Server / database
```

---

# 29. Form Architecture

Use:

```text
React Hook Form
+
Zod
```

Benefits:

- consistent validation
- lower unnecessary re-renders
- reusable form schemas
- clear error states

---

# 30. State Management

Do not introduce a large global state library unless required.

Recommended separation:

### Server state

Use:

```text
TanStack Query
```

for:

- fetching
- caching
- refetching
- mutations
- stale state
- retry behavior

### UI state

Use:

```text
React state
```

for:

- dialogs
- dropdowns
- temporary filters
- local UI state

This avoids turning Supabase data into unnecessary global state.

---

# 31. Data Fetching Strategy

Recommended:

```text
Page
 ↓
Query Hook
 ↓
Supabase
 ↓
Cache
 ↓
UI
```

Example:

```text
useUser(userId)
useUsers(filters)
useSupportIssues(filters)
useRenewals(filters)
useNotifications()
```

Keep data fetching logic outside large UI components.

---

# 32. Cache Strategy

Use intelligent caching.

### User Details

Cache briefly and invalidate after updates.

### User List

Cache with filters.

### Dashboard

Fetch operational summary and refresh after relevant mutations.

### Notifications

Realtime update + lightweight query synchronization.

Do not aggressively cache sensitive data for long periods.

---

# 33. Database Change Synchronization

After a successful mutation:

```text
Mutation
 ↓
Database
 ↓
Audit
 ↓
Invalidate affected query
 ↓
Refresh dependent UI
```

Realtime can supplement this for other active users.

Do not rely on browser state alone as the source of truth.

---

# 34. Audit Architecture

Dedicated table:

```text
audit_logs
```

Recommended fields:

```text
id
actor_user_id
action
entity_type
entity_id
old_values
new_values
metadata
created_at
```

Track:

- who
- what
- which record
- before
- after
- when

Audit records should be protected from normal user modification/deletion.

---

# 35. Audit Examples

```text
DEVICE_ASSIGNED
DEVICE_REPLACED
DEVICE_RETURNED
DEVICE_SERVICE_ADDED
IP_ASSIGNED
IP_CHANGED
IP_RELEASED
IP_PHONE_CHANGED
LICENSE_RENEWED
USER_UPDATED
SUPPORT_CREATED
SUPPORT_STATUS_CHANGED
BOOKING_CREATED
BOOKING_CANCELLED
BOOKING_PAUSED
BOOKING_DENIED
PASSWORD_RESET
```

---

# 36. Search Architecture

For user search:

Use PostgreSQL indexes and appropriately designed search queries.

Search should support:

```text
Name
Employee ID
User ID
Email
Phone
IP
Extension
Machine Name
Asset ID
```

Avoid loading all users into the browser just to perform search.

Search should execute server-side.

---

# 37. Database Indexing

Indexes should be created for frequently queried fields.

Likely candidates:

- employee_id
- user_id
- email
- phone
- department_id
- manager_id
- machine_name
- ip_address
- extension
- asset_id
- support status
- support priority
- license renewal date
- device assignment status

Indexes should be reviewed against actual query patterns.

Do not create unnecessary indexes everywhere.

---

# 38. Booking Concurrency

Booking availability must be enforced server-side.

Frontend availability is only a convenience view.

The final booking operation must protect against two users attempting to reserve the same resource simultaneously.

The database/business layer must be the final authority.

---

# 39. IP Assignment Concurrency

The same principle applies to IP addresses.

Frontend may show:

```text
10.200.198.45 — Available
```

But another user could claim it before submission.

Therefore the database transaction must verify availability again.

If unavailable:

```text
IP address is no longer available.
Please choose another IP.
```

---

# 40. Security Rules

Mandatory:

- Supabase RLS
- Server-side authorization
- Least privilege
- Private Storage
- Input validation
- Secure database functions
- Audit logging
- No service-role key in frontend
- Environment secrets
- Secure Auth session handling
- Protected Edge Functions
- Appropriate rate limiting

---

# 41. Secrets

Never place:

```text
SUPABASE_SERVICE_ROLE_KEY
```

in frontend code.

Frontend may use the public/publishable key intended for browser use.

Privileged secrets belong in:

```text
Supabase Edge Function Secrets
```

or the appropriate secure deployment environment.

---

# 42. Environment Variables

Frontend:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Never expose server-only secrets through `VITE_*`.

Server-side functions:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OTHER_PRIVATE_SECRETS
```

Use Supabase secret management for Edge Functions.

---

# 43. Development / Production Strategy

The user selected Supabase as the backend platform.

Recommended environment strategy:

```text
Development
 ├── Local React/Vite
 └── Supabase local / development project

Preview
 └── Vercel Preview

Production
 ├── Vercel Production
 └── Supabase Production
```

Do not use production data for development/testing.

---

# 44. Version Control

Use:

```text
Git
+
GitHub
```

Repository should contain:

```text
src/
supabase/
public/
docs/
```

Database migrations should be version-controlled.

Edge Functions should be version-controlled.

Do not rely on manually edited production dashboards as the primary development workflow.

---

# 45. Supabase Project Structure

Recommended:

```text
supabase/
├── migrations/
├── functions/
│   ├── reset-user-password/
│   ├── create-booking/
│   ├── manage-device/
│   ├── assign-ip/
│   ├── renew-license/
│   └── ...
├── seed/
└── config.toml
```

Function names should reflect business operations.

Do not create dozens of unnecessary functions.

---

# 46. Frontend Project Structure

Recommended:

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── layouts/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── tables/
│   ├── forms/
│   └── feedback/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── users/
│   ├── bookings/
│   ├── ip-phone/
│   ├── support/
│   ├── renewals/
│   ├── notifications/
│   └── settings/
│
├── hooks/
├── lib/
│   ├── supabase/
│   ├── validation/
│   └── utils/
│
├── types/
└── styles/
```

Use feature-based organization rather than one huge components folder.

---

# 47. Type Safety

Use TypeScript throughout.

Database types should be generated from Supabase schema where practical.

Recommended flow:

```text
PostgreSQL Schema
 ↓
Generated TypeScript Types
 ↓
Supabase Client
 ↓
Application
```

Avoid manually duplicating database types wherever possible.

---

# 48. API / Business Layer

The application does not need a traditional REST API server for every operation.

Use three levels:

### Level 1 — Direct Supabase Client

For normal RLS-protected reads/writes.

### Level 2 — PostgreSQL Functions / RPC

For atomic database operations.

### Level 3 — Edge Functions

For privileged or server-side business workflows.

This provides a clean architecture without unnecessary backend complexity.

---

# 49. Example — Device Replacement

```text
React
 ↓
Replace Device form
 ↓
Validation
 ↓
Edge Function / RPC
 ↓
Authorization
 ↓
Database Transaction
 ├── Close old assignment
 ├── Create new assignment
 ├── Update current device
 └── Create audit
 ↓
Response
 ↓
Invalidate User Details query
 ↓
UI refresh
```

---

# 50. Example — Password Reset

```text
IT Admin
 ↓
User Details
 ↓
Reset Password
 ↓
Edge Function
 ↓
Verify IT role
 ↓
Supabase Auth Admin operation
 ↓
Audit log
 ↓
Return success
```

The password itself is never stored in the application's business tables.

---

# 51. Example — IT Issue

```text
Employee
 ↓
React form
 ↓
Zod validation
 ↓
Supabase
 ↓
Create issue
 ↓
Database
 ↓
Notification record
 ↓
Realtime
 ↓
IT Dashboard updates
```

---

# 52. Example — Booking

```text
User
 ↓
Booking form
 ↓
Check availability
 ↓
Submit
 ↓
Server-side availability validation
 ↓
Transactional booking
 ↓
Audit
 ↓
Notification
 ↓
Confirmed
```

---

# 53. Example — License Renewal

```text
IT Admin
 ↓
Renewal list
 ↓
User Details
 ↓
Renew License
 ↓
Validate authorization
 ↓
Update license
 ↓
Create renewal history
 ↓
Audit
 ↓
Notification / activity
 ↓
Dashboard refresh
```

---

# 54. Reliability Principles

The system should be designed around these rules:

### Rule 1
The database is the source of truth.

### Rule 2
The frontend never assumes a write succeeded until the server confirms it.

### Rule 3
Critical multi-record operations are transactional.

### Rule 4
RLS protects data access.

### Rule 5
Frontend permissions are UX protection; backend permissions are security protection.

### Rule 6
Realtime improves responsiveness but is not the source of truth.

### Rule 7
Cached data must be treated as potentially stale.

### Rule 8
Failed writes must not silently disappear.

### Rule 9
Critical actions must be auditable.

### Rule 10
Sensitive credentials never enter browser code.

---

# 55. Performance Principles

The application should prioritize:

- Fast first render
- Small initial JavaScript bundle
- Lazy loading for major modules
- Pagination for large datasets
- Server-side filtering/search
- Efficient database queries
- Proper indexes
- Query caching
- Realtime only where useful
- Optimized images
- Lazy-loaded attachments
- Avoid unnecessary rerenders

---

# 56. Large User List Strategy

Do not load all users into memory.

Use:

```text
Server-side pagination
+
Server-side search
+
Server-side filters
```

Example:

```text
Users 1–25
Next → 26–50
```

For very large datasets, cursor/keyset pagination may be preferred.

---

# 57. User Details Loading Strategy

User Details should not wait for every historical dataset before showing the identity.

Recommended:

```text
Initial load
 ├── Identity
 ├── Employment
 ├── Current Device
 ├── IP
 └── License

Secondary load
 ├── Device History
 ├── Service History
 ├── Support History
 ├── Applications
 └── Printer details
```

This creates a faster perceived experience.

---

# 58. Progressive User Details Loading

The User Details page should be usable as soon as the primary information arrives.

Example:

```text
User Identity        ✓
Current Device       ✓
IP                   ✓
License              ✓

Device History       Loading...
Service History      Loading...
Support History      Loading...
```

A failure in one secondary section should NOT break the entire page.

---

# 59. Error Isolation

If one module fails:

```text
User Details
├── Identity ✓
├── Device ✓
├── IP ✓
├── License ✓
├── Support ✕
└── History ✓
```

The user should still be able to use the other sections.

The Support section should show:

> Unable to load support history. Try again.

Do not show a full-page error for a single failed section.

---

# 60. Monitoring & Observability

Production should have:

- Vercel deployment logs
- Supabase logs
- Edge Function logs
- Database monitoring
- Error monitoring

A dedicated error monitoring platform such as Sentry may be added if required.

The system should capture:

- frontend errors
- API/function failures
- unexpected database failures
- important performance issues

Never log passwords or sensitive credentials.

---

# 61. Backup & Recovery

The database must use Supabase's supported backup/recovery capabilities appropriate to the selected plan.

Operationally important records must be retained:

- Users
- Devices
- Device assignments
- Service history
- IP history
- License history
- IT support issues
- Audit logs
- Bookings

Normal user actions should never permanently erase historical records unless an explicit administrative data-retention policy permits it.

---

# 62. Browser Support

Primary support:

- Google Chrome
- Microsoft Edge
- Modern Firefox
- Modern Safari

The application should prioritize Chromium-based enterprise desktop environments while maintaining responsive mobile browser support.

---

# 63. PWA Push Notification Requirements

Browser push should support:

- New IT issue
- Issue status update
- Issue resolved
- Renewal attention
- License expiration
- Booking confirmation
- Admin booking action

Users must explicitly grant browser notification permission.

If permission is denied, in-app notifications remain available.

---

# 64. Accessibility

Technology implementation must preserve:

- Keyboard navigation
- Focus states
- Semantic HTML
- Accessible labels
- Screen-reader friendly controls
- Sufficient contrast
- Touch-friendly controls
- Reduced-motion support

If a user enables reduced motion, non-essential animations should be minimized.

---

# 65. Animation Accessibility

Motion should respect:

```text
prefers-reduced-motion
```

When enabled:

- remove decorative transitions
- reduce movement
- keep functional feedback
- avoid disorienting transforms

---

# 66. Technology Decision Summary

| Area | Decision |
|---|---|
| Frontend | React |
| Build | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Icons | Lucide |
| Animation | Motion for React |
| Routing | React Router |
| Server State | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| Backend | Supabase |
| Database | PostgreSQL |
| Auth | Supabase Auth |
| Authorization | RLS + predefined roles |
| Server Logic | Supabase Edge Functions |
| Database Logic | PostgreSQL Functions / RPC |
| File Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Notifications | In-app + Browser Push |
| PWA | Yes |
| Hosting | Vercel |
| Code Repository | GitHub |
| API Server | No separate Express server for MVP |
| Audit | PostgreSQL audit_logs |
| Attendance | Excluded |

---

# 67. Final Architecture

The final architecture is:

```text
                         ┌─────────────────────┐
                         │       User          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ React + Vite + PWA  │
                         │ TypeScript           │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
            ┌─────────────────┐          ┌──────────────────┐
            │ Supabase Client │          │ Edge Functions   │
            └────────┬────────┘          └────────┬─────────┘
                     │                            │
                     └──────────────┬─────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │     Supabase        │
                         │                     │
                         │ Auth                │
                         │ RLS                 │
                         │ PostgreSQL          │
                         │ Storage             │
                         │ Realtime            │
                         │ Edge Functions      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ System of Record    │
                         │ PostgreSQL          │
                         └─────────────────────┘
```

Deployment:

```text
GitHub
   │
   ├──────────────→ Vercel
   │                 │
   │                 └── React/Vite/PWA
   │
   └──────────────→ Supabase
                     ├── PostgreSQL
                     ├── Auth
                     ├── Storage
                     ├── Realtime
                     └── Edge Functions
```

---

# 68. Final Technical Decision

For ECI User Management:

> **Use React + Vite + TypeScript + Tailwind + shadcn/ui + Motion for React on the frontend, Supabase as the complete backend platform, Vercel for frontend/PWA deployment, and Supabase Edge Functions for privileged/server-side business operations.**

Do **not** add Node.js/Express to the MVP.

This keeps the architecture:

- Clear
- Fast
- Secure
- Maintainable
- Easier to debug
- Easier to deploy
- Less operationally complex
- Ready to scale

Supabase Edge Functions are designed for server-side TypeScript workloads and can be deployed globally, while Vercel can independently host the React/Vite application. citeturn0search1turn0search8

---

# 69. Next Phase

**PHASE 3 — TECH STACK is complete.**

The next phase is:

> **PHASE 4 — CONTENT GUIDELINES**

Phase 4 will define:

- UI language
- Field labels
- Button naming
- Empty-state copy
- Error messages
- Success messages
- Notification wording
- Status names
- IT Support terminology
- Booking terminology
- License/renewal terminology
- User Details section naming
- Confirmation messages
- Destructive-action wording
- Tone of voice
- Microcopy rules
- Date/time/number formatting
- Mobile content behavior

No database schema will be created until the appropriate later phase.
