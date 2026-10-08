# ECI User Management
## PHASE 6 — IMPLEMENTATION PLAN
### Version 1.0

---

## 1. Purpose

This document converts the approved PRD, App Flow, Tech Stack, Content Guidelines, and Backend Schema into an implementation-ready development sequence.

This phase defines **how the product should be built**, in what order, what depends on what, how each feature is verified, and what must be true before production release.

This is an implementation plan, not a new product-definition document.

---

# 2. Approved Product Principles

The implementation must preserve these principles throughout development:

1. **One User → One Complete IT Record**
2. **User Details is the primary management hub**
3. Device, machine identity, network identity, and user identity remain separate concepts.
4. Device history must never disappear when a device changes users.
5. Physical asset history must remain traceable.
6. User account license renewal is separate from physical-device warranty.
7. General users must only access data and actions appropriate to them.
8. IT-controlled information must not be editable by ordinary users.
9. Historical records should normally be preserved rather than deleted.
10. Supabase is the source of truth.
11. No permanent Node.js/Express backend is required for MVP.
12. Privileged operations must be handled server-side through Supabase Edge Functions where required.
13. RLS is mandatory.
14. Notifications use in-app and Browser/PWA Push only.
15. No Attendance module is included.
16. No Roles & Permissions management UI is included.
17. The UI must remain quiet, precise, responsive, and enterprise-oriented.

---

# 3. Final Technology Baseline

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Motion for React
- React Router
- TanStack Query
- React Hook Form
- Zod

## Backend

- Supabase PostgreSQL
- Supabase Auth
- Supabase Row Level Security
- Supabase Realtime
- Supabase Storage
- Supabase Edge Functions

## Deployment

- GitHub
- Vercel
- Supabase Production

## PWA

- Installable web application
- Browser/PWA Push
- App shell caching
- No critical offline editing

---

# 4. Implementation Strategy

Build the application in dependency order rather than screen order.

Recommended sequence:

1. Repository and development environment
2. Supabase project and environment configuration
3. Database foundation
4. Authentication
5. Authorization and RLS
6. Application shell and design system
7. User Management
8. Employee 360 / User Details
9. Physical assets and network identity
10. Applications and license renewal
11. IT Support
12. Bookings
13. Notifications and Browser Push
14. Dashboards
15. PWA and responsive refinement
16. Real-data migration
17. Full QA and security testing
18. Production deployment
19. Stabilization and monitoring

Do not start by building every page visually and connect the backend later.

The preferred approach is:

**Database → Security → Data access → Feature logic → UI → Testing**

---

# 5. Stage 0 — Repository and Project Foundation

## Objective

Create a clean, maintainable frontend project before feature development begins.

## Tasks

- Initialize React + Vite + TypeScript project.
- Configure Tailwind CSS.
- Configure shadcn/ui.
- Configure Lucide Icons.
- Configure Motion for React.
- Configure React Router.
- Configure TanStack Query.
- Configure React Hook Form.
- Configure Zod.
- Configure ESLint.
- Configure Prettier.
- Configure TypeScript strict mode.
- Establish environment variable strategy.
- Establish Git branching strategy.
- Establish `.env.example`.
- Configure Vercel preview deployment.

## Suggested structure

```text
src/
  app/
    router/
    providers/
    layouts/

  components/
    ui/
    shared/

  features/
    auth/
    dashboard/
    users/
    devices/
    printers/
    network/
    ip-phone/
    applications/
    renewals/
    support/
    bookings/
    notifications/
    settings/

  hooks/
  lib/
    supabase/
    validation/
    permissions/
    formatting/

  types/
  constants/
  styles/
```

Feature-specific logic should stay close to the feature.

Avoid one giant `components/` folder containing the entire application.

## Definition of Done

- Application runs locally.
- TypeScript compiles without errors.
- Linting passes.
- Formatting passes.
- Vercel preview deploy works.
- Supabase environment variables are loaded correctly.
- No secret keys are committed to Git.

---

# 6. Stage 1 — Supabase Environment Foundation

## Objective

Create the backend foundation before implementing business features.

## Environments

Maintain:

```text
Local Development
      ↓
Vercel Preview + Supabase Development
      ↓
Production
```

Do not use production data during early feature development.

## Tasks

- Create/configure Supabase development project.
- Configure production project separately.
- Enable Email + Password authentication.
- Configure redirect URLs.
- Configure Storage.
- Configure Realtime only for required tables.
- Configure Edge Functions.
- Generate TypeScript database types.
- Establish migration workflow.
- Establish database seed strategy.

## Security

Never expose:

- Supabase service-role key
- Admin API credentials
- Push private credentials
- Other server-side secrets

The browser may use the public Supabase URL and public anonymous/publishable key as appropriate.

---

# 7. Stage 2 — Database Migration

Implement database migrations in dependency order.

## Migration Order

### Migration 001 — Reference Data

- departments
- designations
- system configuration/reference values where required

### Migration 002 — Users

- users
- manager relationship
- auth_user_id
- profile fields
- employment status

### Migration 003 — Machine Identity

- machine_profiles

### Migration 004 — Physical Assets

- devices
- device_assignments
- device/service history structures

### Migration 005 — Printers

- printers
- printer_assignments
- printer history/service structures where applicable

### Migration 006 — Network

- ip_addresses
- ip_assignments

### Migration 007 — IP Phone

- ip_phones
- ip_phone_assignments

### Migration 008 — Applications

- applications
- user_applications

### Migration 009 — License

- user_licenses
- license_renewals

### Migration 010 — IT Support

- support_issues
- support_issue_updates
- support_issue_attachments

### Migration 011 — Bookings

- meeting_rooms
- meeting_room_bookings
- cars
- car_bookings

### Migration 012 — Notifications

- notifications
- push_subscriptions

### Migration 013 — Audit

- audit_logs

## Database rules

Enforce critical integrity at the database level wherever practical.

Examples:

- One active IP cannot be assigned to multiple users simultaneously.
- One physical device cannot have multiple active assignments.
- Booking time ranges cannot overlap for the same resource.
- Foreign-key relationships must remain valid.
- Historical assignments cannot be silently overwritten.
- Important status transitions should be auditable.

---

# 8. Stage 3 — Authentication

## Login

Implement:

- Email
- Password
- Session persistence
- Logout
- Forgot-password request flow where applicable
- Protected routes

## Password Reset

The normal user password-reset process should use Supabase Auth.

For the IT Administrator's operational reset/generate-password capability:

- Trigger a protected Edge Function.
- Verify caller authorization server-side.
- Perform the privileged Auth operation server-side.
- Never store plaintext passwords in `users`.
- Never display passwords in audit logs.
- Never send passwords through notification records.

## Definition of Done

- Unauthenticated users cannot access protected application routes.
- Authenticated users can reach only permitted areas.
- Logout invalidates the active application session.
- Password operations do not expose secrets.

---

# 9. Stage 4 — Authorization and RLS

This stage must be completed before sensitive application data is exposed.

## Access Model

There is intentionally no Roles & Permissions administration UI.

Access is determined by the approved designation/access classification and the designated main IT Administrator configuration.

## Required Access Categories

### IT Administrator

- Full IT operational access.
- User management.
- User Details management.
- Device assignment/history.
- Printer management.
- IP assignment.
- IP Phone assignment.
- Application assignment.
- License management.
- Support management.
- Booking administration where authorized.
- System configuration.
- Password reset operation.
- Audit visibility as defined.

### General Manager

- View IT support information across users.
- No operational IT modification authority unless explicitly approved elsewhere.

### Admin

- Authorized booking actions.
- Approved administrative scope.
- No role-management UI.

### General User

- Own profile.
- Approved editable profile fields.
- Own IT support requests.
- Own booking actions.
- Organization IP Phone Directory view.
- Own notifications.
- No IT-controlled asset editing.

## RLS Requirements

Every protected table must have explicit RLS policies.

Test:

- Own-record access.
- Other-user denial.
- IT administrator access.
- General Manager read-only support access.
- Admin booking access.
- Unauthorized update denial.
- Unauthorized delete denial.

Never rely only on frontend route hiding for security.

---

# 10. Stage 5 — Application Shell and Design System

Build the shell after authentication/security foundations exist.

## Shell

Desktop:

- Left navigation
- Top utility area
- Page title/context
- Content workspace
- Profile/notification controls

Mobile:

- Compact top bar
- Responsive navigation
- Touch-friendly actions
- No desktop table overflow where avoidable

## Design Tokens

Use the approved baseline:

```text
Canvas:        #F7F7F5
Surface:       #FFFFFF
Text:          #20242B
Secondary:     #697386
Muted:         #98A1AE
Primary:       #315EFB
Soft Primary:  #EEF2FF
Success:       #27835A
Warning:       #B7791F
Error:         #C2413B
Border:        #E8E9E7
```

Typography:

```text
Plus Jakarta Sans
```

Spacing:

```text
8px base system
```

## Motion

Use Motion for React.

Recommended:

- Micro interaction: 120–150ms
- Standard transition: 150–180ms
- Complex transition: 180–240ms
- Ease-out
- No decorative motion
- Respect `prefers-reduced-motion`

---

# 11. Stage 6 — User Management

## Objective

Build the central user directory.

## User List

Implement:

- Search
- Filters
- Sorting
- Status
- Department
- Designation
- Manager
- Device status
- IP status
- License renewal status
- Pagination/efficient loading
- Whole-row navigation to User Details

## Search Fields

Search must support:

- Name
- Employee ID
- User ID
- Email
- Phone
- IP
- Extension
- Machine name
- Device Asset ID

## User Creation

IT-authorized users can create a user.

Required validation:

- Required identity fields
- Employee ID uniqueness
- User ID uniqueness
- Email format
- Department/designation references
- Manager reference
- Status validity

## User Editing

Differentiate clearly between:

- User-editable fields
- IT-controlled fields
- Organization-controlled fields

General users must never receive an editable control for protected fields.

## Definition of Done

A user can be:

- Created
- Found
- Viewed
- Updated by authorized users
- Deactivated/inactivated
- Marked resigned

Historical linked records remain intact.

---

# 12. Stage 7 — Employee 360 / User Details

This is the most important feature in the application.

## Page Structure

Use the approved sections:

1. Profile
2. Employment
3. Account & License
4. Machine
5. Current Device
6. Printer
7. Network
8. IP Phone
9. Applications & Software
10. Warranty
11. Device History
12. Service History
13. IT Support History

## Layout

Desktop:

```text
Main content ≈ 68%
Contextual rail ≈ 32%
```

Mobile:

- Single-column flow
- Sticky contextual actions only when useful
- No cramped multi-column forms

## Important behavior

From User Details, IT can:

- Edit user
- Assign/change device
- Return device
- Replace device
- Manage IP
- Manage IP Phone
- Manage printer
- Manage applications
- Manage license
- Add service record
- View warranty
- Create IT support issue
- View support history
- Perform authorized password reset
- View relevant history/audit information

## Device Assignment

Assignment must create history rather than overwrite it.

Example:

```text
Device A
  ↓
User A
  ↓ return
User B
  ↓ replacement
User C
```

All historical assignments remain visible.

---

# 13. Stage 8 — Device, Printer, Network and IP Phone

## Device

Implement:

- Device profile
- Asset ID
- Serial
- Brand
- Model
- Purchase data
- Warranty
- Assignment
- Return
- Replacement
- Service history

## Printer

Implement:

- Printer record
- Model/serial/asset information
- IP address where applicable
- Warranty
- Assignment/access relationship
- History where applicable

Printer remains inside the User Details workflow and is not promoted to primary navigation.

## IP

Implement:

- IP inventory
- Free
- Assigned
- Reserved
- Unavailable
- Assignment history

Use PostgreSQL `inet` where approved.

## IP Phone

Organization-wide directory:

- Department
- User
- Extension
- Availability/assignment state as appropriate

General users:

- View only

IT:

- Assign/change from User Details

Do not display IP addresses in the general IP Phone Directory unless explicitly required by the approved specification.

---

# 14. Stage 9 — Applications and License Renewal

## Applications

Implement:

- Application
- Version
- License type
- Status
- Assigned date
- Renewal date where applicable
- Notes
- User assignment

## Account License

Treat annual renewal as the user's account license.

Display:

- Current status
- Renewal date
- Relevant history
- Upcoming/due/expired state

## Renewal states

```text
Upcoming
Due
Expired
```

`Renewed` is recorded as a renewal history event rather than a permanent current state.

## Renewal Dashboard

Provide IT with:

- Upcoming renewals
- Due renewals
- Expired renewals
- Recently renewed records

---

# 15. Stage 10 — IT Support

## Objective

Digitize the current phone/in-person IT support workflow.

## User Submission

General user can:

1. Open IT Support
2. Create issue
3. Select category
4. Set priority
5. Describe problem
6. Attach files if allowed
7. Submit

Target:

**Issue submission ≤ 2 minutes**

## Lifecycle

```text
Submitted
    ↓
Acknowledged
    ↓
In Progress
    ↓
Waiting / On Hold
    ↓
Resolved
    ↓
Closed
```

## IT Administrator

Can:

- Acknowledge
- Diagnose
- Add internal updates
- Change priority
- Assign/handle
- Put on hold
- Resolve
- Close

## General Manager

Can:

- View IT issues
- View operational status
- Cannot act on issues

## General User

Can:

- View own issues
- View status
- View submitted information
- See resolved/closed state

Cannot see:

- Internal notes
- Internal resolution metrics
- Private operational details

## Resolution Duration

Calculate from timestamps.

This metric is visible only to authorized IT users.

Do not allow users to manually edit calculated duration.

---

# 16. Stage 11 — Booking System

## Meeting Rooms

Flow:

```text
Select room
→ Select date
→ Select time
→ Check availability
→ Confirm if available
→ Block if unavailable
```

## Cars

Use equivalent flow.

## Automatic Approval

If resource is available for the requested time:

```text
Booking → Confirmed
```

No unnecessary approval queue.

If unavailable:

```text
Booking → Blocked
```

## Authorized Admin Actions

Authorized Admin users may:

- Cancel
- Pause
- Deny

Every administrative booking action must be auditable.

## Concurrency

Availability must be enforced transactionally.

Never depend only on frontend availability checks.

---

# 17. Stage 12 — Notifications

## Notification Channels

Only:

- In-app notification dropdown
- Full notifications page
- Browser/PWA Push

Do not implement:

- WhatsApp
- Email notifications

## Notification events

At minimum:

- IT support issue submitted
- Issue acknowledged
- Issue status changed
- Issue resolved/closed
- Booking confirmation
- Booking cancellation/denial/pause
- Relevant renewal reminder
- Important system events

## UX

Top-right notification icon:

- unread indicator
- compact dropdown
- recent notifications
- link to full page

Full notification page:

- unread/read state
- timestamp
- type
- related entity
- clear/open action

---

# 18. Stage 13 — Dashboard Implementation

Dashboard is role-specific.

## IT Administrator

Focus on:

- Users needing attention
- License renewals
- Support workload
- Device/service attention
- Booking overview
- Recent operational activity

## General Manager

Focus on:

- IT issue overview
- Status distribution
- Operational visibility
- Recent activity

No unnecessary administrative controls.

## Admin

Focus on:

- Booking operations
- Relevant administrative activity

## General User

Focus on:

- Personal profile
- Current device/network summary where appropriate
- Own support issues
- Bookings
- Notifications
- Upcoming relevant renewal information if applicable

## Dashboard Principle

Do not build a grid of oversized KPI cards.

Use:

```text
Header
↓
Single operational summary
↓
Primary workspace
↓
Needs attention
↓
Recent activity
```

---

# 19. Stage 14 — Settings

## General User

- My Profile
- Password
- Notification Preferences

## IT Administrator

Additional:

- System Configuration

Do not build:

- Roles & Permissions panel
- Role editor
- Permission matrix

System configuration should contain only approved operational settings.

---

# 20. Stage 15 — PWA and Responsive Implementation

## Responsive targets

Must work well at:

- Desktop
- Laptop
- Tablet
- Mobile

## Mobile rules

- 44px minimum practical touch targets
- No horizontal scrolling for normal workflows
- Tables become responsive lists/cards where appropriate
- Actions remain reachable
- Forms use full-width controls
- Bottom/sticky actions only when they improve usability
- Avoid excessive modal nesting

## PWA

Implement:

- Manifest
- Install prompt handling
- App icons
- Service worker
- Static asset caching
- Browser push
- Update handling

Do not make critical data editing depend on offline availability.

---

# 21. Stage 16 — Real Data Migration

Demo data must not become production data.

## Migration process

### Step 1

Prepare clean source data.

### Step 2

Normalize:

- Employee IDs
- User IDs
- Names
- Departments
- Designations
- Managers
- Emails
- Phones
- Device identifiers
- IP addresses
- Extensions

### Step 3

Load reference data.

### Step 4

Load users.

### Step 5

Load machine/device/printer/network relationships.

### Step 6

Load applications and licenses.

### Step 7

Load historical assignments/service records where available.

### Step 8

Validate relationships.

### Step 9

Run duplicate detection.

### Step 10

Run completeness report.

## Required validation

Check:

- Duplicate employee IDs
- Duplicate user IDs
- Duplicate emails
- Invalid manager references
- Invalid IP values
- Duplicate active IP assignments
- Missing device relationships
- Missing license renewal data
- Invalid status values

Never overwrite production data blindly during migration.

---

# 22. Stage 17 — Testing Strategy

Testing must occur throughout implementation, not only at the end.

## Unit Testing

Test:

- Utility functions
- Date/time formatting
- Validation
- Status transitions
- Permission helpers
- Search/filter transformations

## Component Testing

Test:

- Forms
- Tables
- Modals
- Empty states
- Loading states
- Error states
- Notification components

## Integration Testing

Test complete flows:

### Authentication

Login → session → protected route → logout

### User

Create → search → open → edit → verify

### Device

Create → assign → return → reassign → verify history

### IP

Free → assign → verify assigned → release → verify free

### License

Upcoming → due → renewal → history

### Support

Submit → acknowledge → progress → waiting → resolve → close

### Booking

Create → availability → confirm → cancel/deny where authorized

### Notifications

Event → notification → unread → open/read

---

# 23. Security Testing

Mandatory before production.

## Test

- RLS policies
- Unauthorized record access
- Cross-user data access
- Unauthorized update
- Unauthorized delete
- Privileged Edge Functions
- Session expiration
- Storage access
- Attachment authorization
- Input validation
- XSS-safe rendering
- Secret exposure
- Service-role key exposure
- Browser console leakage
- Audit integrity

## Critical rule

A user must never be able to access another user's private support data by manually changing an ID in a URL or API request.

---

# 24. Performance Testing

Targets:

- User retrieval ≤ 10 seconds
- First-attempt search success ≥ 95%
- Support submission ≤ 2 minutes

Technical checks:

- Avoid unnecessary database requests.
- Use TanStack Query caching.
- Paginate large lists.
- Select only required columns.
- Add database indexes for common searches.
- Avoid N+1 query patterns.
- Lazy-load large feature areas where useful.
- Compress/limit attachment sizes.
- Optimize images.
- Avoid unnecessary Realtime subscriptions.

---

# 25. Accessibility and UX QA

Verify:

- Keyboard navigation
- Visible focus states
- Contrast
- Screen-reader labels for important controls
- 44px touch targets
- No color-only status communication
- Clear error messages
- Clear loading states
- Clear empty states
- Reduced-motion behavior
- Mobile usability

Every form must explain:

**What is wrong + what the user should do.**

---

# 26. Audit Logging

Audit important mutations.

At minimum:

- User creation/update/deactivation
- Device assignment/return/replacement
- Device service record
- Printer changes
- IP assignment/release/change
- IP Phone assignment/change
- Application assignment/change
- License status/renewal
- Support status changes
- Booking admin actions
- Password reset operations
- System configuration changes

Audit entries should contain enough context to answer:

```text
Who?
What?
When?
Which record?
What changed?
Why, when applicable?
```

Never store plaintext passwords or secrets.

---

# 27. Definition of Done — Feature Level

A feature is not complete merely because its UI exists.

A feature is Done only when:

- UI implemented
- Responsive behavior implemented
- Loading state implemented
- Empty state implemented
- Error state implemented
- Validation implemented
- Backend integration complete
- RLS verified
- Authorization verified
- Audit behavior implemented where required
- Realtime behavior implemented where required
- Notifications implemented where required
- Mobile behavior tested
- Accessibility checked
- Acceptance criteria passed

---

# 28. Definition of Done — User Details

User Details is considered complete only when an authorized IT Administrator can manage the complete IT record from one page:

- Profile
- Employment
- Account & License
- Machine
- Current Device
- Printer
- Network
- IP Phone
- Applications & Software
- Warranty
- Device History
- Service History
- IT Support History

And historical relationships remain intact after assignment changes.

---

# 29. Release Gates

Do not deploy to production until all gates pass.

## Gate 1 — Backend

- Migrations complete
- RLS verified
- Constraints verified
- Seed/reference data verified

## Gate 2 — Authentication

- Login works
- Logout works
- Password flow works
- Protected routes verified

## Gate 3 — Core Operations

- Users
- User Details
- Devices
- Printer
- IP
- IP Phone
- Applications
- License

## Gate 4 — Operations

- IT Support
- Bookings
- Notifications

## Gate 5 — UX

- Responsive
- Mobile
- Accessibility
- Loading/error/empty states
- Motion quality

## Gate 6 — Security

- RLS
- Authorization
- Storage
- Edge Functions
- Secret handling
- Audit

## Gate 7 — Data

- Real data imported
- Duplicate check passed
- Data completeness passed

## Gate 8 — Production

- Vercel production deployment
- Supabase production configured
- Environment variables verified
- PWA verified
- Push notifications verified
- Backup/recovery process documented

---

# 30. Production Deployment Sequence

Use this order:

```text
1. Freeze release candidate
2. Run database migration on production
3. Verify database constraints/RLS
4. Import/validate production data
5. Configure production Supabase settings
6. Configure production Edge Functions
7. Configure Vercel environment variables
8. Deploy frontend
9. Run smoke tests
10. Verify authentication
11. Verify critical User Details operations
12. Verify Support
13. Verify Booking
14. Verify Notifications
15. Verify PWA
16. Release to users
```

Do not expose the production URL broadly until smoke testing passes.

---

# 31. Production Smoke Test

Immediately after deployment, verify:

### Authentication

- Login
- Logout
- Session persistence

### User

- Search user
- Open User Details
- Edit permitted field

### Asset

- View device
- Verify assignment
- Verify history

### Network

- View IP
- Verify assignment state

### Support

- Submit issue
- IT receives notification
- Status change visible correctly

### Booking

- Availability check
- Booking creation
- Authorized cancellation

### Notifications

- In-app notification
- Push notification

### Security

- General user cannot access another user's private information.

---

# 32. Post-Launch Stabilization

First stabilization period should prioritize:

1. Security defects
2. Data integrity defects
3. Authentication problems
4. User Details problems
5. Support workflow problems
6. Booking conflicts
7. Notification failures
8. Mobile usability problems
9. Performance issues
10. Visual refinements

Do not immediately add new modules before the core system is stable.

---

# 33. Recommended Development Milestones

## Milestone 1 — Foundation

- Repository
- Supabase environments
- Migrations
- Auth
- RLS
- App shell

## Milestone 2 — Core User System

- Users
- Search/filter
- User Details
- Profile editing

## Milestone 3 — IT Asset System

- Device
- Device history
- Printer
- IP
- IP Phone
- Machine

## Milestone 4 — Software & Renewal

- Applications
- User applications
- Account license
- Renewal tracking

## Milestone 5 — IT Operations

- IT Support
- Attachments
- Support lifecycle
- Resolution metrics

## Milestone 6 — Booking

- Meeting Rooms
- Cars
- Availability
- Auto-confirmation
- Admin actions

## Milestone 7 — Communication

- Notifications
- Push
- Notification center

## Milestone 8 — Dashboard & Settings

- Role-specific dashboards
- Settings
- System configuration

## Milestone 9 — Production Readiness

- PWA
- Responsive polish
- Accessibility
- Security testing
- Performance testing
- Real-data migration
- Production deployment

---

# 34. Final Acceptance Criteria

The application is ready for production when all of the following are true:

- Users can reliably find employees.
- User Details acts as the complete IT management hub.
- Device lifecycle history is preserved.
- Machine identity remains separate from physical devices.
- IP assignment is accurate and conflict-safe.
- IP Phone directory is accurate and appropriately restricted.
- Printer information is available from User Details.
- Applications and account-license renewal are traceable.
- IT Support is fully digitized.
- Support status and resolution timing are correctly recorded.
- General Managers can view IT issues without acting.
- General users can only see their own private support information.
- Meeting room and car bookings prevent conflicts.
- Authorized Admin users can perform approved booking actions.
- Notifications work in-app and through Browser/PWA Push.
- RLS prevents unauthorized access.
- Audit history records critical changes.
- Mobile experience is usable.
- PWA installation works.
- Real data is loaded and validated.
- No demo data remains in production.
- No secrets are exposed in the frontend.
- Production smoke tests pass.

---

# 35. Implementation Rule

The development team should not treat this plan as permission to improvise business rules.

When implementation reveals an ambiguity:

1. Check the PRD.
2. Check the App Flow.
3. Check the Tech Stack.
4. Check the Content Guidelines.
5. Check the Backend Schema.
6. If still ambiguous, stop and clarify before changing the product behavior.

The goal is not simply to make the application work.

The goal is to make **ECI User Management** reliable, secure, maintainable, calm, fast, and operationally useful for real IT work.
