# Hawwa Marliya — Birthday Website

A responsive, English-only birthday experience with a midnight-blue / ivory / champagne-gold palette, animated starfield, live countdown to October 26, childhood photo slot, heartfelt letter and dua, and a Supabase-backed moderated Wish Wall.

## Quick preview
Open `index.html` in a browser. Google Fonts and the Supabase client use internet CDNs. Until Supabase is configured, the site runs in demo mode and clearly tells visitors that online wish submissions are not connected.

## Add the childhood photo
1. Create a folder named `assets` beside `index.html`.
2. Put your childhood photo in that folder and name it `childhood.jpg`.
3. If the image is a PNG or WebP, either convert it to JPG or update the `src` on `#childhoodPhoto` in `index.html`.

## Make the Wish Wall shared
1. Create a project at https://supabase.com.
2. In **SQL Editor**, run all contents of `supabase-schema.sql`.
3. Open **Project Settings / API** (or the project's Connect panel) and copy the Project URL and the public anon/publishable key.
4. Put them into `config.js` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
5. Do **not** use a `service_role` / secret key in this website. This is a public frontend.
6. Wishes are private until approved. In Supabase **Table Editor → marliya_wishes**, set `approved` to `true` for a message you want shown. Public visitors cannot approve or edit wishes.

## Publish with GitHub Pages
1. Sign in to https://github.com and create a new **public** repository named `marliya-birthday`.
2. Upload `index.html`, `style.css`, `script.js`, `config.js`, `supabase-schema.sql`, `README.md`, and the `assets` folder (if using the photo) to the repository root.
3. Open **Settings → Pages**. Under Build and deployment, choose **Deploy from a branch**, branch **main**, folder **/(root)**, then Save.
4. Wait for the Pages deployment to complete. The URL is typically `https://YOUR-USERNAME.github.io/marliya-birthday/`.
5. Open that public URL in a private/incognito window and on a phone. Test countdown and a wish submission. Confirm the wish arrives in Supabase, approve it, and verify it appears publicly.

## Important
- GitHub Pages hosts the static site; Supabase is needed for shared online wishes.
- Keep the Supabase anon/publishable key only with the row-level security (RLS) policies from the supplied SQL. Never publish a secret/service-role key.
- This project has not been deployed to your accounts yet; you must complete the account steps above before it has a live public link.
- The countdown uses the visitor's local time and rolls to the next October 26 after the birthday passes.
