# Deploy on Vercel ya Netlify (Free Domain)

Yeh project Vercel ya Netlify par deploy karne ke liye ready hai. Dono **free subdomain** dete hain.

---

## Option 1: Vercel par deploy

### Step 1: Vercel account
- [vercel.com](https://vercel.com) par jao
- **Sign up** → GitHub se login karo

### Step 2: New project
- **Add New** → **Project**
- **Import** se `zaaain/souvenirAdmin` (ya apna repo) select karo
- **Deploy** click karo

### Step 3: Settings (optional)
- Framework: **Vite** auto-detect ho jata hai
- Build Command: `npm run build`
- Output Directory: `dist`
- Yeh sab `vercel.json` mein already hai, change ki zarurat nahi

### Step 4: Free URL
- Deploy ke baad aapko milega: **`souvenir-admin-xxx.vercel.app`** (free)
- Har push par auto redeploy

### Custom domain (optional)
- Project → **Settings** → **Domains** → apna domain add karo (e.g. `admin.yourdomain.com`)

---

## Option 2: Netlify par deploy

### Step 1: Netlify account
- [netlify.com](https://netlify.com) par jao
- **Sign up** → GitHub se login karo

### Step 2: New site
- **Add new site** → **Import an existing project**
- **GitHub** choose karo → repo select karo (`souvenirAdmin`)

### Step 3: Build settings (auto from netlify.toml)
- Build command: `npm run build`
- Publish directory: `dist`
- **Deploy site** click karo

### Step 4: Free URL
- Deploy ke baad aapko milega: **`random-name-xxx.netlify.app`** (free)
- **Site settings** → **Domain management** → **Options** → **Edit site name** se naam change kar sakte ho (e.g. `souvenir-admin.netlify.app`)

### Custom domain (optional)
- **Domain management** → **Add custom domain** → apna domain add karo

---

## Summary

| Platform   | Free URL                    | Custom domain |
|-----------|-----------------------------|----------------|
| **Vercel**   | `*.vercel.app`              | Haan, free     |
| **Netlify**  | `*.netlify.app`             | Haan, free     |

Dono par **HTTPS** automatic hota hai. GitHub connect karne se **har push par auto deploy** ho jata hai.
