import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chartDataset = z.object({
  label: z.string(),
  data: z.array(z.number()),
  color: z.union([z.string(), z.array(z.string())]),
});

const chartConfig = z.object({
  labels: z.array(z.string()),
  datasets: z.array(chartDataset),
  max: z.number().optional(),
});

const races = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/races' }),
  schema: z.object({
    slug: z.string(),
    office: z.string(),
    electionDate: z.string(),
    candidateSlugs: z.array(z.string()),
    pageTitle: z.string(),
    headline: z.string(),
    dek: z.string(),
    source: z.string(),
    sections: z.object({
      geo: z.object({
        heading: z.string(),
        sub: z.string(),
        chart: chartConfig,
        orientation: z.enum(['vertical', 'horizontal']).optional(),
        height: z.string().optional(),
        legend: z.array(z.object({
          label: z.string(),
          color: z.string(),
        })).optional(),
        datalabelColor: z.string().optional(),
        tickSize: z.number().optional(),
      }),
      stats: z.object({
        heading: z.string(),
        sub: z.string(),
        cards: z.array(z.object({
          variant: z.string(),
          label: z.string(),
          value: z.string(),
          valueClass: z.string(),
        })),
      }).optional(),
      occupation: z.object({
        heading: z.string(),
        sub: z.string(),
        chart: chartConfig,
        height: z.string().optional(),
        legend: z.array(z.object({
          label: z.string(),
          color: z.string(),
        })).optional(),
        datalabelColor: z.string().optional(),
      }),
      contrast: z.object({
        heading: z.string(),
        sub: z.string(),
        chart: chartConfig.extend({
          tickSize: z.number().optional(),
        }),
        height: z.string().optional(),
        legend: z.array(z.object({
          label: z.string(),
          color: z.string(),
        })).optional(),
      }).optional(),
    }),
    csvFiles: z.array(z.object({
      label: z.string(),
      file: z.string(),
      filename: z.string(),
    })),
    callouts: z.array(z.object({
      number: z.string(),
      title: z.string(),
      body: z.string(),
      accent: z.string().optional(),
    })),
    footnotes: z.array(z.object({
      number: z.number(),
      body: z.string(),
    })),
  }),
});

const candidates = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/candidates' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    office: z.string(),
    raceSlug: z.string(),
    // Sprint 2 fields -- all optional, do not tighten without checking with Aaron
    shortBio: z.string().optional(),
    keyPositions: z.array(z.string()).optional(),
    endorsements: z.array(z.string()).optional(),
    sourcesConsulted: z.array(z.string()).optional(),
    website: z.string().optional(),
    photoSrc: z.string().optional(),
  }),
});

export const collections = { races, candidates };
