# Quick Start Guide

Get your Astro site up and running quickly.

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Access to Jekyll sites for content migration

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Visit http://localhost:4321 to see your site.

### 3. Make Changes

The dev server has hot reload enabled. Edit files and see changes instantly.

## Content Migration (Quick Version)

### Blog Posts

1. Copy posts from Jekyll:
```bash
cp ~/torresmateo.github.io/_posts/*.md src/content/blog/
```

2. Fix front matter in each file:
- Change `date:` to `pubDate:`
- Add `description:` field
- Remove `layout:` field

### Images

```bash
cp -r ~/torresmateo.github.io/images/* public/images/
cp -r ~/aboutme/images/* public/images/
```

### Papers

```bash
cp ~/aboutme/_posts/paper*.md src/content/papers/
```

Transform front matter: `ref-*` → `ref*` (camelCase)

## Build & Deploy

### Test Production Build

```bash
npm run build
npm run preview
```

### Deploy to Netlify

1. Push code to GitHub
2. Connect repository in Netlify
3. Settings are auto-configured from `netlify.toml`
4. Deploy!

## Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run astro check  # Type check
```

## Need More Details?

- Full migration: See `MIGRATION_GUIDE.md`
- Project info: See `README.md`
- Implementation details: See `IMPLEMENTATION_SUMMARY.md`

## Quick Troubleshooting

### Build fails
- Check front matter syntax (YAML is strict about spacing)
- Ensure all posts have required fields: `title`, `description`, `pubDate`
- Look at sample files for reference

### Images not loading
- Verify images are in `public/images/`
- Check paths in markdown use `/images/...` (with leading slash)
- Case sensitivity matters!

### Content not showing
- Ensure files are in correct directories:
  - English blog: `src/content/blog/`
  - Spanish blog: `src/content/blog-es/`
  - Papers: `src/content/papers/`

## Get Help

- Check Astro docs: https://docs.astro.build
- Review migration guide: `MIGRATION_GUIDE.md`
- Look at sample content for examples
