# React TypeScript Tailwind Redux Toolkit Boilerplate

A modern React boilerplate with TypeScript, Tailwind CSS, and Redux Toolkit Query (RTK Query).

## Features

- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS for styling
- 🔄 Redux Toolkit for state management
- 📡 RTK Query for data fetching
- ⚡ Vite for fast development and building

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Deployment

This project is configured for deployment on multiple platforms. Configuration files are already set up.

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```

3. **Or deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the Vite configuration
   - Click "Deploy"

The `vercel.json` file is already configured for SPA routing.

### Option 2: Deploy to Netlify

1. **Install Netlify CLI** (optional):
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy via CLI**:
   ```bash
   netlify deploy --prod
   ```

3. **Or deploy via Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `dist` folder after running `npm run build`
   - Or connect your GitHub repository for continuous deployment

The `netlify.toml` file is already configured for SPA routing.

### Option 3: Deploy to GitHub Pages

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically deploy to GitHub Pages.

4. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Select source: "GitHub Actions"

### Manual Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. The `dist` folder will contain all the production files.

3. Upload the contents of the `dist` folder to your hosting provider.

**Note**: Make sure your hosting provider supports SPA routing (all routes should redirect to `index.html`).

## Project Structure

```
src/
├── store/
│   ├── api/
│   │   └── apiSlice.ts      # RTK Query API slice
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.slice.ts
│   │   │   ├── auth.types.ts
│   │   │   └── auth.selectors.ts (optional)
│   │   ├── user/
│   │   │   └── user.slice.ts
│   │   └── dashboard/
│   │       └── dashboard.slice.ts
│   ├── index.ts             # configureStore
│   └── rootReducer.ts       # combineReducers
├── hooks/
│   └── redux.ts             # Typed Redux hooks
├── App.tsx                  # Main App component
├── main.tsx                 # Entry point
└── index.css                # Global styles with Tailwind
```

## Usage

### Using RTK Query

Example of using RTK Query hooks in components:

```tsx
import { useGetPostsQuery } from './store/api/apiSlice'

function Posts() {
  const { data, error, isLoading } = useGetPostsQuery()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error occurred</div>

  return (
    <ul>
      {data?.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### Using Redux Hooks

```tsx
import { useAppDispatch, useAppSelector } from './hooks/redux'
```

## License

MIT

