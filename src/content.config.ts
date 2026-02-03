import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			categories: z.array(z.string()).optional(),
			tags: z.array(z.string()).optional(),
		}),
});

const blogEs = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog-es/` directory.
	loader: glob({ base: './src/content/blog-es', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			categories: z.array(z.string()).optional(),
			tags: z.array(z.string()).optional(),
			lang: z.literal('es').optional(),
		}),
});

const papers = defineCollection({
	// Load Markdown and MDX files in the `src/content/papers/` directory.
	loader: glob({ base: './src/content/papers', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema for scientific papers
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			// Academic paper metadata
			refAuthors: z.string(),
			refYear: z.number(),
			refTitle: z.string(),
			refJournal: z.string(),
			refVol: z.string().optional(),
			refDoi: z.string().optional(),
		}),
});

export const collections = { blog, 'blog-es': blogEs, papers };
