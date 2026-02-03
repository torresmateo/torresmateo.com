# Mateo Torres - Personal Website & Blog

This is the source code for [torresmateo.com](https://torresmateo.com), built with [Astro](https://astro.build).

## Overview

This site combines the main personal website and blog into a single Astro project, migrated from two separate Jekyll sites:
- Main website (aboutme repo, gh-pages branch) → https://torresmateo.com
- Blog (torresmateo.github.io repo) → https://blog.torresmateo.com

## Features

- **Homepage**: Bio, experience, and publications
- **Blog**: English language posts at root level (`/:title/`)
- **Spanish Blog**: Spanish posts at `/es/:title/`
- **Scientific Papers**: Academic publications with proper citation formatting
- **PRML Page**: Pattern Recognition and Machine Learning study group resources
- **RSS Feed**: Available at `/rss.xml`
- **SEO Optimized**: Meta tags, Open Graph, Twitter Cards, and sitemap
- **Syntax Highlighting**: Code blocks with Shiki
- **Responsive Design**: Mobile-friendly layout

## Project Structure

```
/
├── public/           # Static assets (images, fonts, favicon, .well-known)
├── src/
│   ├── components/   # Reusable Astro components
│   ├── content/      # Content collections (blog, blog-es, papers)
│   ├── layouts/      # Page layouts
│   ├── pages/        # Routes and page files
│   └── styles/       # Global CSS
├── astro.config.mjs  # Astro configuration
├── netlify.toml      # Netlify deployment config
└── package.json      # Dependencies and scripts
```

## Content Collections

### Blog Posts (English)
Location: `src/content/blog/`

Front matter:
```yaml
---
title: 'Post Title'
description: 'Post description for SEO'
pubDate: 2024-01-15
categories: ['category1', 'category2']
tags: ['tag1', 'tag2']
heroImage: ./image.jpg  # Optional
---
```

### Blog Posts (Spanish)
Location: `src/content/blog-es/`

Same structure as English posts, with optional `lang: es` field.

### Scientific Papers
Location: `src/content/papers/`

Front matter:
```yaml
---
title: 'Paper Summary Title'
description: 'Description for the paper page'
pubDate: 2023-06-15
refAuthors: 'Author1, A., Author2, B., and Author3, C.'
refYear: 2023
refTitle: 'Full Paper Title'
refJournal: 'Journal Name'
refVol: 'Vol. 30, No. 6'  # Optional
refDoi: '10.1234/example.doi'  # Optional
---
```

## URL Structure

All content is accessible at the root level to maintain SEO:

- Homepage: `/`
- Blog listing: `/blog/`
- Blog posts: `/:slug/` (e.g., `/my-post/`)
- Spanish blog: `/es/`
- Spanish posts: `/es/:slug/` (e.g., `/es/mi-articulo/`)
- Papers: `/:slug/` (e.g., `/cafa3/`)
- PRML page: `/prml/`
- RSS feed: `/rss.xml`

## Migration Checklist

To complete the migration from Jekyll sites:

- [ ] Copy all blog posts from `torresmateo.github.io/_posts/` to `src/content/blog/`
- [ ] Copy Spanish posts to `src/content/blog-es/`
- [ ] Copy the 5 scientific papers to `src/content/papers/`
- [ ] Transform Jekyll front matter to match Astro schemas
- [ ] Copy images from both sites to `public/images/`
- [ ] Copy fonts from both sites to `public/fonts/`
- [ ] Copy `.well-known/` directory to `public/.well-known/`
- [ ] Copy `favicon.ico` to `public/`
- [ ] Update image paths in content to `/images/...`
- [ ] Set up Google Analytics (add `PUBLIC_GA_ID` to environment variables)
- [ ] Configure DNS to point to Netlify
- [ ] Set up redirect from blog.torresmateo.com to main domain

## Development

### Install dependencies
```bash
npm install
```

### Start dev server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Deployment

The site is configured for deployment on Netlify:

1. Connect the GitHub repository to Netlify
2. Netlify will use the settings in `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20
3. Add environment variables in Netlify dashboard (optional):
   - `PUBLIC_GA_ID`: Google Analytics tracking ID

## Google Analytics

To enable Google Analytics, add your tracking ID as an environment variable:

```bash
PUBLIC_GA_ID=G-XXXXXXXXXX
```

The analytics script is conditionally loaded from `src/components/BaseHead.astro`.

## Content Updates

### Adding a new blog post

1. Create a new `.md` or `.mdx` file in `src/content/blog/`
2. Add the required front matter (title, description, pubDate)
3. Write your content
4. Build and deploy

The post will be automatically available at `/:slug/` and listed on `/blog/`.

### Adding a new paper

1. Create a new `.md` file in `src/content/papers/`
2. Add the required front matter including academic fields
3. Write the paper content/abstract
4. Build and deploy

The paper will appear on the homepage and at `/:slug/`.

## License

Content is © Mateo Torres. Code is available for reference.

## Questions?

For issues or questions, please open an issue on the GitHub repository.
