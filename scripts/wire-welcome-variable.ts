/**
 * wire-welcome-variable.ts
 *
 * One-time migration: adds first_name to the contact.welcome event schema,
 * and rewires the "Welcome series" automation's send_email step to pass
 * variables.FIRST = { var: 'first_name' } so the welcome template can
 * personalize the greeting.
 *
 * Context: the earlier template used {{{FIRST_NAME}}}, but Resend reserves
 * FIRST_NAME/LAST_NAME/EMAIL/UNSUBSCRIBE_URL/contact/this as variable names,
 * so the placeholder rendered literally. Renaming to {{{FIRST}}} + binding
 * it through the automation step is the supported path.
 *
 * Idempotent: events.update replaces the schema wholesale; automation.update
 * replaces steps wholesale; both are safe to re-run.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx npx tsx scripts/wire-welcome-variable.ts
 */

import { Resend } from 'resend';

const EVENT_NAME = 'contact.welcome';
const AUTOMATION_ID = '019dbcd7-4fe6-7135-9189-cdf410d9e07a';
const TEMPLATE_ID = 'a15a5587-e199-40cb-9179-49d19b6cd4f8';

async function main(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set.');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  console.log(`Updating event "${EVENT_NAME}" schema...`);
  const eventRes = await resend.events.update(EVENT_NAME, {
    schema: {
      first_name: 'string',
      source_page_path: 'string',
      zip: 'string',
    },
  });
  if (eventRes.error) {
    console.error('  events.update failed:', eventRes.error);
    process.exit(1);
  }
  console.log(`  ok. event id: ${eventRes.data?.id}`);

  console.log(`\nUpdating automation ${AUTOMATION_ID}...`);
  const autoRes = await resend.automations.update(AUTOMATION_ID, {
    steps: [
      {
        key: 'trigger',
        type: 'trigger',
        config: { eventName: EVENT_NAME },
      },
      {
        key: 'send_welcome',
        type: 'send_email',
        config: {
          template: {
            id: TEMPLATE_ID,
            variables: {
              FIRST: { var: 'event.first_name' },
            },
          },
        },
      },
    ],
    connections: [{ from: 'trigger', to: 'send_welcome', type: 'default' }],
  });
  if (autoRes.error) {
    console.error('  automations.update failed:', autoRes.error);
    process.exit(1);
  }
  console.log(`  ok. automation id: ${autoRes.data?.id}`);
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
