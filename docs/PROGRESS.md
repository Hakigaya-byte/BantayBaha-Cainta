# BantayBaha Cainta — Progress reviewer

## Ano na ang gumagana?

May resident registration/login na, flood report form, My Reports, at staff dashboard. Naka-save ang reports sa Firebase Firestore. May sariling account ID ang bawat resident, kaya sa account nakakabit ang report, hindi lang sa browser.

May public Preparedness page na rin: Before/During/After a Flood, go-bag checklist, at source links. May Advisories page na may category/search filters, at Emergency Contacts na may service numbers at lahat ng pitong barangay mula sa supplied One Cainta poster.

## Design update — completed implementation 21 September 2026

Na-implement ang blue/navy/yellow design mula sa selected mockups: shared navigation/footer, scenic hero, illustrated preparedness, report cards, at responsive layouts.

- Public homepage: report/guide shortcuts at advisory previews.
- Resident homepage: “Welcome back!” (walang “Resident” sa heading), sariling live counts, recent reports, at quick access.
- My Reports: status filters, newest/oldest sorting, expandable incident details at actual optional photo.
- Staff: hiwalay na report-management queue at advisory tools; actual database data lang, walang fictional mockup counts/names.
- Login: scenic split layout, resident/staff tabs, existing registration and sign-in.

Build and lint passed on 21 September 2026. Vite reports a non-blocking bundle-size warning. Manual browser/phone testing is deferred to the user as requested; compile/lint checks do not prove the full user flows. No GitHub push and no deployment were performed for this redesign.

## Report form redesign and save fix — 21 September 2026

- Based on `docs/design/reference-report-form.png`: scenic banner, white form + pale-blue guide, three keyboard-accessible severity choices, photo choose/drop/remove controls, and single-column mobile layout. Shared branding/footer stay consistent with the rest of the site.
- Barangay selection uses the existing seven-barangay directory. Existing Low/Medium/High schema is preserved; no new Severe value was added.
- **Confirmed cause:** read-only inspection of the live Firebase console showed the active 15 September rules allow only the older nine-field report schema. The new client had included `photoPath: ''`, which the live `hasOnly` rejected. The initial write now omits that field; readers already normalize missing paths. Local rules now support both missing and empty paths for a safe staged rollout. No live rules were changed.
- Auth/session, permission, connection, and quota errors now have separate messages. Failed saves keep form entries. Duplicate clicks are guarded. Saved reports show a reference and a View My Reports button.
- **Photo limitation:** live project is still Spark. [Firebase requires Blaze for Cloud Storage](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024). Cloud uploads are intentionally off in `src/reportFeatures.ts`, and the form explains that selected files will not be attached. Report text saves normally; no futile upload wait. Local emulator uploads remain enabled. Enabling real uploads later requires the owner's billing decision, Storage provisioning/rules, and the updated Firestore photo-attachment rules. No billing changes were made.
- Validation: production build, Oxlint, 2 form-helper tests, and 23 local security/account/storage tests passed. This is not a live cloud submission or desktop/mobile visual sign-off. User retains manual flow/layout testing as requested.
- No GitHub push, website deployment, or cloud permission changes.

## Home and live advisory fix — 22 September 2026

- Home now keeps the full information page for both guests and signed-in residents: reporting shortcuts, preparedness, advisory previews, and workflow. Personal report history remains in My Reports. Normal resident login returns Home; login started from Report a Flood still returns to the requested form.
- Confirmed live advisory failure: the deployed 15 September Firestore rules had no `advisories` permission. On 22 September at 7:27 PM (UTC+8), published the owner-approved advisory-only addition. Published advisories are public; active staff can manage drafts and publishing. The existing `staff` and `floodReports` permissions were preserved exactly. No report records, Storage permissions, or billing were changed.
- Loading, unavailable, empty, and populated advisory states are separate. Failures offer Try again; sample notices no longer replace missing live data on Home or Advisories. An empty list is not an all-clear or a statement about real-world flood conditions.
- `firestore.production.rules` records this limited live release; `firebase.production.json` points only to that file. `firestore.rules` / `firebase.json` still include the staged emulator photo feature. **Do not deploy the default rules/config to production until the separate photo rollout is approved.** For an authorized future rules release, review the live baseline first and use `--config firebase.production.json --only firestore:rules --project bantaybaha-cainta`.
- Checks: build and Oxlint passed; 3 Home/advisory rendering tests, 3 production-rule emulator tests, 6 content tests, and 2 report-helper tests passed. Emulator checks cover public published-only access, staff advisory management, resident isolation, and unchanged report/photo restrictions. React review kept one cleaned-up subscription with an explicit retry key.
- Existing deployment only: `https://bantay-baha-cainta.vercel.app/`, GitHub `Hakigaya-byte/BantayBaha-Cainta`, production branch `main`. Owner requested the verified fixes be pushed to main for the existing Vercel integration. No new Vercel project or domain.
- Browser check after the rules publication: the existing site's public Advisories page loads without the previous access-error banner. The frontend update replaces its old sample fallback with the explicit empty state. No live test reports or fake public advisories were created.

## Simple explanation kay sir

> Ang BantayBaha Cainta po ay web-based prototype para sa flood reporting workflow. Magla-login ang resident, magsa-submit ng report, at makikita niya ang status sa My Reports. Ang authorized staff naman ang nakakakita ng lahat ng reports at puwedeng mag-update ng status. May database rules para hindi mabasa ng isang resident ang report ng ibang account.

## Demo order

1. Resident A: gumawa ng account, then submit ng sample report.
2. My Reports: ipakita ang saved report at initial status na Submitted.
3. Refresh: nandoon pa rin ang report dahil nasa database na.
4. Resident B: mag-login sa ibang account; hindi dapat makita ang report ni A.
5. Staff: mag-login gamit ang authorized account, then update to Under Review.
6. Resident A ulit: ipakita ang updated status.
7. Preparedness: buksan kahit signed out. Ipakita ang guide, sources, at checklist. Ang checklist ay temporary lang at nagre-reset kapag umalis sa page o nag-refresh; hindi ito naka-save sa database.

Use sample details only. Kung local emulator ang gamit, `localhost:5174` iyon. Ang regular development site na nakakabit sa real project ay karaniwang `localhost:5173`.

## Mga terms na tandaan

| Term | Simple meaning |
| --- | --- |
| Authentication | Pag-check kung sino ang naka-login. |
| UID | Unique account ID; ito ang owner ID ng report. |
| Authorization | Pag-check kung ano ang puwedeng gawin ng account. |
| Firestore | Database kung saan naka-save ang reports. |
| Security Rules | Database checks na humaharang sa bawal na reads/writes. |
| Emulator | Local test version ng Firebase; hindi real database. |
| GitHub | Storage ng source code at history, hindi awtomatikong live website. |

## Honest limitations

- Prototype pa lang; hindi official emergency service o automatic rescue dispatch.
- Optional photo: upload/display code works with local emulators. Live uploads are disabled with a visible notice until the owner approves and configures Firebase Storage; photo selection alone does not upload the file.
- Staff can create, edit, publish/unpublish, and delete advisories. Public pages display only published notices, or an explicit loading/error/empty state.
- Contact numbers come from the recorded sources and supplied poster; reconfirm with the relevant office before real-world use.
- Preparedness content: static summary mula sa PAGASA at Red Cross sources, hindi live updates o official DRRMO-approved guidance.
- Status ay manual staff update, hindi sensor reading o automatic verification.
- Public deployment is already on the existing Vercel URL. Internal notes, password reset, and email verification remain outside this update.
- Hindi ibig sabihin ng registration na verified Cainta resident na ang tao.

## Next step

User reviews the new design on desktop and phone and reports issues with a screenshot and the action taken. Check resident/staff login, report submission/status updates, and the public information pages. No real emergency data during tests.

Start local preview from the project folder with `npm.cmd run dev`. For this release, the owner authorized pushing the verified changes to `main` for the existing Vercel auto-deployment. Check Home after resident login, Report a Flood, My Reports, and the advisory empty/published states. Use only explicitly labeled demonstration content, not fictional emergency warnings.
