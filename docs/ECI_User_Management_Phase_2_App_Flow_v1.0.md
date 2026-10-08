# ECI User Management — Phase 2: App Flow
## Implementation-Ready Application Flow v1.0

> This document defines the complete application flow for ECI User Management based on the approved PRD v1.1 decisions.
>
> **Core principle:** One User → One Complete IT Record  
> **Management Hub:** User Details / Employee 360

---

# 1. Global Application Architecture

## 1.1 Login → Role-Based Dashboard

After successful authentication, the system identifies the user's role and routes them to the appropriate dashboard.

| Role | Landing Dashboard |
|---|---|
| System / IT Administrator | IT Operations Dashboard |
| General Manager | Management / IT Overview Dashboard |
| Admin | Admin Dashboard |
| General User | Personal Dashboard |

The role determines what navigation items and actions are available.

---

# 2. Main Navigation

The primary navigation is:

```text
Dashboard
Users
Bookings
    ├── Meeting Rooms
    └── Cars
IP Phone Directory
IT Support
Renewals
Notifications
Settings
```

## Important Navigation Rule

The following are NOT separate main navigation items:

- Devices
- IP Addresses
- Applications / Software
- Warranty
- Device Service
- Device History
- Printer

These are managed primarily from the **User Details / Employee 360** page.

---

# 3. Global Navigation Behavior

## Desktop

Recommended structure:

```text
┌─────────────────────────────────────────────────────────────┐
│ Top Header                                      Profile     │
├───────────────┬─────────────────────────────────────────────┤
│ Dashboard     │                                             │
│ Users         │                                             │
│ Bookings      │               Page Content                  │
│ IP Phone      │                                             │
│ IT Support    │                                             │
│ Renewals      │                                             │
│ Notifications │                                             │
│ Settings      │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

## Mobile

The navigation should transform into a mobile-friendly navigation pattern.

The application must NOT simply shrink the desktop sidebar.

Recommended:

- Compact header
- Menu trigger / drawer
- Clear current-section indicator
- Touch targets approximately 44px or larger

---

# 4. Authentication Flow

```text
Login
  ↓
Enter Email / User ID
  ↓
Enter Password
  ↓
Validate Authentication
  ↓
Authentication Success?
  ├── No → Show error → Remain on Login
  └── Yes
       ↓
   Identify Role
       ↓
   Load Permissions
       ↓
   Load Dashboard
```

## Login Error

The error should explain:

- What happened
- What the user should do next

Examples:

- Invalid credentials → “Your email or password is incorrect.”
- Account inactive → “Your account is inactive. Contact IT Administrator.”

---

# 5. Dashboard Flow

## 5.1 IT Administrator Dashboard

Primary question:

> **What needs my attention now?**

Flow:

```text
Login
 ↓
IT Operations Dashboard
 ↓
Review operational summary
 ↓
Choose attention item
 ├── IT Issue → Issue Details
 ├── Renewal → Renewal Details / User Details
 ├── Warranty → User Details / Device
 ├── IP Attention → User Details / IP
 ├── User → User Details
 └── Activity → Activity Details
```

### Main Dashboard Information

- Total users
- Active / inactive users
- Upcoming renewals
- Due renewals
- Expired licenses
- New IT issues
- In-progress issues
- Waiting issues
- Resolved issues
- Warranty attention
- IP/network attention
- Recent activity

---

# 6. General User Dashboard Flow

```text
Login
 ↓
Personal Dashboard
 ↓
View personal information
 ├── My Profile
 ├── Current Device
 ├── IP / Extension
 ├── License / Renewal
 ├── My IT Support
 ├── My Bookings
 └── Notifications
```

The General User should not see other employees' private IT information.

---

# 7. User Management Flow

## 7.1 User List

```text
Dashboard
 ↓
Users
 ↓
User List
```

User List supports:

- Search
- Filters
- Status
- Department
- Designation
- Manager
- Device status
- IP status
- License status

### Search Fields

- Name
- Employee ID
- User ID
- Email
- Phone
- IP
- Extension
- Machine name
- Device Asset ID

---

# 8. User List → User Details

The entire user row is clickable.

```text
User List
 ↓
Click anywhere on User Row
 ↓
User Details / Employee 360
```

There may also be an explicit visual View/Arrow action, but it is not required for navigation.

### UX Rule

Do NOT require users to click only a tiny View button.

The complete row should be an obvious interactive target.

---

# 9. User Details / Employee 360 Flow

This is the most important operational flow in the application.

```text
Users
 ↓
User List
 ↓
User Details / Employee 360
```

## User Details Primary Hierarchy

```text
Identity
 ↓
Employment
 ↓
Account / License
 ↓
Machine Identity
 ↓
Current Physical Device
 ↓
Printer
 ↓
Network / IP
 ↓
IP Phone / Extension
 ↓
Applications / Software
 ↓
Warranty
 ↓
Device Assignment History
 ↓
Device Service History
 ↓
IT Support History
```

---

# 10. User Details — Identity Section

Displays:

- Profile photo
- Full name
- Employee ID
- User ID
- Designation
- Department
- Manager / Supervisor
- Email
- Phone
- Employment status
- Join date

## Supervisor Privacy Rule

If the employee's supervisor/manager is updated by an authorized administrator:

- The system stores the updated supervisor.
- The employee can see their normal profile information according to approved visibility.
- The employee must NOT see the internal supervisor-update/change history.

Internal administrative changes remain protected.

---

# 11. User Details — Edit User

IT Admin:

```text
User Details
 ↓
Edit User
 ↓
Modify allowed fields
 ↓
Validate
 ↓
Save
 ↓
Update Supabase
 ↓
Write Audit Record
 ↓
Refresh User Details
```

## Locked Fields

The following cannot be changed by General Users:

- User ID
- Official organization email
- Organization-controlled fields

IT Admin may modify controlled fields according to business rules.

---

# 12. User Details — Device Management

Device management is performed directly from the user record.

```text
User Details
 ↓
Current Device
 ↓
Assign / Replace / Return
```

## Assign Device

```text
Assign Device
 ↓
Select / Enter Physical Device
 ↓
Validate Device Information
 ↓
Set Assignment Date
 ↓
Confirm
 ↓
Create Assignment History
 ↓
Update Current Device
 ↓
Audit Event
```

## Replace Device

```text
User Details
 ↓
Replace Device
 ↓
Record Return of Current Device
 ↓
Record Replacement Reason
 ↓
Select New Device
 ↓
Set New Assignment Date
 ↓
Confirm
 ↓
Close Previous Assignment
 ↓
Create New Assignment
 ↓
Preserve Device History
 ↓
Audit
```

## Critical Rule

Replacing a physical device must NOT automatically change:

- Machine name
- IP address

These are separate identities and require explicit changes.

---

# 13. Device History Flow

```text
User Details
 ↓
Device History
 ↓
View Assignment Timeline
```

Example:

```text
Laptop A
 ├── User A
 │    ├── Assigned: Jan 2025
 │    └── Returned: Jun 2025
 │
 ├── User B
 │    ├── Assigned: Jun 2025
 │    └── Returned: Feb 2026
 │
 └── User C
      └── Assigned: Feb 2026
```

Historical assignments must remain intact.

---

# 14. Device Service History Flow

```text
User Details
 ↓
Device
 ↓
Service History
 ↓
View Existing Service Records
        OR
Add Service Record
```

## Add Service Record

```text
Add Service
 ↓
Service Date
 ↓
Service Type
 ↓
Problem
 ↓
Description
 ↓
Provider / Service Center
 ↓
Technician
 ↓
Warranty Covered?
 ↓
Cost
 ↓
Status
 ↓
Resolution
 ↓
Completed Date
 ↓
Notes
 ↓
Save
 ↓
Device Service History Updated
 ↓
Audit
```

---

# 15. Printer Management from User Details

A user can have an assigned/used printer.

Printer information belongs inside User Details and is NOT a separate main navigation item.

## Printer Information

Possible fields:

- Printer name
- Brand
- Model
- Serial number
- Asset ID
- Printer type
- Assignment date
- Purchase date
- Warranty duration
- Warranty start
- Warranty end
- Warranty status
- Notes

## Flow

```text
User Details
 ↓
Printer
 ↓
View Current Printer
 ↓
Edit / Assign / Replace
 ↓
Save
 ↓
Update User Record
 ↓
Audit
```

Printer warranty must be visible from the User Details page.

---

# 16. IP Address Flow

IP management is initiated from User Details for an employee.

```text
User Details
 ↓
Network / IP
 ↓
View Current IP
 ↓
Assign / Change / Release
```

## Assign IP

```text
Assign IP
 ↓
Show available IPs
 ↓
Select IP
 ↓
Validate availability
 ↓
Confirm
 ↓
Assign IP to User
 ↓
Update IP Status
 ↓
Audit
```

## Change IP

```text
Current IP
 ↓
Change IP
 ↓
Select available IP
 ↓
Confirm
 ↓
Release previous IP
 ↓
Assign new IP
 ↓
Audit
```

## Global IP Visibility

IT Admin can access IP status information through appropriate system views or dashboard areas.

Statuses:

- Free
- Assigned
- Reserved / Booked
- Unavailable

---

# 17. IP Phone / Extension Flow

## General User

```text
IP Phone Directory
 ↓
Search / Browse
 ↓
View Employee / Department / Extension
```

No editing.

## IT Admin

```text
User Details
 ↓
IP Phone / Extension
 ↓
Assign / Change
 ↓
Save
 ↓
Audit
```

---

# 18. Applications / Software Flow

```text
User Details
 ↓
Applications / Software
 ↓
View Assigned Applications
 ↓
Add / Edit / Remove Application
```

Possible information:

- Application
- Version
- License type
- License status
- Assigned date
- Renewal date
- Notes

Changes must be auditable.

---

# 19. User Account / License Flow

```text
User Details
 ↓
Account / License
 ↓
View Current License
 ↓
View Renewal Date
 ↓
View Renewal History
```

## Renewal Flow

```text
License approaching renewal
 ↓
Dashboard / Notification
 ↓
Open Renewal
 ↓
Open User Details
 ↓
Renew License
 ↓
Enter renewal information
 ↓
Confirm
 ↓
Update license status
 ↓
Create renewal history
 ↓
Create audit record
 ↓
Notification / activity update
```

Statuses:

- Active
- Upcoming
- Due
- Expired
- Renewed

---

# 20. IT Support — Employee Flow

```text
Dashboard
 ↓
IT Support
 ↓
Create Issue
 ↓
Select Category
 ↓
Enter Title
 ↓
Describe Problem
 ↓
Select Priority
 ↓
Attach File (optional)
 ↓
Submit
 ↓
Issue Created
 ↓
IT Admin Notified
 ↓
Employee sees Submitted status
```

---

# 21. IT Support — IT Administrator Flow

```text
New Issue
 ↓
IT Support Queue
 ↓
Open Issue
 ↓
Acknowledge
 ↓
Diagnose / Review
 ↓
Assign IT Person if required
 ↓
In Progress
 ↓
Resolve
 ↓
Enter Resolution
 ↓
Resolved Timestamp
 ↓
Automatic Resolution Duration
 ↓
Close
```

Recommended lifecycle:

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

---

# 22. IT Support — Resolution Timer

The system automatically calculates resolution duration.

Conceptually:

```text
Resolution Duration
=
Resolved Timestamp
-
Issue Submission Timestamp
```

The system should not require IT Admin to manually type the duration.

The duration should be calculated from timestamps.

## Visibility

- IT Admin: Full resolution duration.
- General User: Status/resolved information only.
- General Manager: Issue visibility according to role, but internal resolution-performance data remains protected unless explicitly approved.

---

# 23. IT Support from User Details

IT Admin can create/view support issues directly from a user's Employee 360 page.

```text
User Details
 ↓
IT Support History
 ↓
View all issues for this user
 ↓
Create New IT Issue
```

The page should show:

- Total number of issues
- Open issues
- In-progress issues
- Waiting issues
- Resolved issues
- Recent issues
- Issue category
- Issue date
- Current status

## Example

```text
IT Support History

Total Issues: 12

Open: 1
In Progress: 2
Waiting: 1
Resolved: 8

Recent:
LAN not working        In Progress
Laptop overheating     Resolved
Outlook problem        Resolved
IP issue               Resolved
```

This allows IT to understand the user's support history and recurring problems.

---

# 24. General User IT Support Visibility

General User:

```text
IT Support
 ↓
My Issues
 ↓
Select Issue
 ↓
View Status
```

Can see:

- Issue title
- Category
- Submitted date
- Current status
- Resolution/closure status when available

Cannot see:

- Internal IT notes
- Internal diagnosis notes
- Resolution-performance metrics
- Internal administrative details

---

# 25. General Manager IT Support Flow

```text
Dashboard
 ↓
IT Support
 ↓
All Issues
 ↓
View Issue
```

General Manager can review issues but cannot:

- Assign
- Change status
- Diagnose
- Resolve
- Close

The UI must therefore be clearly read-only for this role.

---

# 26. Meeting Room Booking Flow

```text
Bookings
 ↓
Meeting Rooms
 ↓
Select Date
 ↓
Select Time
 ↓
View Available Rooms
 ↓
Select Room
 ↓
Enter Booking Details
 ↓
Check Availability
```

System decision:

```text
Available?
 ├── YES → Auto Confirm
 └── NO  → Block Booking
```

No approval workflow is required.

---

# 27. Car Booking Flow

```text
Bookings
 ↓
Cars
 ↓
Select Date
 ↓
Select Time
 ↓
View Available Cars
 ↓
Select Car
 ↓
Enter Booking Details
 ↓
Check Availability
```

System decision:

```text
Available?
 ├── YES → Auto Confirm
 └── NO  → Block Booking
```

---

# 28. Admin Booking Control

Authorized users with the **Admin designation/role** can manage bookings.

Admin actions may include:

- Cancel
- Pause / hold
- Deny

Flow:

```text
Booking
 ↓
Admin opens booking
 ↓
Select action
 ├── Cancel
 ├── Pause / Hold
 └── Deny
 ↓
Enter reason if required
 ↓
Confirm
 ↓
Booking status updated
 ↓
Relevant user notification
 ↓
Audit record
```

Only users with the approved Admin access can perform these actions.

---

# 29. Booking Conflict Prevention

The system must prevent conflicting bookings.

Before confirming:

```text
Requested Resource
+
Requested Date
+
Requested Start Time
+
Requested End Time
        ↓
Availability Check
        ↓
Conflict?
 ├── Yes → Booking blocked
 └── No  → Booking confirmed
```

The system must validate conflicts server-side, not only in the frontend.

---

# 30. IP Phone Directory Flow

```text
IP Phone Directory
 ↓
Search
 ↓
Filter by Department
 ↓
View Employee
 ↓
View Extension
```

The directory is organization-wide.

General Users have view access only.

---

# 31. Renewals Flow

```text
Renewals
 ↓
Renewal Dashboard / List
```

Filters:

- Upcoming
- Due
- Expired
- Renewed

IT Admin:

```text
Renewal List
 ↓
Select User
 ↓
Open User Details
 ↓
Review License
 ↓
Renew
 ↓
Save
 ↓
History Updated
```

---

# 32. Notifications Flow

Notifications are available in two ways.

## 32.1 Header Notification Dropdown

```text
Top Right Notification Icon
 ↓
Notification Dropdown
 ↓
Recent Notifications
 ↓
Click Notification
 ↓
Open Related Record
```

Examples:

- New IT issue
- Issue status changed
- Renewal due
- License expired
- Warranty attention
- Booking confirmation

## 32.2 Full Notifications Page

```text
Notifications
 ↓
All Notifications
 ↓
Filter / Search
 ↓
Open Notification
 ↓
Navigate to Related Record
```

---

# 33. Settings Flow

Settings contains:

```text
Settings
├── My Profile
├── Password
├── Notification Preferences
└── System Configuration (IT Admin only)
```

## Explicitly Excluded

There is NO:

```text
Settings
└── Roles & Permissions
```

The application uses predefined role-specific access defined by the product requirements.

---

# 34. Password Change Flow

```text
Settings
 ↓
Password
 ↓
Enter Current Password
 ↓
Enter New Password
 ↓
Confirm New Password
 ↓
Validate
 ↓
Update Authentication
 ↓
Success
```

Password rules should be clearly communicated.

---

# 35. Notification Preference Flow

```text
Settings
 ↓
Notification Preferences
 ↓
View available preferences
 ↓
Enable / Disable allowed notifications
 ↓
Save
```

System-critical notifications may remain mandatory.

---

# 36. System Configuration Flow

System Configuration is restricted to authorized IT/System Administrators.

Possible areas:

- System settings
- Booking configuration
- IP configuration
- Notification configuration
- Other approved operational settings

Role & Permission management is NOT included.

---

# 37. Global Search / Retrieval Principle

The application should optimize for rapid information retrieval.

An IT Administrator should be able to search:

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

Search result:

```text
Search
 ↓
Matching User
 ↓
User Details / Employee 360
 ↓
Complete IT Record
```

---

# 38. Error Flow

Every important action should provide:

**What happened + What to do next**

Example:

```text
Unable to assign IP

This IP address has already been assigned.

Choose another available IP address.
```

Avoid vague errors such as:

```text
Something went wrong.
```

---

# 39. Empty State Flow

Every data section must have a meaningful empty state.

Example:

```text
No device assigned

This user currently has no physical device assigned.

[Assign Device]
```

For General Users, action buttons should only appear when they have permission.

---

# 40. Loading State

Use calm, lightweight loading states.

Avoid excessive skeleton screens.

For important data:

```text
Loading User Details...
```

The interface should maintain layout stability while data loads.

---

# 41. Success State

After a successful action:

```text
Action completed
 ↓
Show concise confirmation
 ↓
Update relevant section
 ↓
Refresh dependent information
 ↓
Write audit record
```

Example:

> Device assigned successfully.

---

# 42. Audit Flow

Important operational actions create an audit event.

```text
User Action
 ↓
Validate Permission
 ↓
Perform Database Change
 ↓
Create Audit Event
 ↓
Return Success
 ↓
Refresh UI
```

Audit examples:

- User edited
- Device assigned
- Device replaced
- Device returned
- IP changed
- IP released
- IP Phone changed
- License renewed
- Support status changed
- Booking cancelled

---

# 43. Permission Decision Flow

Every protected action should follow:

```text
User requests action
 ↓
Identify authenticated user
 ↓
Identify role
 ↓
Check predefined access rule
 ↓
Allowed?
 ├── YES → Execute action
 └── NO  → Block action
```

The frontend should hide unauthorized actions, but the backend must also enforce authorization.

---

# 44. User Data Update Flow

```text
User opens Profile
 ↓
Edit allowed field
 ↓
Validate
 ↓
Save
 ↓
Backend authorization check
 ↓
Update database
 ↓
Audit
 ↓
Return updated profile
 ↓
Refresh UI
```

Organization-controlled fields must remain locked.

---

# 45. Cross-Module Relationship Flow

The User Details page acts as the central connection point.

```text
                         ┌── Device
                         ├── Printer
                         ├── IP
                         ├── IP Phone
User ──→ User Details ───┼── Applications
                         ├── License
                         ├── Warranty
                         ├── Device History
                         ├── Service History
                         └── IT Support History
```

This ensures the user record provides a complete operational picture.

---

# 46. Recommended User Details Page Actions

IT Admin should have a clear action area.

Recommended actions:

```text
Edit User
Assign / Replace Device
Assign / Change IP
Manage IP Phone
Manage Applications
Manage License
Add Printer / Manage Printer
Add Service Record
Create IT Issue
```

Actions should be contextual rather than permanently displayed as a large collection of buttons.

---

# 47. Mobile User Details Flow

Mobile User Details should become a vertically prioritized experience.

Recommended order:

```text
Identity
 ↓
Quick Actions
 ↓
Employment
 ↓
Account / License
 ↓
Current Device
 ↓
Printer
 ↓
IP / Extension
 ↓
Applications
 ↓
Warranty
 ↓
Support Summary
 ↓
Device History
 ↓
Service History
```

Sections may use expandable groups where appropriate.

---

# 48. Mobile IT Support Flow

```text
IT Support
 ↓
My Issues / Issue Queue
 ↓
Issue Details
 ↓
Status Timeline
 ↓
Relevant Actions
```

Create Issue should use a simple mobile-first form.

---

# 49. Mobile Booking Flow

```text
Bookings
 ↓
Meeting Room / Car
 ↓
Date
 ↓
Time
 ↓
Available Resources
 ↓
Select
 ↓
Confirm
```

The interface should clearly distinguish:

- Available
- Unavailable
- Already booked

---

# 50. End-to-End IT Administrator Journey

Typical daily workflow:

```text
Login
 ↓
IT Dashboard
 ↓
Review Needs Attention
 ↓
Open IT Issue
 ↓
Acknowledge
 ↓
Diagnose
 ↓
In Progress
 ↓
Resolve
 ↓
Resolution Duration Automatically Calculated
 ↓
Return Dashboard
 ↓
Review License Renewals
 ↓
Open User
 ↓
Review Employee 360
 ↓
Renew License
 ↓
Check Device / Warranty
 ↓
Review Support History
 ↓
Complete Operational Work
```

---

# 51. End-to-End General User Journey

```text
Login
 ↓
Personal Dashboard
 ↓
Review Profile / Device / Extension
 ↓
Need IT Help?
 ├── No → Continue normal use
 └── Yes
      ↓
   IT Support
      ↓
   Create Issue
      ↓
   Submit
      ↓
   Receive Notification
      ↓
   Track Status
      ↓
   Issue Resolved
```

---

# 52. End-to-End Booking Journey

```text
Login
 ↓
Bookings
 ↓
Choose Meeting Room / Car
 ↓
Select Date & Time
 ↓
Check Availability
 ↓
Available?
 ├── No → Choose another time/resource
 └── Yes
      ↓
   Confirm
      ↓
   Automatically Approved
      ↓
   Notification
```

---

# 53. End-to-End Device Lifecycle Journey

```text
Device
 ↓
Assigned to User A
 ↓
Service / Repair
 ↓
Returned
 ↓
Assigned to User B
 ↓
Service / Repair
 ↓
Returned
 ↓
Assigned to User C
```

The complete lifecycle remains permanently traceable.

---

# 54. End-to-End License Lifecycle

```text
License Active
 ↓
Renewal Approaching
 ↓
Notification
 ↓
Renewal Due
 ↓
IT Admin Renews
 ↓
Renewal History Created
 ↓
License Active Again
```

If not renewed:

```text
Renewal Due
 ↓
Expired
 ↓
Expired Notification
```

---

# 55. Final Screen Hierarchy

```text
ECI User Management
│
├── Authentication
│
├── Dashboard
│   ├── IT Operations Dashboard
│   ├── Management / IT Overview
│   ├── Admin Dashboard
│   └── Personal Dashboard
│
├── Users
│   ├── User List
│   └── User Details / Employee 360
│       ├── Identity
│       ├── Employment
│       ├── Account / License
│       ├── Machine
│       ├── Device
│       ├── Printer
│       ├── IP
│       ├── IP Phone
│       ├── Applications
│       ├── Warranty
│       ├── Device History
│       ├── Service History
│       └── IT Support History
│
├── Bookings
│   ├── Meeting Rooms
│   └── Cars
│
├── IP Phone Directory
│
├── IT Support
│   ├── Issue Queue
│   ├── My Issues
│   └── Issue Details
│
├── Renewals
│   ├── Upcoming
│   ├── Due
│   ├── Expired
│   └── Renewed
│
├── Notifications
│
└── Settings
    ├── My Profile
    ├── Password
    ├── Notification Preferences
    └── System Configuration
```

---

# 56. Phase 2 Final Decisions

The following decisions are locked for the current App Flow:

1. Login routes users to role-specific dashboards.
2. Main navigation includes Dashboard, Users, Bookings, IP Phone Directory, IT Support, Renewals, Notifications and Settings.
3. Device, IP, Applications, Warranty and Service are not separate main navigation items.
4. Printer information is also managed from User Details.
5. User Details is the central IT management hub.
6. User List rows are fully clickable.
7. User Details contains complete IT support history for that user.
8. IT Admin can create an IT issue directly from User Details.
9. Supervisor/manager administrative update history is not exposed to the employee.
10. User ID, official email and organization-controlled fields are locked for General Users.
11. IT Support follows Submitted → Acknowledged → In Progress → Waiting/On Hold → Resolved → Closed.
12. Resolution duration is automatically calculated from timestamps.
13. General Users do not see internal resolution-performance information.
14. Meeting Room and Car bookings are automatically approved when available.
15. Authorized Admin users can Cancel, Pause/Hold or Deny bookings.
16. Notifications exist both as a top-right dropdown and a full Notifications page.
17. Settings does not contain Role & Permission management.
18. Access is based on predefined product roles and explicit business rules.
19. Physical device history persists across all assignments.
20. Attendance is not part of the application.

---

# 57. Next Phase

**PHASE 2 is complete.**

The next phase is:

> **PHASE 3 — TECH STACK**

Before creating Phase 3, the following will be confirmed:

- Frontend architecture
- Backend architecture
- Database platform
- Authentication
- Authorization model
- Realtime requirements
- File/attachment storage
- Notification architecture
- Hosting/deployment
- PWA architecture
- API/data access strategy
- Security approach
- Audit architecture
- Recommended libraries
- Environment configuration
- Development structure

**Do not implement technology decisions before Phase 3 is approved.**
