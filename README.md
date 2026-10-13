# Castle Busters Tournament - Netlify

Everyone who opens the site can WATCH (no login). Admins click "Admin Login" and type the shared password to edit.

## Deploy (Netlify CLI)
1. Install Node.js (https://nodejs.org).
2. In this folder: `npm install`
3. `npx netlify-cli login`
4. `npx netlify-cli deploy --prod` (choose "Create & configure a new project" when asked)
5. In Netlify: Site configuration > Environment variables > add `ADMIN_PASSWORD` (your secret). Then run step 4 again so it takes effect.

Alternative: push this folder to GitHub, then Netlify > Add new site > Import from Git, and set `ADMIN_PASSWORD` before the first deploy.
(Plain drag-and-drop of `public/` alone will NOT work: the save function would be missing.)

## Admins
Give the password only to the friends who run the tournament. Everyone else just opens the link.

## Video upload (optional, up to 50 MB)
1. Create a free Cloudinary account.
2. Settings > Upload > Add upload preset > Signing mode: **Unsigned**.
3. In Netlify add env vars `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET`, then redeploy.
The "Upload Video" button then appears for admins. Without this, "Add Link" (YouTube/Drive) still works.
