# BantayBaha Cainta — Progress reviewer

## Ano na ang gumagana?

May resident registration/login na, flood report form, My Reports, at staff dashboard. Naka-save ang reports sa Firebase Firestore. May sariling account ID ang bawat resident, kaya sa account nakakabit ang report, hindi lang sa browser.

May public Preparedness page na rin: Before/During/After a Flood, go-bag checklist, at source links. Gumagana ang dalawang homepage buttons at hindi kailangan ng login. Simple functional layout pa lang; final design at images ay later milestone.

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
- Optional photo: filename pa lang ang sine-save, hindi actual image.
- Advisories at contacts: planned pages pa; may placeholders sa navigation.
- Preparedness content: static summary mula sa PAGASA at Red Cross sources, hindi live updates o official DRRMO-approved guidance.
- Status ay manual staff update, hindi sensor reading o automatic verification.
- Wala pang internal notes, public deployment, password reset, o email verification flow.
- Hindi ibig sabihin ng registration na verified Cainta resident na ang tao.

## Next small milestone

Plan the Advisories page next, then Emergency Contacts using verified details. Hiwalay ang preparedness content file at CSS para madaling baguhin ang design later. Wala pang bagong database collection sa information-page milestone na ito.
