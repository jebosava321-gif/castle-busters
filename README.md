# Castle Busters Tournament - Vercel

Everyone can WATCH (no login). Admins click "Admin Login" and type the password to edit.

1. Upload ALL files of this folder to a GitHub repository (keep the `public` and `api` folders).
2. Vercel > Add New > Project > import the repository > Deploy.
3. Vercel project > Storage > Create Database > Upstash (Redis) > Free > Connect to Project.
4. Project > Settings > Environment Variables > add ADMIN_PASSWORD (your secret).
5. Deployments > ... > Redeploy.

Optional video upload (50 MB): create a free Cloudinary account, add an UNSIGNED upload preset, then add env vars
CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET and redeploy.
