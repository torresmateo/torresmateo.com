# Migration Guide

This document provides step-by-step instructions for migrating content from the two Jekyll sites into this Astro project.

## Prerequisites

Before starting the migration, ensure you have:
1. Access to the `aboutme` repo (gh-pages branch)
2. Access to the `torresmateo.github.io` repo
3. This Astro project set up locally

## Step 1: Migrate Blog Posts (English)

### From Jekyll
Blog posts are located in `torresmateo.github.io/_posts/`

### Jekyll Front Matter Example
```yaml
---
layout: post
title: "My Blog Post"
date: 2024-01-15
categories: [technology, programming]
---
```

### Astro Front Matter Example
```yaml
---
title: 'My Blog Post'
description: 'A brief description for SEO (add this if missing)'
pubDate: 2024-01-15
categories: ['technology', 'programming']
tags: []  # Optional
---
```

### Migration Steps
1. Copy all `.md` files from `torresmateo.github.io/_posts/`
2. Rename files to remove date prefix if present (e.g., `2024-01-15-my-post.md` → `my-post.md`)
3. Move to `src/content/blog/`
4. Transform front matter:
   - Change `layout: post` to nothing (remove it)
   - Change `date:` to `pubDate:`
   - Add `description:` field (use first paragraph or write a summary)
   - Convert `categories: [cat1, cat2]` to `categories: ['cat1', 'cat2']`
5. Update image paths: `![alt](images/pic.jpg)` → `![alt](/images/pic.jpg)`

### Command to help
```bash
# In the torresmateo.github.io directory
cp _posts/*.md /path/to/mateo-gg/src/content/blog/
```

## Step 2: Migrate Spanish Blog Posts

### From Jekyll
Spanish posts are typically in `torresmateo.github.io/_posts/` with ES category

### Migration Steps
1. Identify Spanish posts (usually have `categories: ES` or similar)
2. Copy to `src/content/blog-es/`
3. Transform front matter similar to English posts
4. Add `lang: es` field (optional)

### Example Transform
```yaml
# Before (Jekyll)
---
layout: post
title: "Mi Artículo"
date: 2024-01-15
categories: ES
---

# After (Astro)
---
title: 'Mi Artículo'
description: 'Una breve descripción'
pubDate: 2024-01-15
categories: ['ES']
lang: es
---
```

## Step 3: Migrate Scientific Papers

### From Jekyll
Papers are located in `aboutme/_posts/` (gh-pages branch)

### Jekyll Front Matter Example
```yaml
---
layout: post
title: "CAFA3"
ref-authors: Torres, M., et al.
ref-year: 2023
ref-title: "Full Paper Title"
ref-journal: "Journal Name"
ref-vol: "Vol. 30, No. 6"
ref-doi: "10.1234/example"
---
```

### Astro Front Matter Example
```yaml
---
title: 'CAFA3'
description: 'Summary of the CAFA3 paper'
pubDate: 2023-06-15
refAuthors: 'Torres, M., et al.'
refYear: 2023
refTitle: 'Full Paper Title'
refJournal: 'Journal Name'
refVol: 'Vol. 30, No. 6'
refDoi: '10.1234/example'
---
```

### Migration Steps
1. Copy paper posts from `aboutme/_posts/`
2. Move to `src/content/papers/`
3. Transform front matter:
   - Change `ref-authors` to `refAuthors`
   - Change `ref-year` to `refYear` (number, no quotes)
   - Change `ref-title` to `refTitle`
   - Change `ref-journal` to `refJournal`
   - Change `ref-vol` to `refVol`
   - Change `ref-doi` to `refDoi`
   - Add `description` field
   - Add `pubDate` field (use publication date or posting date)

## Step 4: Migrate Static Assets

### Images

#### From Jekyll Sites
- `aboutme/images/` (~26MB)
- `torresmateo.github.io/images/` (~29MB)

#### Migration Steps
```bash
# In aboutme repo (gh-pages branch)
cp -r images/* /path/to/mateo-gg/public/images/

# In torresmateo.github.io repo
cp -r images/* /path/to/mateo-gg/public/images/
```

Handle duplicates: Keep the newer/higher quality version

### Fonts

#### From Jekyll Sites
- `aboutme/fonts/` (~2MB)
- `torresmateo.github.io/fonts/` (~2MB)

#### Migration Steps
```bash
# Copy fonts (handle duplicates)
cp -r aboutme/fonts/* /path/to/mateo-gg/public/fonts/
cp -r torresmateo.github.io/fonts/* /path/to/mateo-gg/public/fonts/
```

Note: The Astro template includes Atkinson font. Verify if your Jekyll fonts should replace or supplement these.

### Other Assets

#### Favicon
```bash
cp aboutme/favicon.ico /path/to/mateo-gg/public/
```

#### .well-known Directory (Nostr)
```bash
cp -r aboutme/.well-known /path/to/mateo-gg/public/
```

## Step 5: Update Content References

After migrating files, search for and update:

1. **Internal Links**
   ```bash
   # Find all markdown files with internal links
   grep -r "](/[^h]" src/content/
   ```
   Update Jekyll-style links to match new URL structure

2. **Image Paths**
   ```bash
   # Find all image references
   grep -r "!\[" src/content/
   ```
   Ensure all use `/images/...` format

3. **Asset References**
   Check for any references to CSS, JS, or other assets that need updating

## Step 6: Verify Build

After migration:

```bash
# Build the site
npm run build

# Check for errors
# The build should complete without errors

# Preview
npm run preview
```

### Common Issues

1. **Missing Description**: All posts need a `description` field
2. **Wrong Date Format**: Dates should be `YYYY-MM-DD` or ISO format
3. **Image 404s**: Verify image paths are correct
4. **Front Matter Syntax**: Use single quotes around strings with special characters

## Step 7: Test URLs

Verify that all URLs work as expected:

### Blog Posts
- Old: `blog.torresmateo.com/my-post/`
- New: `torresmateo.com/my-post/`

Test each post to ensure:
- Content renders correctly
- Images load
- Syntax highlighting works
- Categories/tags display

### Papers
- Old: `torresmateo.com/paper-name/`
- New: `torresmateo.com/paper-name/`

Verify:
- Citation displays correctly
- DOI links work
- Content is formatted properly

### Spanish Posts
- Old: `blog.torresmateo.com/es-post/` or similar
- New: `torresmateo.com/es/es-post/`

## Step 8: Deploy

Once everything is verified locally:

1. Commit all changes to git
2. Push to GitHub
3. Deploy to Netlify
4. Test on production URL
5. Set up redirects if needed (see `netlify.toml`)

## Automation Scripts

You can create helper scripts for migration. Example:

```bash
#!/bin/bash
# migrate-posts.sh

for file in ~/torresmateo.github.io/_posts/*.md; do
  filename=$(basename "$file")
  # Remove date prefix if present
  newname=$(echo "$filename" | sed 's/[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-//')
  cp "$file" "src/content/blog/$newname"
  echo "Migrated $filename to $newname"
done
```

## Checklist

Use this checklist to track migration progress:

### Content
- [ ] All English blog posts migrated
- [ ] All Spanish blog posts migrated
- [ ] All 5 scientific papers migrated
- [ ] Front matter transformed correctly
- [ ] Image paths updated

### Assets
- [ ] Images copied to `public/images/`
- [ ] Fonts copied to `public/fonts/`
- [ ] Favicon copied
- [ ] `.well-known/` directory copied

### Verification
- [ ] Build completes without errors
- [ ] All URLs work correctly
- [ ] Images load on all pages
- [ ] RSS feed valid
- [ ] Sitemap includes all pages
- [ ] SEO tags present on all pages

### Deployment
- [ ] Code pushed to GitHub
- [ ] Netlify connected
- [ ] DNS configured
- [ ] Redirects set up
- [ ] Google Analytics configured

## Need Help?

If you encounter issues during migration:

1. Check the Astro documentation: https://docs.astro.build
2. Review content collection schema in `src/content.config.ts`
3. Look at sample files in `src/content/blog/sample-post.md` and `src/content/papers/sample-paper.md`
4. Check build errors carefully - they often indicate front matter issues
