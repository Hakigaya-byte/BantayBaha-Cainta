# BantayBaha Cainta — Progress reviewer

## Ano na ang gumagana?

May resident registration/login na, flood report form, My Reports, at staff dashboard. Naka-save ang reports sa Firebase Firestore. May sariling account ID ang bawat resident, kaya sa account nakakabit ang report, hindi lang sa browser.

## Simple explanation kay sir

> Ang BantayBaha Cainta po ay web-based prototype para sa flood reporting workflow. Magla-login ang resident, magsa-submit ng report, at makikita niya ang status sa My Reports. Ang authorized staff naman ang nakakakita ng lahat ng reports at puwedeng mag-update ng status. May database rules para hindi mabasa ng isang resident ang report ng ibang account.

## Demo order

1. Resident A: gumawa ng account, then submit ng sample report.
2. My Reports: ipakita ang saved report at initial status na Submitted.
3. Refresh: nandoon pa rin ang report dahil nasa database na.
4. Resident B: mag-login sa ibang account; hindi dapat makita ang report ni A.
5. Staff: mag-login gamit ang authorized account, then update to Under Review.
6. Resident A ulit: ipakita ang updated status.

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
- Optional photo: filename pa lang ang sine-save, hindi actual image.
- Preparedness, advisories, at contacts: planned pages pa; may placeholders sa navigation.
- Status ay manual staff update, hindi sensor reading o automatic verification.
- Wala pang internal notes, public deployment, password reset, o email verification flow.
- Hindi ibig sabihin ng registration na verified Cainta resident na ang tao.

## Next small milestone

Build the preparedness information page using reviewed content, then advisories and emergency contacts. Keep these separate from the private reporting workflow para madaling baguhin ang design later.
