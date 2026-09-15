# BantayBaha Cainta

A web-based school prototype for flood incident reporting and disaster preparedness information, intended for a Cainta DRRMO workflow. Built with React, TypeScript, Vite, Firebase Authentication, and Cloud Firestore.

**Development/demo only.** This is not an official emergency reporting service, does not automatically dispatch rescue personnel, and must not be relied on for emergency response. Use sample data during demonstrations.

## Working features

- Resident email/password registration, login, and logout.
- Account-owned flood reports: required location, barangay, severity, and description.
- My Reports: residents can read only their own reports and see status updates.
- Authorized staff dashboard: all reports, status filter, summary counts, and status updates.
- Firestore rules validate report fields, ownership, timestamps, and staff permissions.
- Loading, validation, save-error, and account-switch states.

Still planned: preparedness/advisory/contact pages (current navigation placeholders), actual image upload, additional dashboard filters, internal staff notes, password recovery/email verification, and public website deployment. The optional photo control currently saves **only the filename**, not the image.

## Access rules

| User | Read reports | Create reports | Update reports |
| --- | --- | --- | --- |
| Signed out | None | No | No |
| Signed-in resident | Own reports only | Own reports, initially Submitted | No |
| Active staff | All reports | Own reports | Status and updated timestamp only |

The database checks permissions; hiding a button is not the security boundary. Staff access requires a Firestore `staff/{authentication-uid}` document containing `active: true`. Browser clients cannot create or change staff membership, including staff themselves. Only the Firebase project administrator provisions staff through trusted project administration tools.

## Run locally (PowerShell)

From the project folder:

```powershell
npm.cmd ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

Fill the six values in the root `.env.local` using your Firebase web app configuration. Do not put this file inside `src`. If `.env.local` already exists, keep it; do not overwrite your working configuration.

In the Firebase console for your project:

1. Register a Web app and copy its configuration.
2. Enable Authentication > Email/Password.
3. Create a Cloud Firestore database and publish the contents of `firestore.rules`. Do not enable public test-mode rules.
4. To authorize a staff member, create their Authentication account using credentials they manage privately. Copy that user's UID.
5. In Firestore, create `staff` > document ID equal to that UID > field `active`, type **boolean**, value **true**. Do not store passwords in Firestore.

Then run:

```powershell
npm.cmd run dev
```

Open the Local URL printed by Vite, usually `http://localhost:5173/`. Keep that terminal running. Restart Vite after changing `.env.local`.

The `.env.local` file is ignored by Git. Firebase web configuration is still included in the browser bundle; it is not a secret access-control mechanism. Never add service-account private keys or administrator credentials to frontend environment variables. `VITE_ADMIN_EMAIL` is no longer used to grant staff access.

## Test without touching the real database

The local emulator uses the separate project ID `demo-bantaybaha` and needs no real Firebase credentials. The Firestore emulator requires Java 21 or newer on the terminal's PATH. The regular website does not need Java.

Run these in separate terminals, all inside the project directory:

```powershell
# Terminal 1: local Authentication + Firestore
npm.cmd run emulators
```

```powershell
# Terminal 2: create a local-only sample staff account, then start the test website
npm.cmd run seed:demo
npm.cmd run dev:emulator
```

Open `http://localhost:5174/`. The seed command prints the **local test** staff login. Register sample residents such as `ana@example.test` and `ben@example.test` in this test website. These accounts and reports do not go to the real Firebase project. Data is temporary and is lost when the emulators stop.

For automated checks, stop the interactive emulators first with Ctrl+C, then run:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run test:rules
```

The test command starts and stops its own local emulators. The 16 tests cover guest denial, report ownership, account isolation, field validation, staff permissions, role revocation, live status updates, and the Authentication lifecycle.

## Demonstration checklist

1. Register resident A and submit a clearly labeled sample report without a photo.
2. Open My Reports and refresh: the report remains associated with that account.
3. Log out and register resident B: A's report must not appear.
4. Try Staff Login as a resident: staff access must be refused.
5. Log in with the authorized staff account and change a sample report's status.
6. Sign back in as its resident owner and verify the updated status.

Older demonstration records created before account-based ownership still use browser-generated IDs. They have not been deleted or automatically assigned to a resident. Staff can still see them; a newly registered resident will not see those legacy records.

## Project files

- `src/App.tsx`: screen navigation and account-scoped report subscriptions.
- `src/ResidentLogin.tsx`, `src/AdminLogin.tsx`: account forms.
- `src/useAccount.ts`, `src/account.ts`: authentication and staff membership.
- `src/firestoreReports.ts`: report reads and writes.
- `firestore.rules`: database permissions and validation.
- `tests/firestore.test.mjs`: local security and account tests.
- `src/docs/system-blueprint.md`: implementation details and remaining scope.
- `docs/PROGRESS.md`: short Taglish presentation reviewer.

The GitHub repository stores source code and project history. It is not a deployed public website. Before any real public use, complete the remaining features and arrange DRRMO review, privacy/retention decisions, abuse protection, operational monitoring, and deployment testing.
