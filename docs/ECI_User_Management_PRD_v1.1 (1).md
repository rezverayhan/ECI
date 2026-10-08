# ECI User Management — Product Requirements Document (PRD) v1.1

## 1. Product Overview

**Product Name:** ECI User Management

ECI User Management is a centralized internal IT and user information management system designed around one core principle:

> **One User → One Complete IT Record**

The application is primarily an IT information and lifecycle management system, not a generic control system.

The **User Details / Employee 360 page is the Management Hub** where IT administrators can view and manage the complete IT-related record of a user.

---

## 2. Product Goals

The system should:

- Centralize employee/user IT information.
- Make complete user information quickly searchable.
- Maintain device, IP, IP Phone, software, license, warranty and support information.
- Preserve physical device history across multiple users.
- Track annual user-account license renewals.
- Digitize IT support requests.
- Track issue status and IT-side resolution duration.
- Provide operational dashboards and notifications.
- Reduce dependency on Excel/manual records.
- Provide responsive desktop and mobile experiences.
- Provide secure role-based access and audit history.

---

## 3. Core Product Principle

### User-Centric IT Management

The application should NOT require IT to first create a device in a separate Device Management module and then assign it to a user.

Instead:

**Users → User Details → IT Resources**

From a user's User Details page, IT Admin manages:

- User information
- Machine identity
- Physical device
- Device assignment
- Device warranty
- Device history
- Device service history
- IP address
- IP Phone / extension
- Applications / software
- User account
- Annual license renewal
- IT support history

---

## 4. User Roles

### 4.1 System / IT Administrator

Primary operational user.

Can:

- Create, edit, search and filter users.
- View complete Employee 360 information.
- Manage devices from User Details.
- Assign, replace and return devices.
- Manage device purchase and warranty information.
- View device assignment history.
- View and manage service/repair history.
- Assign and change IP addresses.
- Manage IP Phone assignments.
- Manage application/software information.
- Manage user account/license information.
- Track and renew annual user-account licenses.
- Manage IT support issues.
- View operational dashboard.
- Receive system notifications.
- View audit/history.
- Manage relevant booking information.
- Access reports/analytics where applicable.

### 4.2 General Manager

Can:

- View all IT support issues.
- View issue status and relevant issue information.
- Receive relevant notifications.

Cannot:

- Change issue status.
- Assign issues.
- Resolve issues.
- Perform IT operational actions.

### 4.3 Admin

Admin permissions are business-scope dependent and should be configurable according to approved organizational requirements.

IT operational actions remain under the IT Administrator scope unless explicitly granted.

### 4.4 General Employee / General User

Can:

- View their own profile.
- Update allowed personal/profile fields.
- View their current IT information.
- View their current device.
- View their IP/extension information where appropriate.
- View organization-wide IP Phone directory.
- Book Meeting Rooms.
- Book Cars.
- Submit IT Support issues.
- View their own submitted issues and status.
- Receive notifications.

Cannot:

- Change User ID.
- Change official organization-controlled email.
- Change organization-controlled IT information.
- Edit IP Phone information.
- Edit device information.
- View other employees' private IT records.
- View internal IT resolution-performance information.
- Access Attendance.

---

# 5. User Profile

## 5.1 Basic Information

User record may contain:

- Profile photo
- Full name
- Employee ID
- User ID
- Designation
- Department
- Manager
- Email
- Phone
- Employment status
- Join date

## 5.2 Profile Editing

General Users may update allowed profile fields.

The following are organization-controlled:

- User ID
- Official organization email
- Organization-controlled employment information
- IT-assigned resources

---

# 6. User Details / Employee 360

The User Details page is the primary management hub.

### Recommended information hierarchy

1. Identity
2. Employment information
3. Account / license
4. Machine identity
5. Current physical device
6. Network / IP
7. IP Phone / extension
8. Applications / software
9. Warranty
10. Device assignment history
11. Device service history
12. IT support history

The page should feel like an **Employee 360 / IT Profile**, not a generic form.

---

# 7. Machine Identity

Machine identity and physical device identity are separate concepts.

Possible fields:

- Machine name
- Operating system
- Machine status
- Last known information

Changing or replacing a physical device must NOT automatically change the machine name or IP.

Any such change requires an explicit authorized action.

---

# 8. Physical Device Management

Physical device information is managed from User Details.

## 8.1 Current Device

Fields may include:

- Device type
- Brand
- Model
- Serial number
- Asset ID
- Purchase date
- Purchased by
- Purchase price (if required)
- Warranty duration
- Warranty start date
- Warranty end date
- Warranty status
- Current assignment date

## 8.2 Device Assignment

IT Admin can:

- Assign device
- Replace device
- Return device
- Record assignment date
- Record return date
- Record reason
- Add notes

## 8.3 Device History

Physical device history must persist permanently.

Example:

**User A → User B → User C**

The device's complete assignment history must remain available.

Historical records must not disappear when the device is reassigned.

## 8.4 Device Service History

Each physical device keeps its own service history.

Fields:

- Service date
- Service type
- Problem
- Description
- Provider
- Service center
- Technician
- Warranty covered
- Cost
- Status
- Resolution
- Completed date
- Notes

Service types may include:

- Repair
- Maintenance
- Diagnostic
- Upgrade
- Other

Possible service statuses:

- Open
- In Progress
- Completed
- Cancelled

---

# 9. IP Address Management

IP management is user-centric but must also provide global visibility to IT Admin.

IT Admin should be able to see:

- Free
- Assigned
- Reserved / Booked (if used)
- Unavailable

The assigned IP should be connected to the appropriate user record.

IP assignment/change/release must be auditable.

General Users cannot edit IP information.

---

# 10. IP Phone / Extension

The application includes an organization-wide IP Phone directory.

### General Users

Can:

- View the IP Phone directory.
- Search/view extensions.

Cannot:

- Edit IP Phone information.

### IT Administrator

Can manage assigned IP Phone information from User Details.

The IP Phone module should focus on:

- Department
- Employee
- Extension
- Status

IP addresses should not be exposed in the general IP Phone directory unless specifically required by IT.

---

# 11. Applications / Software

Application/software information is managed from User Details rather than as a separate primary management workflow.

Possible fields:

- Application name
- Version
- License type
- License status
- Assigned date
- Renewal date
- Notes

This section can later be expanded according to actual business requirements.

---

# 12. User Account & Annual License Renewal

Annual renewal refers to the **user account license**.

The system must:

- Store license status.
- Store renewal date.
- Track previous renewal history.
- Show upcoming renewals.
- Show due renewals.
- Show expired licenses.
- Allow IT Admin to record renewal completion.
- Maintain renewal history.

The dashboard should surface:

- Upcoming renewal
- Due renewal
- Expired license
- Recently renewed licenses

---

# 13. IT Support System

The current process of reporting IT problems by phone or in person should be digitized.

### Target workflow

**Employee submits issue → IT Admin receives issue → IT takes action → Issue resolved → System records resolution**

Examples:

- LAN not working
- Laptop problem
- Internet issue
- IP problem
- Software problem
- Other IT issue

## 13.1 Issue Fields

- Issue ID
- Title
- Category
- Description
- Priority
- Attachment
- Submitted by
- Submission timestamp
- Status
- Assigned IT person
- Resolution
- Resolved timestamp
- Resolution duration
- Internal notes

## 13.2 Categories

Suggested categories:

- Laptop / Computer
- Network / LAN
- Internet
- IP Address
- IP Phone
- Software
- Access
- Hardware
- Printer / Peripheral
- Other

## 13.3 Issue Lifecycle

Recommended lifecycle:

**Submitted → Acknowledged → In Progress → Waiting / On Hold → Resolved → Closed**

## 13.4 Visibility

### General User

Can see:

- Own submitted issues
- Issue status
- Whether issue is resolved

Cannot see:

- Internal IT notes
- Internal resolution-performance details
- Resolution duration

### IT Administrator

Can:

- View all issues.
- Assign issues.
- Change status.
- Add internal notes.
- Resolve/close issues.
- View resolution duration.
- Monitor IT performance.

### General Manager

Can:

- View all IT issues.
- View relevant issue information.
- View issue status.

Cannot:

- Take action.
- Change status.
- Assign.
- Resolve.

Resolution-performance information should remain IT-side unless explicitly approved otherwise.

---

# 14. Meeting Room Booking

Meeting Room booking is available to all appropriate users.

Rules:

- No approval workflow.
- If the room is free at the requested time, booking is automatically approved.
- If unavailable, booking is blocked.
- The system must prevent booking conflicts.
- Users should be able to see room availability.

---

# 15. Car Booking

Car booking follows the same operational principle.

Rules:

- No approval workflow.
- If a car is available at the requested time, booking is automatically approved.
- If unavailable, booking is blocked.
- The system must prevent conflicts.
- Users should be able to see car availability.

---

# 16. Notifications

Notifications are mandatory.

## Employee Notifications

- Issue submitted
- Issue status changed
- Issue resolved
- Booking confirmed
- System notifications

## IT Administrator Notifications

- New IT issue
- Renewal approaching
- Renewal due
- License expired
- Warranty approaching
- Important system activity

## General Manager Notifications

- Relevant IT issue notifications
- Relevant status notifications

Notifications should be stored and tracked by the system.

---

# 17. Dashboard

## 17.1 IT Administrator Dashboard

The dashboard is an operational command center.

It should answer:

> **What needs my attention now?**

It should surface:

- Total users
- Active / inactive users
- Upcoming license renewals
- Due renewals
- Expired licenses
- New IT issues
- In-progress IT issues
- Waiting issues
- Resolved issues
- Device/warranty attention
- IP/network attention
- Recent activity

The dashboard should prioritize operational clarity rather than decorative KPI cards.

## 17.2 General User Dashboard

Should be simpler and personal.

Possible content:

- Profile summary
- Current device
- IP / extension
- License / renewal information where appropriate
- My support issues
- My bookings
- Notifications

---

# 18. Search

IT Administrator can search by:

- Name
- Employee ID
- User ID
- Email
- Phone
- IP
- Extension
- Machine name
- Device asset ID

Search should provide fast, reliable retrieval of user records.

---

# 19. Filters

## Users

- Department
- Designation
- Status
- Manager
- Device status
- IP status
- License renewal status

## IT Support

- Status
- Priority
- Category
- User
- Date

## Renewal

- Upcoming
- Due
- Expired
- Renewed

---

# 20. Audit & History

The system must preserve operational history.

Track events such as:

- User update
- Device assignment
- Device return
- Device replacement
- Device service
- IP assignment
- IP change
- IP release
- IP Phone change
- License renewal
- License status change
- Support issue status change

History should not normally be deleted.

---

# 21. Privacy & Access Control

Access must be based on role, ownership and responsibility.

### General User

- Own profile
- Own IT information
- Own support issues
- Organization IP Phone directory
- Own bookings

### General Manager

- All IT support issues, view-only

### IT Administrator

- Full IT operational information and actions

### Admin

- Access according to approved business permissions

Sensitive IT information and internal operational notes must remain protected.

---

# 22. Attendance

**Attendance is explicitly excluded from the current product scope.**

Do not include:

- Attendance module
- Attendance dashboard
- Attendance device integration
- Attendance records
- Attendance analytics

---

# 23. Mobile & Responsive Requirements

The product must be fully responsive.

Mobile should be designed intentionally rather than simply shrinking desktop screens.

Requirements:

- Touch-friendly controls
- Minimum approximately 44px touch targets
- Clear mobile navigation
- Responsive tables with appropriate mobile transformation
- Accessible forms
- Readable information hierarchy
- Mobile-friendly User Details
- Mobile-friendly booking
- Mobile-friendly support issue submission

---

# 24. UX / UI Direction

The product should follow a **Quiet Premium Enterprise** visual direction.

### Design characteristics

- Calm
- Precise
- Professional
- Human
- Sophisticated
- Timeless
- Minimal but not empty
- Strong hierarchy
- Excellent spacing
- Comfortable typography

### Avoid

- Generic SaaS dashboard look
- Dribbble-style concept UI
- Excessive cards
- Decorative gradients
- Neon colors
- Excessive glassmorphism
- Giant KPI tiles
- Excessive pills
- Huge shadows
- Excessive animation
- Decorative UI without purpose

### Typography

Primary font:

**Plus Jakarta Sans**

Use one consistent font family throughout the product.

### Color Direction

- Canvas: `#F7F7F5`
- Surface: `#FFFFFF`
- Primary text: `#20242B`
- Secondary text: `#697386`
- Muted text: `#98A1AE`
- Primary blue: `#315EFB`
- Soft blue: `#EEF2FF`
- Success: `#27835A`
- Warning: `#B7791F`
- Error: `#C2413B`
- Border: `#E8E9E7`

### Layout

- 8px spacing system
- Desktop page padding: approximately 36–40px
- Section spacing: approximately 32px
- Panel padding: approximately 24px
- Mobile padding: approximately 16px
- Desktop: 12-column grid
- Desktop artboard reference: 1440px
- Left navigation reference: approximately 224px
- Content max width: approximately 1200–1240px

---

# 25. Dashboard UX Composition

The dashboard should not become a matrix of cards.

Recommended composition:

1. Header
2. One coherent operational summary
3. Primary workspace (~68%)
4. Needs attention area (~32%)
5. Recent activity

The operational summary should feel like one connected surface rather than four oversized KPI cards.

---

# 26. User Details UX Composition

The User Details page should feel like an Employee 360 profile.

Recommended structure:

- Main content: approximately 68%
- Contextual rail: approximately 32%

Use information matrices and grouped sections instead of a card for every individual field.

Hierarchy:

**Identity → Employment → Account → Machine → Device → Network → Phone → Software → Warranty → History → Support**

---

# 27. Motion

Motion must be subtle and purposeful.

Recommended:

- 150–180ms
- Ease-out
- Small transitions
- Clear feedback

Avoid:

- Excessive animations
- Constant motion
- Decorative animations
- Slow transitions that reduce productivity

---

# 28. Accessibility

The product should support:

- Sufficient color contrast
- Keyboard navigation
- Visible focus states
- Approximately 44px touch targets
- Clear labels
- Accessible form controls
- No color-only communication
- Readable typography

---

# 29. MVP Scope

The MVP must include:

- Authentication
- Role-based access
- User directory
- User Details / Employee 360
- Profile management
- IT asset information
- Device assignment
- Device history
- Device service history
- IP management
- IP Phone directory
- Application/software information
- Annual user-account license renewal
- IT Support
- Notifications
- Dashboard
- Search
- Filters
- Audit/history
- Meeting Room Booking
- Car Booking
- Responsive mobile experience

---

# 30. Explicitly Out of Scope / Future

Not included in the current MVP:

- Remote device control
- Network automation
- AI assistant
- Predictive analytics
- Attendance
- HR payroll
- Salary management
- Leave management
- External integrations without a real business requirement

---

# 31. Success Metrics / KPIs

Suggested targets:

- User information retrieval within 10 seconds.
- First-attempt user search success ≥95%.
- IT issue submission within 2 minutes.
- ≥95% resolved issues have resolution timestamps.
- ≥95% required user data completeness.
- 100% of active users with applicable licenses have renewal information.
- Significant reduction in manual Excel dependency.
- Increasing percentage of IT issues submitted through the application.
- 100% physical device lifecycle traceability.
- Strong user adoption.

---

# 32. Product Success Definition

ECI User Management will be successful when IT can answer questions such as:

- Who is this employee?
- What device are they using?
- What is the device's history?
- What is their machine name?
- What IP address is assigned?
- What is their extension?
- What applications/software do they have?
- Is their account license valid?
- When is the license renewal due?
- Is the device under warranty?
- What repairs has the device had?
- What IT issues has the user submitted?
- What is currently waiting for IT attention?

All of this should be available from a connected, reliable system centered around the user.

---

# 33. Source of Truth

This PRD is the current product-level source of truth.

Important decisions:

1. User Details is the primary management hub.
2. No separate Device Management workflow is required for normal user/device management.
3. Physical device history must persist across reassignment.
4. Annual renewal refers to the user account license.
5. Attendance is excluded.
6. General Manager can view all IT issues but cannot take action.
7. General Users can submit and track their own IT issues.
8. Meeting Room and Car bookings are automatically approved when availability exists.
9. IP Phone directory is visible to users but editable only by IT.
10. Application/software information belongs inside User Details.
