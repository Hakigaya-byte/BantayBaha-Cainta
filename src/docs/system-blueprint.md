# BantayBaha Cainta - System Blueprint

## 1. System Goal

BantayBaha Cainta is a web-based flood reporting and disaster preparedness website for Cainta DRRMO.

Residents can submit flood incident reports and check the status of their own reports. Authorized DRRMO staff can review, verify, update, and monitor flood reports. The website also provides preparedness guides, emergency contacts, and official advisories.

## 2. User Roles

### Resident User

A resident can:

- Create an account and sign in
- Submit a flood incident report
- View only their own submitted reports
- Check the status of their reports
- View preparedness guides, emergency contacts, and advisories

### DRRMO Staff / Admin

An authorized DRRMO staff member can:

- View all submitted flood reports
- Filter reports by status, severity, date, and barangay
- Review and verify a report
- Update the report status
- Add internal staff notes
- Create and manage advisories and emergency contacts

### System Administrator

A system administrator can:

- Create and manage DRRMO staff accounts
- Assign user roles
- Manage basic system settings

## 3. Flood Report Fields

Every flood report will have:

- Report ID - automatically created by the system
- Resident ID - automatically connected to the logged-in resident
- Barangay - required
- Detailed Location - required
- Flood Severity - required: Low, Medium, or High
- Description - required
- Date and Time Reported - automatically created by the system
- Optional Photo - supporting evidence only
- Report Status - automatically starts as Submitted
- Staff Note - optional; added by DRRMO staff during review

## 4. Report Status Rules

- Submitted - the resident has sent the report
- Under Review - DRRMO staff is checking the report
- Verified - DRRMO staff has reviewed or confirmed available details
- Resolved - the concern has been acted on or completed
- Closed - the report is final and no more update is needed

## 5. Main System Workflow

1. Resident creates an account and signs in.
2. Resident submits a flood report.
3. The system saves the report in the database.
4. The report status starts as Submitted.
5. DRRMO staff sees the report in the admin dashboard.
6. DRRMO staff reviews the information and may change the status to Under Review or Verified.
7. DRRMO staff may add a staff note and update the report status.
8. The resident can see the updated status of their own report.

## 6. Database Collections

- users
- flood_reports
- advisories
- emergency_contacts
- preparedness_guides

## 7. Important Project Rules

- The project is web-based only.
- The project does not use sensors, kiosks, QR codes, or other hardware.
- The website does not automatically dispatch rescue personnel.
- Reports must be reviewed by DRRMO staff.
- Unverified reports will not be publicly displayed.
- Test or sample data will be used during development and demonstration.

## 8. Flood Report Data Example

Each submitted report will become one record inside the flood_reports collection.

```json
{
  "residentId": "sample-resident-id",
  "barangay": "Sample Barangay",
  "locationDetails": "Near the covered court",
  "severity": "High",
  "description": "Flood water is near knee level.",
  "photoUrl": null,
  "status": "Submitted",
  "staffNote": "",
  "createdAt": "September 12, 2026, 10:30 AM"
}