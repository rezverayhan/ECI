# ECI User Management — Phase 5: Backend Schema
## Supabase PostgreSQL Data Model & Security Architecture v1.0

> This document defines the implementation-ready backend schema for ECI User Management.
>
> **Backend:** Supabase  
> **Database:** PostgreSQL  
> **Authentication:** Supabase Auth  
> **Authorization:** Predefined application access rules based on designation/role mapping, with no Role & Permission management UI  
> **Primary IT Administrator:** the designated main IT Administrator account configured in the system  
>
> Sensitive credentials and personal authentication information must never be hard-coded into application source code or database seed files.

---

# 1. Core Database Principles

The database must follow these principles:

1. PostgreSQL is the system of record.
2. User Details is the central IT management hub.
3. Physical assets are independent records from users.
4. Assignment history is never lost when assets move between users.
5. Historical operational records are preserved.
6. Critical multi-table operations must be transactional.
7. RLS is mandatory.
8. Frontend permissions are not the security boundary.
9. Audit history is mandatory for important changes.
10. Normal operational deletion should be avoided.
11. Incorrect records may be deleted only through controlled administrative actions.
12. All timestamps are timezone-aware.
13. Application UI displays Bangladesh local time.
14. Attendance is not part of this schema.

---

# 2. Important Authorization Decision

There will be **NO Role & Permission management system/UI**.

Do NOT create a configurable:

```text
roles
permissions
role_permissions
```

administration interface.

Access is determined by predefined business rules based on the user's approved designation/access classification.

The system must still have a reliable internal authorization mechanism so that RLS and server-side operations can identify what a user is allowed to do.

Recommended internal approach:

```text
auth.users
     ↓
public.users
     ↓
designation / approved access classification
     ↓
application authorization rules
```

The application may use a small internal access classification or database function if technically required, but users must not be able to manage permissions from the UI.

---

# 3. Supabase Auth Relationship

Supabase maintains authentication records in:

```text
auth.users
```

The application maintains employee/user information in:

```text
public.users
```

Relationship:

```text
auth.users.id
      │
      ▼
public.users.auth_user_id
```

Recommended:

```text
public.users.auth_user_id UUID UNIQUE NULL
```

The application should never duplicate passwords inside `public.users`.

---

# 4. Users Table

## Table

```text
users
```

## Purpose

Central employee/application user record.

## Recommended columns

```text
id                  UUID PRIMARY KEY
auth_user_id        UUID UNIQUE NULL
employee_id         TEXT UNIQUE NOT NULL
user_id             TEXT UNIQUE NOT NULL
full_name           TEXT NOT NULL
official_email      TEXT UNIQUE NOT NULL
phone               TEXT
profile_photo_path  TEXT
designation_id      UUID NOT NULL
department_id       UUID NOT NULL
manager_id          UUID NULL
join_date           DATE
employment_status   TEXT NOT NULL
is_active           BOOLEAN NOT NULL DEFAULT TRUE
deleted_at          TIMESTAMPTZ NULL
created_at          TIMESTAMPTZ NOT NULL
updated_at          TIMESTAMPTZ NOT NULL
```

## Rules

- `user_id` cannot be changed by General Users.
- `official_email` cannot be changed by General Users.
- Organization-controlled fields are protected.
- `manager_id` references another user.
- A resigned employee remains in the database for historical records.
- `deleted_at` is only for controlled deletion of incorrect records.

---

# 5. User Status

Allowed values:

```text
active
inactive
resigned
```

Use a PostgreSQL enum or constrained text depending on migration strategy.

Recommended enum:

```text
employment_status_enum
```

---

# 6. Departments

## Table

```text
departments
```

Columns:

```text
id
name
code
description
is_active
created_at
updated_at
```

Constraints:

- `name` unique
- `code` unique where used

---

# 7. Designations

## Table

```text
designations
```

Columns:

```text
id
name
code
description
is_active
created_at
updated_at
```

Examples may include:

- System / IT Administrator
- General Manager
- Admin
- General User
- Other approved organizational designations

Access is determined by approved business rules, not by a user-editable permission matrix.

---

# 8. Manager Relationship

`users.manager_id` references:

```text
users.id
```

Relationship:

```text
Manager
   ↑
   │
User
```

A manager can supervise multiple users.

The current manager is stored on the user record.

Internal manager-change history should be handled through audit history rather than exposed as a normal General User feature.

---

# 9. Physical Devices

## Table

```text
devices
```

A device is a physical asset independent of a user.

Columns:

```text
id
device_type
brand
model
serial_number
asset_id
purchase_date
purchased_by
purchase_price
warranty_duration_months
warranty_start_date
warranty_end_date
status
notes
deleted_at
created_at
updated_at
```

Recommended device types:

```text
Laptop
Desktop
Tablet
Other
```

`asset_id` should be unique.

`serial_number` should be unique where available.

---

# 10. Device Assignments

## Table

```text
device_assignments
```

Purpose:

Preserve complete physical-device lifecycle history.

Columns:

```text
id
device_id
user_id
assigned_at
returned_at
assigned_by
returned_by
assignment_status
replacement_reason
notes
created_at
updated_at
```

Example:

```text
Device A
 ├── User A
 ├── User B
 └── User C
```

Historical assignments remain permanently traceable.

---

# 11. Current Device Relationship

A user's current device should be determined from the active assignment rather than duplicated unnecessarily in `users`.

Conceptually:

```text
users
   ↓
device_assignments
   ↓
devices
```

A user should normally have no more than one current primary device unless the business explicitly allows multiple devices.

The database must enforce the approved assignment rule.

---

# 12. Device Service History

## Table

```text
device_service_records
```

Columns:

```text
id
device_id
service_date
service_type
problem
description
provider
service_center
technician
warranty_covered
cost
status
resolution
completed_date
notes
created_by
created_at
updated_at
```

Service types:

```text
Repair
Maintenance
Diagnostic
Upgrade
Other
```

Statuses:

```text
Open
In Progress
Completed
Cancelled
```

Service history belongs to the physical device.

---

# 13. Printers

Printers are physical IT assets but are NOT a main navigation module.

## Table

```text
printers
```

Columns:

```text
id
printer_name
brand
model
serial_number
asset_id
printer_type
purchase_date
purchased_by
purchase_price
warranty_duration_months
warranty_start_date
warranty_end_date
status
notes
deleted_at
created_at
updated_at
```

---

# 14. Printer Assignments

## Table

```text
printer_assignments
```

Columns:

```text
id
printer_id
user_id
assigned_at
returned_at
assigned_by
returned_by
assignment_status
notes
created_at
updated_at
```

This allows printer assignment to change without losing history.

Printer information and warranty must be visible from User Details.

---

# 15. IP Addresses

## Table

```text
ip_addresses
```

The initial organizational range is:

```text
10.200.198.1
through
10.200.198.254
```

Columns:

```text
id
ip_address
status
reserved_for
notes
created_at
updated_at
```

Statuses:

```text
free
assigned
reserved
unavailable
```

Use PostgreSQL `inet` for the actual IP value.

---

# 16. IP Assignments

## Table

```text
ip_assignments
```

Columns:

```text
id
ip_address_id
user_id
assigned_at
released_at
assigned_by
released_by
assignment_status
notes
created_at
updated_at
```

This preserves historical IP assignment.

Example:

```text
10.200.198.45
 ├── User A
 ├── released
 └── User B
```

---

# 17. IP Assignment Integrity

The same IP cannot be actively assigned to two users simultaneously.

The database must enforce this.

The frontend availability display is not authoritative.

Final availability must be checked transactionally at assignment time.

---

# 18. Machine Identity

Machine identity is separate from physical device identity.

## Table

```text
machine_profiles
```

Columns:

```text
id
user_id
machine_name
operating_system
status
notes
created_at
updated_at
```

A machine name should not automatically change when a physical device changes.

Machine identity and physical device identity are intentionally separate.

---

# 19. IP Phone

## Table

```text
ip_phones
```

Columns:

```text
id
extension
phone_type
status
department_id
notes
created_at
updated_at
```

The general directory should expose:

- Employee
- Department
- Extension
- Status

Do not expose IP address information in the general IP Phone directory unless explicitly required for IT.

---

# 20. IP Phone Assignments

## Table

```text
ip_phone_assignments
```

Columns:

```text
id
ip_phone_id
user_id
assigned_at
released_at
assigned_by
released_by
assignment_status
notes
created_at
updated_at
```

History must remain available.

---

# 21. Applications

## Table

```text
applications
```

Represents an application/software product.

Columns:

```text
id
name
vendor
description
is_active
created_at
updated_at
```

---

# 22. User Applications

## Table

```text
user_applications
```

Represents an application assigned/recorded for a user.

Columns:

```text
id
user_id
application_id
version
license_type
license_status
assigned_date
renewal_date
notes
created_at
updated_at
```

The same application can be assigned to multiple users.

---

# 23. User Account License

## Table

```text
user_licenses
```

Represents the user's organization account license.

Columns:

```text
id
user_id
license_name
license_type
status
start_date
expiry_date
auto_renew
notes
created_at
updated_at
```

Statuses:

```text
active
upcoming
due
expired
```

---

# 24. License Renewal History

## Table

```text
license_renewals
```

Columns:

```text
id
user_license_id
user_id
previous_expiry_date
renewed_on
new_expiry_date
renewed_by
notes
created_at
```

This preserves annual renewal history.

Example:

```text
2025 renewal
2026 renewal
2027 renewal
```

---

# 25. IT Support Issues

## Table

```text
support_issues
```

Columns:

```text
id
issue_number
user_id
title
category
description
priority
status
assigned_to
submitted_at
acknowledged_at
started_at
resolved_at
closed_at
resolution
internal_notes
created_at
updated_at
```

Issue categories:

```text
Laptop / Computer
Network / LAN
Internet
IP Address
IP Phone
Software
Access
Hardware
Printer / Peripheral
Other
```

Priority:

```text
Low
Medium
High
Urgent
```

Status:

```text
Submitted
Acknowledged
In Progress
Waiting / On Hold
Resolved
Closed
```

---

# 26. Support Issue Updates

## Table

```text
support_issue_updates
```

Purpose:

Store timeline/history of issue changes.

Columns:

```text
id
issue_id
actor_user_id
update_type
old_status
new_status
comment
created_at
```

Examples:

```text
Status changed
Comment added
Issue acknowledged
Issue assigned
Issue resolved
Issue closed
```

---

# 27. Support Issue Attachments

## Table

```text
support_issue_attachments
```

Columns:

```text
id
issue_id
storage_path
file_name
file_type
file_size
uploaded_by
created_at
```

Actual files live in a private Supabase Storage bucket.

---

# 28. IT Support Resolution Duration

Do not store a manually entered resolution duration as the source of truth.

Calculate it from timestamps.

Recommended:

```text
resolution_duration =
resolved_at - submitted_at
```

The application can calculate/display:

```text
2 hours 18 minutes
```

This avoids inconsistent manually entered values.

---

# 29. Meeting Rooms

## Table

```text
meeting_rooms
```

Columns:

```text
id
name
location
capacity
description
status
created_at
updated_at
```

Statuses may include:

```text
Available
Unavailable
Maintenance
```

---

# 30. Meeting Room Bookings

## Table

```text
meeting_room_bookings
```

Columns:

```text
id
meeting_room_id
user_id
start_at
end_at
title
purpose
status
admin_action
admin_action_reason
cancelled_at
cancelled_by
created_at
updated_at
```

Booking status:

```text
Confirmed
Pending
Paused
Cancelled
Denied
Completed
```

Normal available bookings should automatically become Confirmed.

---

# 31. Car Inventory

## Table

```text
cars
```

Columns:

```text
id
name
registration_number
model
driver_information
status
notes
created_at
updated_at
```

The exact driver model can be refined if the business later requires dedicated driver records.

---

# 32. Car Bookings

## Table

```text
car_bookings
```

Columns:

```text
id
car_id
user_id
start_at
end_at
destination
purpose
status
admin_action
admin_action_reason
cancelled_at
cancelled_by
created_at
updated_at
```

Normal available bookings become Confirmed automatically.

---

# 33. Booking Conflict Protection

Booking conflicts must be prevented at database/business-logic level.

The system must reject overlapping confirmed bookings for the same resource.

This cannot depend only on frontend availability.

---

# 34. Notifications

## Table

```text
notifications
```

Columns:

```text
id
recipient_user_id
notification_type
title
message
related_entity_type
related_entity_id
is_read
read_at
created_at
```

Examples:

```text
support_issue
booking
license
warranty
system
```

---

# 35. Push Subscriptions

## Table

```text
push_subscriptions
```

Columns:

```text
id
user_id
endpoint
p256dh_key
auth_key
user_agent
is_active
created_at
updated_at
```

This supports browser/PWA push notifications.

No WhatsApp or email notification integration is required for the current system.

---

# 36. Audit Logs

## Table

```text
audit_logs
```

Columns:

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

Recommended JSONB fields:

```text
old_values JSONB
new_values JSONB
metadata JSONB
```

---

# 37. Audit Actions

Examples:

```text
USER_CREATED
USER_UPDATED
USER_DELETED

DEVICE_ASSIGNED
DEVICE_REPLACED
DEVICE_RETURNED
DEVICE_SERVICE_ADDED

PRINTER_ASSIGNED
PRINTER_REPLACED
PRINTER_RETURNED

IP_ASSIGNED
IP_CHANGED
IP_RELEASED

IP_PHONE_ASSIGNED
IP_PHONE_CHANGED
IP_PHONE_RELEASED

APPLICATION_ASSIGNED
APPLICATION_UPDATED
APPLICATION_REMOVED

LICENSE_CREATED
LICENSE_RENEWED
LICENSE_UPDATED

SUPPORT_CREATED
SUPPORT_ACKNOWLEDGED
SUPPORT_STATUS_CHANGED
SUPPORT_RESOLVED
SUPPORT_CLOSED

BOOKING_CREATED
BOOKING_CANCELLED
BOOKING_PAUSED
BOOKING_DENIED

PASSWORD_RESET
```

---

# 38. User Profile History

A separate profile-history table is not mandatory for every user field.

Important changes should be captured by:

```text
audit_logs
```

This prevents unnecessary duplication while maintaining traceability.

---

# 39. Deleted Records

Most operational tables should use:

```text
deleted_at TIMESTAMPTZ NULL
```

only where controlled deletion is genuinely needed.

Examples:

- users
- devices
- printers
- applications
- meeting rooms
- cars

Historical tables should normally not support normal deletion.

---

# 40. Deletion Safety

Before deleting an incorrect user:

```text
Check dependencies
 ↓
Does historical data exist?
 ├── No → controlled delete permitted
 └── Yes → archive/deactivate preferred
```

A user with:

- device history
- service history
- support issues
- license history
- audit history

should normally remain as a historical record.

---

# 41. Foreign Key Strategy

Relationships should use explicit foreign keys.

Examples:

```text
users.department_id
    → departments.id

users.designation_id
    → designations.id

users.manager_id
    → users.id

device_assignments.device_id
    → devices.id

device_assignments.user_id
    → users.id

ip_assignments.ip_address_id
    → ip_addresses.id

ip_assignments.user_id
    → users.id
```

Foreign keys should use appropriate `ON DELETE` behavior.

Do not cascade-delete historical data accidentally.

---

# 42. User-Centric Relationship Map

```text
                           ┌── machine_profiles
                           │
                           ├── device_assignments ── devices
                           │                         └── service records
                           │
User ──────────────────────┼── printer_assignments ── printers
                           │
                           ├── ip_assignments ────── ip_addresses
                           │
                           ├── ip_phone_assignments ─ ip_phones
                           │
                           ├── user_applications ─── applications
                           │
                           ├── user_licenses
                           │        └── license_renewals
                           │
                           ├── support_issues
                           │        ├── updates
                           │        └── attachments
                           │
                           ├── meeting_room_bookings
                           ├── car_bookings
                           ├── notifications
                           ├── push_subscriptions
                           └── audit_logs
```

This is the core Employee 360 data model.

---

# 43. Device History Ownership

Device history belongs to the device.

Therefore:

```text
devices
   ↓
device_assignments
   ↓
users
```

NOT:

```text
users
   ↓
current_device_history
```

This is critical for preserving:

```text
User A → User B → User C
```

---

# 44. Printer History Ownership

Printer assignment history follows the same principle:

```text
printers
   ↓
printer_assignments
   ↓
users
```

Warranty belongs to the physical printer.

---

# 45. Warranty Model

Warranty information belongs to physical assets.

For devices:

```text
devices
 ├── warranty_start_date
 ├── warranty_end_date
 └── warranty_duration_months
```

For printers:

```text
printers
 ├── warranty_start_date
 ├── warranty_end_date
 └── warranty_duration_months
```

User Details can display the warranty of the currently assigned asset.

---

# 46. Warranty Attention Logic

The application can calculate:

```text
Warranty Active
Warranty Expiring Soon
Warranty Expired
```

The exact alert threshold can be configured later.

Recommended initial threshold:

```text
30 days before expiry
```

---

# 47. Renewal Attention Logic

Similarly:

```text
Active
Upcoming
Due
Expired
```

can be derived from:

```text
expiry_date
current_date
```

Avoid manually storing redundant status values where a derived status is safer.

If status is persisted for query performance, the database/application must keep it synchronized.

---

# 48. Database Index Strategy

Important indexes should include:

## Users

```text
employee_id
user_id
official_email
department_id
designation_id
manager_id
employment_status
```

## Devices

```text
asset_id
serial_number
status
```

## Device Assignments

```text
device_id
user_id
assigned_at
returned_at
```

## IP

```text
ip_address
status
```

## IP Assignments

```text
ip_address_id
user_id
assigned_at
released_at
```

## Support

```text
issue_number
user_id
status
priority
category
assigned_to
submitted_at
```

## Renewals

```text
user_id
expiry_date
status
```

## Bookings

```text
meeting_room_id
car_id
user_id
start_at
end_at
status
```

---

# 49. Search Index Strategy

User search should not load every record into the browser.

Use server-side search.

Potential searchable fields:

```text
full_name
employee_id
user_id
official_email
phone
machine_name
IP address
extension
asset_id
```

Indexes should be aligned with real search patterns.

---

# 50. RLS Architecture

RLS must be enabled on all user-facing application tables containing protected information.

Core rules:

## General User

Can access own:

- user profile
- permitted user information
- support issues
- bookings
- notifications
- push subscription

Can view:

- IP Phone Directory

Cannot:

- modify IT-managed resources
- view other users' private IT records
- view internal IT support notes
- view resolution duration

## IT Administrator

Can access the full IT operational scope.

## General Manager

Can read IT Support records according to approved visibility.

Cannot modify support records.

## Admin

Can perform approved administrative booking actions.

---

# 51. RLS Implementation Principle

RLS policies should use a centralized authorization helper rather than duplicating complex logic in every policy.

Possible pattern:

```text
current_app_user()
current_app_access_classification()
is_it_admin()
is_admin()
is_general_manager()
```

The exact implementation should be finalized during SQL implementation.

---

# 52. Main IT Administrator

The organization has a designated main IT Administrator account.

The production seed/configuration should associate that account with the approved IT Administrator access classification.

Do not hard-code the person's email address into frontend authorization checks.

Instead:

```text
Authenticated user
 ↓
public.users
 ↓
Approved designation/access classification
 ↓
Authorization rule
```

This allows the account to remain manageable without changing application source code.

---

# 53. User Profile Update Security

General User update policy:

Allowed:

- approved editable personal fields

Blocked:

- user_id
- official_email
- designation
- department
- manager
- employment status
- IT assets
- IP
- IP Phone
- license
- device
- printer

unless explicitly authorized.

---

# 54. IT Administrator User Update

IT Admin can update organization-controlled user information according to approved business rules.

Every important update should create an audit event.

---

# 55. Password Reset Security

Password reset must NOT be implemented as a normal database update to `public.users`.

Use:

```text
IT Admin
 ↓
Protected Edge Function
 ↓
Supabase Auth administrative operation
 ↓
Audit log
```

Never store:

```text
password
plaintext_password
temporary_password
```

in normal business tables.

---

# 56. Booking Database Rules

For confirmed bookings:

```text
Same resource
+
Overlapping time
=
Not allowed
```

This must be enforced server-side.

Admin actions:

```text
Cancel
Pause
Deny
```

must be authorized by the Admin access classification.

---

# 57. IT Support Database Rules

When an issue becomes `Resolved`:

```text
resolved_at
```

must be populated.

When an issue becomes `Closed`:

```text
closed_at
```

must be populated.

The system should prevent inconsistent states such as:

```text
status = resolved
resolved_at = null
```

---

# 58. License Database Rules

A user should have a clearly identifiable current account license.

Renewal history must not overwrite previous renewal records.

Example:

```text
user_licenses
    current license
         │
         └── license_renewals
                ├── 2025
                ├── 2026
                └── 2027
```

---

# 59. Realtime Tables

Realtime may be enabled selectively for:

```text
support_issues
notifications
booking status
important operational updates
```

Do not enable broad realtime unnecessarily.

---

# 60. Storage Structure

Private bucket:

```text
it-support-attachments
```

Recommended object path:

```text
support/{issue_id}/{attachment_id}/{filename}
```

Do not use predictable public URLs for sensitive issue attachments.

---

# 61. Database Trigger Candidates

Potential triggers:

### Updated timestamp

Automatically update:

```text
updated_at
```

### Support issue

When status becomes:

```text
Acknowledged
In Progress
Resolved
Closed
```

populate appropriate timestamps.

### Audit

Critical changes can be captured through explicit business logic and/or controlled database triggers.

Do not create uncontrolled trigger networks that make debugging difficult.

---

# 62. Data Integrity Rules

The schema should enforce:

- Unique employee ID
- Unique User ID
- Unique official email
- Unique device asset ID
- Unique IP address
- Unique extension
- No overlapping active assignment for the same asset
- No overlapping active assignment for the same IP
- No overlapping confirmed booking for the same resource
- Valid status transitions
- Required timestamps for resolved/closed issues
- Valid foreign keys
- Non-negative costs
- Valid warranty dates
- Valid renewal dates

---

# 63. Status Transition Rules

IT Support:

```text
Submitted
 → Acknowledged
 → In Progress
 → Waiting / On Hold
 → In Progress
 → Resolved
 → Closed
```

Allow appropriate controlled transitions.

Do not allow arbitrary status manipulation from the frontend.

---

# 64. Device Assignment Rules

A device may have:

```text
0 or 1 active assignment
```

unless the business explicitly introduces shared/multi-user device support.

A user may have:

```text
0 or 1 primary current device
```

for the current MVP.

---

# 65. Printer Assignment Rules

A printer may have:

```text
0 or 1 active primary user assignment
```

unless shared printers are later required.

If shared printers become a requirement, the schema can be extended without changing the core printer asset model.

---

# 66. IP Phone Assignment Rules

An extension may have:

```text
0 or 1 active user assignment
```

Historical assignments remain.

---

# 67. Application Assignment Rules

A user may have multiple applications.

An application may belong to many users.

Therefore:

```text
users
   ↕
user_applications
   ↕
applications
```

---

# 68. Data Lifecycle

The system should follow:

```text
Create
 ↓
Active
 ↓
Updated
 ↓
Historical
 ↓
Archived / Retired
```

rather than:

```text
Create
 ↓
Delete
```

for normal operational lifecycle management.

---

# 69. Backend Schema Implementation Order

Recommended migration order:

```text
1. Extensions / helper functions
2. Departments
3. Designations
4. Users
5. Machine profiles
6. Devices
7. Device assignments
8. Device service records
9. Printers
10. Printer assignments
11. IP addresses
12. IP assignments
13. IP Phones
14. IP Phone assignments
15. Applications
16. User applications
17. User licenses
18. License renewals
19. Support issues
20. Support issue updates
21. Support attachments
22. Meeting rooms
23. Meeting room bookings
24. Cars
25. Car bookings
26. Notifications
27. Push subscriptions
28. Audit logs
29. Indexes
30. RLS policies
31. Triggers / functions
32. Seed data
```

---

# 70. Seed Data

Seed data should include only required system configuration.

Do not insert fake/demo employees into production.

Production should use real organizational records.

Development environments may use clearly labeled test data.

---

# 71. Attendance

No tables should be created for:

- Attendance
- Attendance devices
- Attendance logs
- Attendance reports

Attendance remains outside the current scope.

---

# 72. Final Database Relationship Summary

```text
departments
    │
    └──────── users ───────── designations
                 │
                 ├── manager_id → users
                 │
                 ├── machine_profiles
                 │
                 ├── device_assignments → devices
                 │                         └── device_service_records
                 │
                 ├── printer_assignments → printers
                 │                           └── warranty
                 │
                 ├── ip_assignments → ip_addresses
                 │
                 ├── ip_phone_assignments → ip_phones
                 │
                 ├── user_applications → applications
                 │
                 ├── user_licenses
                 │       └── license_renewals
                 │
                 ├── support_issues
                 │       ├── support_issue_updates
                 │       └── support_issue_attachments
                 │
                 ├── meeting_room_bookings → meeting_rooms
                 │
                 ├── car_bookings → cars
                 │
                 ├── notifications
                 │
                 ├── push_subscriptions
                 │
                 └── audit_logs
```

---

# 73. Final Schema Decisions

The following are now locked:

1. `users` is the central employee/application record.
2. Departments are separate records.
3. Designations are separate records.
4. There is NO Role & Permission management UI.
5. Authorization is based on predefined approved designation/access rules.
6. The main IT Administrator is configured as the approved IT Administrator account, not hard-coded into frontend code.
7. Devices are separate physical assets.
8. Device assignments preserve full history.
9. Printers are separate physical assets but are managed from User Details, not main navigation.
10. Printer assignment and warranty are visible from User Details.
11. IP addresses and IP assignment history are separate.
12. IP Phones and assignment history are separate.
13. Applications and user application assignments are separate.
14. User licenses and renewal history are separate.
15. IT Support has issues, updates and attachments.
16. Meeting Rooms and Cars have separate booking tables.
17. Booking conflicts are database/server enforced.
18. Notifications and browser push subscriptions are separate.
19. Audit logs are mandatory.
20. Historical operational data is preserved.
21. Controlled delete exists for genuinely incorrect records.
22. Password operations use Supabase Auth through protected server-side logic.
23. RLS is mandatory.
24. Attendance is excluded.
25. All IT resources remain connected to the user through User Details / Employee 360.

---

# 74. Next Phase

**PHASE 5 — BACKEND SCHEMA is complete.**

The next phase is:

> **PHASE 6 — IMPLEMENTATION PLAN**

Phase 6 will define:

- Development order
- Sprint/phase breakdown
- Database migration order
- Authentication implementation
- RLS implementation
- UI implementation sequence
- Feature-by-feature build order
- Reusable component strategy
- Testing strategy
- Security testing
- Data migration/import strategy
- Real Supabase data connection
- Development → Preview → Production workflow
- QA checklist
- Acceptance criteria
- Deployment checklist
- Post-launch stabilization

No implementation code should be written as part of the planning document until the implementation sequence is approved.
