# Saved Configurations System - Setup Guide

## Vercel KV Configuration

To enable shared public configurations, you need to configure Vercel KV:

### 1. Create a KV Store in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard/stores
2. Click "Create Database" → "KV"
3. Give your store a name (e.g: `flynn-vector-grid-configs`)
4. Select your preferred region

### 2. Get the credentials

Once the KV store is created:

1. Go to the "Settings" tab of your KV store
2. Copy the environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### 3. Configure environment variables

#### For local development:
1. Create or edit `flynn-app/.env.local`
2. Add the copied variables:
```bash
KV_REST_API_URL="https://your-kv-store.kv.vercel-storage.com"
KV_REST_API_TOKEN="your_secret_token_here"
```

#### For production:
1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add the two environment variables

### 4. Verify installation

1. Run `cd flynn-app && npm install @vercel/kv`
2. Restart your development server
3. Test by saving a public configuration

## System Features

### Private Configurations
- Saved in browser localStorage
- Only visible to current user
- No additional configuration required

### Public Configurations
- Saved in Vercel KV
- Shareable via URL
- Require Vercel KV configuration

### Main features:
- Save/load complete configurations (grid, vectors, animation, zoom)
- Tag system for organization
- Filters by animation type
- Search by name/description/tags
- View counter for public configs
- Shareable links for public configs

## API Endpoints

- `POST /api/configs/save` - Save public configuration
- `GET /api/configs/public` - List public configurations (with filters)
- `GET /api/configs/[id]` - Get specific configuration
- `DELETE /api/configs/[id]` - Delete public configuration
- `GET /api/configs/usage` - Usage statistics

## Next steps

1. Configure Vercel KV following the steps above
2. Test saving a private configuration
3. Test saving a public configuration
4. Verify that filters and search work correctly