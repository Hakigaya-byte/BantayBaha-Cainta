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
- Staff can create, edit, publish/unpublish, and delete advisories. Sample notices are clearly labeled when no staff notices are available.
- Contact numbers come from the recorded sources and supplied poster; reconfirm with the relevant office before real-world use.
- Preparedness content: static summary mula sa PAGASA at Red Cross sources, hindi live updates o official DRRMO-approved guidance.
- Status ay manual staff update, hindi sensor reading o automatic verification.
- Wala pang internal notes, public deployment, password reset, o email verification flow.
- Hindi ibig sabihin ng registration na verified Cainta resident na ang tao.

## Next step

User reviews the new design on desktop and phone and reports issues with a screenshot and the action taken. Check resident/staff login, report submission/status updates, and the public information pages. No real emergency data during tests.

Start local preview from the project folder with `npm.cmd run dev`. Final design approval comes before deployment. Do not push or deploy until requested.
