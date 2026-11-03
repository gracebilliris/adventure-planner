# Little Elsewhere — Adventure Planner

A static, anonymous Sydney afternoon planner built with React, TypeScript and Vite.

## Run

Use Node 22:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

The local helper uses **http://127.0.0.1:5190**. Production output is `dist/`.

## Plan an afternoon

Choose a time allowance, estimated per-person AUD budget, interests, starting neighbourhood and optional indoor-friendly filter. Click **Generate itinerary**. Adjust visit durations, move stops up/down, remove stops or add any of the 21 curated examples from the guide. Walking estimates and costs recalculate; infeasible edits are flagged rather than silently discarded.

Save multiple favourite itineraries on this browser, load or delete them, print a readable itinerary, download a JSON copy, or copy a self-contained share link. JSON download is an export, not an import format. The Google Maps link opens a separate external service; it is not an embedded/live map. Standard keyboard controls, visible focus and a skip link are supported.

## Destination photography

All 21 destinations use photographs of the actual Sydney places, including Circular Quay promenade, rather than category illustrations. Photos are hosted with the app, in 480px and 960px WebP versions, with responsive selection and lazy loading. No external image service or tracking request is needed to display them.

`src/placePhotos.json` records each photograph's original title, photographer, Commons source, licence, descriptive alt text and modifications. The app shows credits beside guide photos and a complete **Photo credits & licences** section. Photos retain their individual CC BY, CC BY-SA or CC0 terms; those licences apply to the photographs, not the application. Images have been resized/compressed and are cropped to fit the interface. Reference photographs do not guarantee current conditions.

When replacing a file in `public/photos/`, verify the exact location and reuse permission, update both sizes and the corresponding manifest record, and retain the required attribution. Printed itineraries remain text-only.

## Data, privacy and limitations

- Original curated descriptions are examples, not verified venue listings. No opening hours, current prices, availability, traffic, weather, bookings or accessible-route guarantees are provided. Check venues before travelling.
- Costs are estimated admission/food allowances per person. Transport, extras, paid exhibitions and return travel are excluded.
- Travel is a conservative geographic walking estimate (straight-line distance × 1.35 at 60 metres/minute, plus five minutes per leg), not a road routing calculation. First-leg travel from the chosen neighbourhood is included; return travel is not.
- Indoor-friendly destinations do not mean covered walks. Rainy-day filtering may choose other interests when matching stops do not fit. Interests rank choices rather than prohibit other categories.
- No APIs, backend, accounts, GPS, analytics, cookies or secrets. Planning works without network access **once this page and its assets are loaded**; there is no installed offline cache, so a fresh offline visit/reload is not guaranteed. Maps and GitHub hosting require a network.
- Preferences are not automatically stored. Saving is explicit and uses localStorage (up to 20 plans). The selected starting area is replaced with the default Circular Quay unless you opt in to remember it. Review the route after loading because changing its starting area can affect feasibility. Clear favourites using Delete or your browser's site-data controls.
- Shared URLs and downloaded files include the selected broad starting area and itinerary. Share only if comfortable with this. Nothing is uploaded by the planner; GitHub hosting and external Maps have their own privacy policies. Do not enter personal information.
- Generation uses curated durations, a maximum of 12 stops, and deterministic interest/nearby-stop ranking. Impossible constraints produce an empty plan. It does not optimize every possible route or guarantee actual-world feasibility.

## Tests and deployment

`npm test` covers time/budget bounds, durations, reordering, empty/invalid data, sharing and storage/privacy failures. The project-specific browser check is `node scripts/browser-check.mjs` with the dev helper running; it uses the shared Playwright installation at `/Users/gracebilliris/Projects/brick-by-brick/node_modules/@playwright/test`. Screenshots/downloads go to ignored `artifacts/`. Pass a production URL as its first argument to verify a deployment.

GitHub Pages is deployed by `.github/workflows/deploy.yml`: Node 22, clean dependency installation, tests, production build and the official Pages actions. Set Pages source to **GitHub Actions**. Vite uses `base: './'` for project hosting.

- Repository: https://github.com/gracebilliris/adventure-planner
- Live: https://gracebilliris.github.io/adventure-planner/
