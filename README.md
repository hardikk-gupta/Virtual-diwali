# Virtual Diwali

A shared Diwali sky built with Sites. Visitors can launch named lanterns, watch the sky fill, and share the wish.

The live website is hosted separately from this repository. Its lantern records remain in the site's database and are not included here.

Run `node scripts/build.mjs` to build the worker and `node --test tests/api.test.mjs` to run the API tests. `npm run dev` starts a local preview on port 3000 with 55 sample lanterns in an in-memory database.

All images, fonts, audio and icons live in `resources/` (see `DESIGN.md` §7). The design system, typography and lantern motion are documented in `DESIGN.md`.


## Vercel

Import this repository with the project root at the repository root. The checked-in vercel.json sets the build command and public output directory. The build produces both the Sites Worker and Vercel static files. /diwali and /diwali/ serve the same page.

The Vercel /api/lanterns function forwards requests to the existing public Sites backend, preserving the shared lantern records and total. The Sites address must remain published for lantern participation to work; no database credentials are copied to Vercel.

Run `node --test tests/vercel.test.mjs` to check the Vercel output and API bridge after building.
