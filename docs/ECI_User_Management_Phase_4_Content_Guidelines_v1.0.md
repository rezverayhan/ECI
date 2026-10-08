# ECI User Management — Phase 4: Content Guidelines
## Content, Terminology & Microcopy Standard v1.0

> This document defines the language, terminology, labels, statuses, messages and content behavior for ECI User Management.
>
> **Primary language:** English  
> **Locale:** Dhaka, Bangladesh  
> **Time format:** 12-hour  
> **Tone:** Professional, concise, calm and human.

---

# 1. Content Philosophy

ECI User Management is an internal enterprise application.

Its content should feel:

- Professional
- Clear
- Calm
- Direct
- Human
- Precise
- Helpful
- Consistent

The application should never sound:

- Robotic
- Aggressive
- Overly technical
- Promotional
- Casual in an unprofessional way
- Dramatic
- Overly verbose

---

# 2. Primary Language

The application UI language is:

> **English**

All system UI content should be written in English.

Examples:

- Dashboard
- Users
- User Details
- Bookings
- IT Support
- Renewals
- Notifications
- Settings

---

# 3. User-Generated Content

Employees may enter free-text information in:

- IT Support descriptions
- Issue notes where permitted
- Booking notes
- Device notes
- Service history notes

Users may write in English or Bangla where the field is intended for free-form input.

The application should not automatically translate or alter user-entered content.

---

# 4. Tone of Voice

The product voice is:

> **Professional + concise + calm + human**

### Good

> Unable to assign this IP address.

> This IP address is already assigned.

> Please choose another available IP address.

### Avoid

> Operation Failed!!!

> Something went terribly wrong!!!

> Oops! We couldn't do that!

---

# 5. Content Hierarchy

Use content in this order:

```text
What happened
↓
Why it happened, when useful
↓
What the user can do next
```

Example:

> **Unable to assign this IP address.**  
> This IP address is already assigned.  
> Please choose another available IP address.

---

# 6. Button Naming Standard

Buttons should use clear action verbs.

## User

- Add User
- Edit User
- Save Changes
- Cancel
- View Details

## Device

- Assign Device
- Replace Device
- Return Device
- Add Service Record

## Printer

- Assign Printer
- Replace Printer
- Edit Printer

## IP

- Assign IP
- Change IP
- Release IP

## IP Phone

- Assign Extension
- Change Extension
- Release Extension

## Application

- Add Application
- Edit Application
- Remove Application

## License

- Renew License
- View Renewal History

## IT Support

- Create Issue
- Submit Issue
- Acknowledge Issue
- Start Work
- Put On Hold
- Resolve Issue
- Close Issue

## Booking

- Book Room
- Book Car
- Cancel Booking
- Pause Booking
- Deny Booking
- Confirm Booking

Avoid vague buttons such as:

- Click Here
- Go
- Do It
- Manage
- Process
- Submit

unless the exact action is genuinely obvious from context.

---

# 7. Status Terminology

Status names must remain consistent throughout the application.

## IT Support

```text
Submitted
Acknowledged
In Progress
Waiting / On Hold
Resolved
Closed
```

Never use different variations such as:

- Processing
- Working
- Done
- Finished

when referring to the same lifecycle states.

---

# 8. IT Support Priority

Use:

```text
Low
Medium
High
Urgent
```

Definitions:

### Low

Minor issue with limited impact.

### Medium

Normal issue affecting the user's work but with a practical workaround.

### High

Significant issue affecting important work.

### Urgent

Critical issue requiring immediate IT attention.

---

# 9. User Status

Primary user status:

```text
Active
Inactive
Resigned
```

### Active

Employee is currently active.

### Inactive

User account/employee record is temporarily inactive according to organizational status.

### Resigned

Employee has left the organization.

A resigned user should normally remain in the system for historical records rather than being deleted.

---

# 10. Device Status

Use:

```text
Assigned
Available
Under Service
Returned
Retired
```

### Assigned

Currently assigned to a user.

### Available

Device is available for assignment.

### Under Service

Device is undergoing repair, maintenance or diagnostic work.

### Returned

Device has been returned and is not currently assigned.

### Retired

Device is permanently removed from active operational use.

---

# 11. License Status

Current license status:

```text
Active
Upcoming
Due
Expired
```

`Renewed` should primarily represent a renewal event/history rather than a permanent current state.

Example:

```text
Current Status: Active
Last Renewal: 8 October 2026
Next Renewal: 8 October 2027
```

Renewal history may contain:

```text
Renewed
```

---

# 12. Booking Status

Use:

```text
Confirmed
Pending
Paused
Cancelled
Denied
Completed
```

Normal user bookings are automatically confirmed when the requested resource is available.

`Pending` may exist for controlled/system scenarios but should not create unnecessary approval steps.

---

# 13. Booking Action Terminology

Authorized Admin users may:

- Cancel Booking
- Pause Booking
- Deny Booking

When a booking is denied or cancelled, the system should provide a reason field where appropriate.

Example:

> **Booking cancelled**  
> Reason: Vehicle unavailable due to maintenance.

---

# 14. Navigation Labels

Use these exact primary labels:

```text
Dashboard
Users
Bookings
IP Phone Directory
IT Support
Renewals
Notifications
Settings
```

Bookings:

```text
Meeting Rooms
Cars
```

---

# 15. User Details Section Naming

Use these exact section names:

```text
Profile
Employment
Account & License
Machine
Current Device
Printer
Network
IP Phone
Applications & Software
Warranty
Device History
Service History
IT Support History
```

Do not randomly rename these sections.

---

# 16. User Details Terminology

Use:

> User Details

for the page title.

Use:

> Employee 360

when describing the overall information concept internally/product-wise.

Do not replace the primary UI page name with:

- Employee Profile
- Staff Profile
- Employee Record

unless a future product decision explicitly changes it.

---

# 17. Employee vs User Terminology

Use terminology based on context.

### User

Use when discussing:

- Application account
- User ID
- User access
- General application behavior

### Employee

Use when discussing:

- Employment
- Department
- Designation
- Manager
- Join date
- Resignation

### IT User

Use when necessary to describe the person from an IT management perspective.

Do not randomly alternate between:

- Employee
- Staff
- Member
- Person
- Worker

for the same concept.

---

# 18. Supervisor / Manager Terminology

Use:

> Manager

as the primary UI field label unless the organization's approved terminology requires `Supervisor`.

The internal concept should remain consistent.

If the manager is changed:

- Update the current manager record.
- Do not expose internal manager-change history to the General User.

---

# 19. Date Format

The organization is in Dhaka, Bangladesh.

UI date format:

```text
8 October 2026
```

Avoid:

```text
10/08/2026
```

because it is ambiguous.

Use full month names for important dates.

---

# 20. Time Format

Use a 12-hour clock.

Example:

```text
10:30 AM
2:15 PM
9:00 PM
```

Always include AM/PM.

Do not use:

```text
10:30
14:15
21:00
```

in normal user-facing UI.

---

# 21. Time Zone

Application display timezone:

> **Asia/Dhaka**

The UI should display times according to Bangladesh local time.

Backend timestamps should remain stored in a reliable timezone-aware format, preferably UTC, and converted to Dhaka time for presentation.

---

# 22. Date & Time Examples

Correct:

> 8 October 2026, 10:30 AM

Correct:

> Last updated 8 October 2026 at 10:30 AM

Correct:

> Renewal due 15 October 2026

---

# 23. Empty State Standard

Never use only:

> No data found.

Use a meaningful empty state.

Structure:

```text
Title
Explanation
Action
```

Example:

> **No device assigned**  
> This user currently has no device assigned.  
> **Assign Device**

---

# 24. Empty State Examples

### Printer

> **No printer assigned**  
> This user currently has no printer assigned.  
> **Assign Printer**

### Applications

> **No applications recorded**  
> No applications or software have been recorded for this user.  
> **Add Application**

### Service History

> **No service history**  
> No service records have been recorded for this device.

### IT Support

> **No IT support issues**  
> This user has not submitted any IT support issues.

### Notifications

> **You're all caught up**  
> There are no new notifications.

---

# 25. Error Message Standard

Every error should answer:

1. What happened?
2. Why?
3. What can the user do?

Example:

> **Unable to assign this IP address.**  
> This IP address has already been assigned.  
> Please choose another available IP address.

---

# 26. Network Error

Use:

> **Connection lost**  
> Your changes have not been submitted. Please reconnect and try again.

Do not falsely show success if the server has not confirmed the operation.

---

# 27. Permission Error

Use:

> **Access restricted**  
> You do not have permission to perform this action.

Do not expose internal authorization rules.

---

# 28. Not Found Error

Use:

> **Record not found**  
> This record may have been removed or you may no longer have access to it.

---

# 29. Validation Errors

Validation should identify the exact problem.

Bad:

> Invalid form.

Good:

> Enter a valid email address.

Good:

> Select a device before assigning it.

Good:

> Renewal date cannot be earlier than the current license start date.

---

# 30. Success Messages

Success messages should be short.

Examples:

> User updated successfully.

> Device assigned successfully.

> Device replaced successfully.

> Device returned successfully.

> Printer assigned successfully.

> IP address assigned successfully.

> IP address changed successfully.

> Extension updated successfully.

> License renewed successfully.

> Issue submitted successfully.

> Issue resolved successfully.

> Booking confirmed.

> Booking cancelled successfully.

> Booking paused successfully.

> Booking denied successfully.

> Password reset successfully.

---

# 31. Confirmation Dialog Standard

Confirmation dialogs should be clear and specific.

Example:

> **Replace this device?**  
> The current device assignment will be closed and the new device will be assigned to this user. Device history will be preserved.

Buttons:

```text
Cancel
Replace Device
```

Avoid generic:

```text
Are you sure?
Yes
No
```

---

# 32. Destructive Actions

Use stronger confirmation for:

- Delete
- Release IP
- Remove application
- Cancel booking
- Deny booking
- Retire device
- Password reset where applicable

The dialog should explain the consequence.

---

# 33. Delete Policy

Normal operational records should NOT be hard deleted.

Prefer:

```text
Deactivate
Archive
Retire
Cancel
```

This protects historical information.

However, a controlled **Delete** option should exist for genuinely incorrect records, such as:

> A user was accidentally created with incorrect information.

## Delete Rules

Delete must be:

- Restricted to authorized users.
- Clearly labeled.
- Confirmed.
- Audited where possible.
- Protected from accidental clicks.

Example:

> **Delete this user record?**  
> This record was created incorrectly and will be permanently removed. This action cannot be undone.

The application should prevent deletion when the record has dependent historical information unless an approved safe deletion strategy exists.

Historical operational records should generally be preserved.

---

# 34. Wrong User / Duplicate Record Handling

If an incorrect user record is created:

Preferred sequence:

```text
Identify incorrect record
 ↓
Check dependencies
 ↓
If safe → Delete
 ↓
If historical dependencies exist → Deactivate / Archive
 ↓
Audit action
```

Do not silently delete connected historical data.

---

# 35. Loading Content

Use clear loading text when necessary.

Examples:

> Loading user details...

> Loading support history...

> Checking availability...

> Saving changes...

> Assigning device...

> Renewing license...

Avoid:

> Please wait...

when a more specific message is possible.

---

# 36. Button Loading States

During a mutation:

```text
Save Changes
     ↓
Saving...
```

```text
Assign Device
     ↓
Assigning...
```

```text
Renew License
     ↓
Renewing...
```

The action button should be temporarily disabled to prevent duplicate submissions.

---

# 37. Notifications Content

Notification titles should be concise.

Examples:

> New IT issue submitted

> IT issue status updated

> IT issue resolved

> License renewal due soon

> License expired

> Device warranty expiring soon

> Booking confirmed

> Booking cancelled

Notification body may provide one short contextual sentence.

---

# 38. IT Support Notification Examples

### IT Admin

> **New IT issue submitted**  
> LAN not working — submitted by [User Name].

### Employee

> **Issue status updated**  
> Your IT support issue is now In Progress.

### Employee

> **Issue resolved**  
> Your IT support issue has been resolved.

---

# 39. Renewal Notification Examples

> **License renewal due soon**  
> [User Name]'s account license is due for renewal on 15 October 2026.

> **License expired**  
> [User Name]'s account license has expired.

---

# 40. Warranty Notification Examples

> **Device warranty expiring soon**  
> The warranty for [Device/Asset ID] expires on 20 October 2026.

---

# 41. Booking Notification Examples

> **Booking confirmed**  
> Meeting Room A is booked for 8 October 2026 at 10:30 AM.

> **Booking cancelled**  
> Your car booking for 8 October 2026 has been cancelled.

> **Booking paused**  
> Your booking has been placed on hold.

> **Booking denied**  
> Your booking request has been denied.

---

# 42. IT Support Internal vs User-Facing Content

Internal IT content may contain:

- Diagnosis
- Internal notes
- Resolution details
- Resolution duration
- Internal operational comments

These must not automatically appear in the General User interface.

User-facing content should remain concise and relevant.

---

# 43. Resolution Duration Content

IT Admin:

> Resolution time: 2 hours 18 minutes

General User:

> Resolved on 8 October 2026 at 2:30 PM

The user should see the outcome, not internal performance metrics.

---

# 44. Search Placeholder Standard

Examples:

Users:

> Search by name, employee ID, email or asset ID...

IT Support:

> Search issues by title, user or issue ID...

Renewals:

> Search by user, employee ID or license...

IP Phone:

> Search by name, department or extension...

Avoid generic:

> Search...

where contextual guidance is useful.

---

# 45. Table Content

Tables should prioritize:

- Name
- Status
- Date
- Key identifier
- Relevant action

Avoid overcrowding.

Long text should be truncated with access to the complete value.

---

# 46. Number Formatting

Use readable numbers.

Examples:

```text
1,000
10,500
100,000
```

Do not display unnecessary decimal places.

For durations:

```text
2 hours 18 minutes
```

rather than:

```text
2.30 hours
```

---

# 47. Currency

If device/service costs are displayed, use the organization's currency:

> BDT

Examples:

```text
BDT 25,000
BDT 1,500
```

Avoid ambiguous currency symbols when the context could be unclear.

---

# 48. Technical Terminology

Use technical terms where they help IT users.

Approved:

- IP Address
- IP Phone
- Extension
- Machine Name
- Asset ID
- Serial Number
- Warranty
- License
- Device
- Service History

Avoid unnecessary technical jargon in General User workflows.

---

# 49. User-Facing Technical Explanations

When a technical issue is displayed to General Users, keep the language understandable.

Instead of:

> DHCP lease conflict detected.

Prefer:

> The IP address could not be assigned because it is currently in use.

---

# 50. Content Consistency Rule

The same concept must always use the same name.

For example:

```text
IT Support
```

must not become:

```text
Help Desk
IT Help
Technical Support
Support Center
```

unless the product terminology is intentionally changed.

Similarly:

```text
User Details
Current Device
Service History
Renewals
IP Phone Directory
```

must remain consistent.

---

# 51. Prohibited Content Patterns

Avoid:

- Excessive exclamation marks
- ALL CAPS messages
- Emoji in core enterprise UI
- Jokes in error messages
- Sarcasm
- Blame-oriented language
- Technical jargon without need
- Vague errors
- Generic confirmation messages
- Long paragraphs inside dialogs
- Inconsistent terminology

---

# 52. Confirmation Language

Use neutral language.

Good:

> Are you sure you want to release this IP address?

Better when consequence matters:

> **Release this IP address?**  
> The IP address will become available for reassignment.

Buttons:

```text
Cancel
Release IP
```

---

# 53. Unsaved Changes

If a user attempts to leave a form with unsaved changes:

> **Unsaved changes**  
> You have unsaved changes. Do you want to leave without saving?

Buttons:

```text
Stay
Leave Without Saving
```

---

# 54. Permission-Aware Content

Do not show irrelevant disabled controls to users who will never have access.

Prefer:

```text
General User
→ View current device
```

instead of showing:

```text
Replace Device
```

as permanently disabled.

For role-restricted sections that users should know exist, a read-only presentation may be appropriate.

---

# 55. Read-Only General Manager Content

General Manager sees IT Support records in a clearly read-only state.

Example:

> **View only**  
> You can review this IT support issue but cannot change its status.

This should be used where clarification is needed, not repeated throughout every screen.

---

# 56. Admin Booking Actions

For authorized Admin users:

```text
Cancel Booking
Pause Booking
Deny Booking
```

Use confirmation before applying the action.

If a reason is required:

> Reason for cancellation

> Reason for denial

> Reason for pause

---

# 57. Password Management Content

User-facing:

> **Password reset**  
> Contact IT if you cannot access your account.

IT-facing:

> **Reset User Password**

After action:

> Password reset successfully.

Do not display passwords in the normal user record.

If a temporary password generation workflow is implemented, it must use a secure one-time/controlled mechanism rather than storing the password in the user profile.

---

# 58. Profile Content

Use:

```text
My Profile
```

for the General User's personal profile area.

Use:

```text
User Details
```

for the IT Administrator's full Employee 360 record.

---

# 59. Dashboard Content

Dashboard headings should answer an operational question.

IT:

> Needs Attention

General User:

> My Overview

Management:

> IT Overview

Avoid generic headings such as:

> Analytics

when the section is actually operational.

---

# 60. Final Content Standards

ECI User Management content must always be:

1. English-first.
2. Professional.
3. Concise.
4. Calm.
5. Human.
6. Consistent.
7. Action-oriented.
8. Specific about errors.
9. Clear about consequences.
10. Appropriate to the user's role.
11. Localized to Dhaka, Bangladesh.
12. Presented using a 12-hour clock.
13. Using full month names for important dates.
14. Using predefined product terminology.
15. Protective of internal IT information.

---

# 61. Final Approved Terminology

```text
Dashboard
Users
User Details
Employee 360
Bookings
Meeting Rooms
Cars
IP Phone Directory
IT Support
Renewals
Notifications
Settings

Profile
Employment
Account & License
Machine
Current Device
Printer
Network
IP Phone
Applications & Software
Warranty
Device History
Service History
IT Support History

Active
Inactive
Resigned

Assigned
Available
Under Service
Returned
Retired

Submitted
Acknowledged
In Progress
Waiting / On Hold
Resolved
Closed

Low
Medium
High
Urgent

Confirmed
Pending
Paused
Cancelled
Denied
Completed

Upcoming
Due
Expired
Renewed
```

---

# 62. Final Phase 4 Decision

**PHASE 4 — CONTENT GUIDELINES is complete.**

The content system is now defined for the product.

Important decisions:

- UI language is English.
- Free-form employee input may contain English or Bangla.
- Tone is professional, concise, calm and human.
- UI terminology is standardized.
- User status includes Active, Inactive and Resigned.
- Date format uses full month names.
- Time uses Bangladesh local time and a 12-hour clock.
- Empty/error/success states have defined patterns.
- Normal hard deletion is avoided.
- Controlled deletion exists for genuinely incorrect records.
- Historical data should remain protected.
- Role-specific content is enforced.
- No Role & Permission management UI is included.

---

# 63. Next Phase

The next phase is:

> **PHASE 5 — BACKEND SCHEMA**

Phase 5 will define:

- Complete PostgreSQL data model
- Tables
- Columns
- Data types
- Primary keys
- Foreign keys
- Relationships
- Enums
- User structure
- Device structure
- Printer structure
- IP structure
- IP Phone structure
- Applications
- License and renewal history
- IT Support
- Bookings
- Notifications
- Audit logs
- Device assignment history
- Device service history
- Indexes
- RLS architecture
- Data integrity rules
- Soft-delete / deletion strategy
- Database functions / triggers where appropriate

The backend schema will be designed directly from the approved PRD, App Flow, Tech Stack and Content Guidelines.
