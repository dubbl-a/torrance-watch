import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const races = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/races' }),
  schema: z.object({
    slug: z.string(),
    office: z.string(),
    electionDate: z.string(),
    candidateSlugs: z.array(z.string()),
    financeData: z.record(z.string(), z.unknown()).optional(),
    callouts: z.array(z.object({
      number: z.string(),
      title: z.string(),
      body: z.string(),
      accent: z.string().optional(),
    })).optional(),
    footnotes: z.array(z.object({
      number: z.number(),
      body: z.string(),
    })).optional(),
  }),
});

const candidates = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/candidates' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    office: z.string(),
    raceSlug: z.string(),
    // Sprint 2 fields - all optional
    bio: z.string().optional(),
    website: z.string().optional(),
    endorsements: z.array(z.string()).optional(),
    photo: z.string().optional(),
  }),
});

export const collections = { races, candidates };
