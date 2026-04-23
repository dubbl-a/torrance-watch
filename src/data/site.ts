export const siteUrl = 'https://torrancewatch.org';

export const siteName = 'Torrance Watch';

export const description =
  'Nonpartisan civic reference for the City of Torrance. Campaign finance data, candidate profiles, and voter resources for the June 2, 2026 municipal election.';

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Mayor', href: '/finance/2026/mayor-2026' },
  { label: 'District 1', href: '/finance/2026/district-1-2026' },
  { label: 'Treasurer', href: '/finance/2026/treasurer-2026' },
  { label: 'About', href: '/about' },
];

export const footerCopy =
  'Torrance Watch is an independent, nonpartisan civic project. It is not affiliated with any candidate, campaign, party, or political organization.';

export const contactEmail = 'hello@torrancewatch.org';

export const contactCopy =
  'Questions, corrections, or want to help keep this site going? We welcome feedback and volunteers.';

// Newsletter signup wired to /api/signup (Astro endpoint → Resend). Flip to
// false to hide the form without removing it.
export const SIGNUP_ENABLED = true;

export const SIGNUP_ENDPOINT = '/api/signup';

// Resend Topic ID for the "Civic Updates" topic.
export const NEWSLETTER_TOPIC_ID = '75ede5cf-c8ad-4b16-83ae-d1b34ca63723';
