/**
 * setup-resend-welcome.ts
 *
 * ONE-TIME SETUP SCRIPT. DO NOT RE-RUN.
 *
 * Creates, in Resend:
 *   1. An event named "contact.welcome" (schema: source_page_path, zip).
 *   2. A template with alias "welcome-torrance-watch", published in a single
 *      chained call (templates.create({...}).publish()).
 *   3. An automation named "Welcome series" (trigger on contact.welcome -> send
 *      the template).
 *
 * Re-running will fail on the duplicate template alias and create a second
 * automation. If you need to re-run, first delete the existing template and
 * automation in the Resend dashboard.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx npx tsx scripts/setup-resend-welcome.ts
 *
 * (Node 22+ with tsx. The repo does not ship dotenv; pass the key inline or
 * export it in your shell. In production, RESEND_API_KEY is provided via
 * Wrangler vars — this script is local-only.)
 */

import { Resend } from 'resend';

const TEMPLATE_NAME = 'Welcome — Torrance Watch';
const TEMPLATE_ALIAS = 'welcome-torrance-watch';
const AUTOMATION_NAME = 'Welcome series';
const EVENT_NAME = 'contact.welcome';

const FROM = 'Torrance Watch <hello@civic.torrancewatch.org>';
const REPLY_TO = 'hello@torrancewatch.org';
const SUBJECT = 'Welcome to Torrance Watch';

const WELCOME_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Welcome to Torrance Watch</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF9F6;color:#1a1a1a;font-family:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;">
  <div style="background-color:#FAF9F6;padding:32px 16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background-color:#FAF9F6;">
      <tr>
        <td style="padding:0 0 20px 0;">
          <div style="height:3px;width:48px;background-color:#C0392B;margin-bottom:16px;line-height:0;font-size:0;">&nbsp;</div>
          <h1 style="margin:0;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;line-height:1.2;color:#1a1a1a;letter-spacing:-0.01em;">Welcome to Torrance Watch</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 12px 0;color:#1a1a1a;font-size:16px;line-height:1.65;font-family:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          Hi {{{FIRST_NAME}}},
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 16px 0;color:#1a1a1a;font-size:16px;line-height:1.65;font-family:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          Thanks for signing up. We started Torrance Watch because local government is hard to follow, even when you want to pay attention. Who's on council, what they're voting on, who's funding the next election, what's actually in the city budget. We're building the reference we wished existed.
        </td>
      </tr>
      <tr>
        <td style="padding:4px 0 8px 0;color:#1a1a1a;font-size:16px;line-height:1.65;font-family:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          Here's what's coming next:
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 16px 0;color:#1a1a1a;font-size:16px;line-height:1.65;font-family:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          <ul style="margin:0;padding:0 0 0 22px;">
            <li style="margin:0 0 6px 0;">Q1 '26 fundraising numbers for every race</li>
            <li style="margin:0 0 6px 0;">Cleaner charts that make it easier to compare candidates</li>
            <li style="margin:0 0 6px 0;">Candidate pages with the context the filings don't show</li>
            <li style="margin:0;">A plain-English guide to how to vote in Torrance on June 2</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 16px 0;color:#1a1a1a;font-size:16px;line-height:1.65;font-family:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          We're starting with the June 2 election and building from there.
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 20px 0;color:#1a1a1a;font-size:16px;line-height:1.65;font-family:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          One ask: hit reply and tell us what you'd want to see. If any of it's useful, send it to a neighbor who should know.
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 32px 0;color:#1a1a1a;font-size:16px;line-height:1.65;font-family:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          The Torrance Watch team
        </td>
      </tr>
      <tr>
        <td style="padding:20px 0 0 0;border-top:1px solid #e0ddd6;color:#888;font-size:12px;line-height:1.6;font-family:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          You received this email because you signed up at <a href="https://torrancewatch.org" style="color:#C0392B;text-decoration:none;">torrancewatch.org</a>. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#888;text-decoration:underline;">Unsubscribe</a>.
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

const WELCOME_TEXT = `Welcome to Torrance Watch

Hi {{{FIRST_NAME}}},

Thanks for signing up. We started Torrance Watch because local government is hard to follow, even when you want to pay attention. Who's on council, what they're voting on, who's funding the next election, what's actually in the city budget. We're building the reference we wished existed.

Here's what's coming next:
- Q1 '26 fundraising numbers for every race
- Cleaner charts that make it easier to compare candidates
- Candidate pages with the context the filings don't show
- A plain-English guide to how to vote in Torrance on June 2

We're starting with the June 2 election and building from there.

One ask: hit reply and tell us what you'd want to see. If any of it's useful, send it to a neighbor who should know.

The Torrance Watch team

Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}
`;

async function main(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set. Run with: RESEND_API_KEY=re_xxx npx tsx scripts/setup-resend-welcome.ts');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  // 1. Register the event schema. If the event already exists, Resend returns
  //    an error — treat that as non-fatal so the rest of the script can run.
  console.log(`Registering event "${EVENT_NAME}"...`);
  const eventRes = await resend.events.create({
    name: EVENT_NAME,
    schema: {
      source_page_path: 'string',
      zip: 'string',
    },
  });
  if (eventRes.error) {
    console.warn(`  event.create returned an error (likely already exists): ${eventRes.error.message}`);
  } else {
    console.log(`  event id: ${eventRes.data?.id}`);
  }

  // 2. Create and publish the template in a single chained call.
  console.log(`Creating template "${TEMPLATE_ALIAS}" and publishing...`);
  const publishRes = await resend.templates
    .create({
      name: TEMPLATE_NAME,
      alias: TEMPLATE_ALIAS,
      subject: SUBJECT,
      from: FROM,
      replyTo: REPLY_TO,
      html: WELCOME_HTML,
      text: WELCOME_TEXT,
    })
    .publish();

  if (publishRes.error || !publishRes.data) {
    console.error('  template create/publish failed:', publishRes.error);
    process.exit(1);
  }
  const templateId = publishRes.data.id;
  console.log(`  template id: ${templateId}`);

  // 3. Create the automation. Trigger on contact.welcome -> send the template.
  console.log(`Creating automation "${AUTOMATION_NAME}"...`);
  const automationRes = await resend.automations.create({
    name: AUTOMATION_NAME,
    status: 'enabled',
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
          template: { id: templateId },
        },
      },
    ],
    connections: [
      { from: 'trigger', to: 'send_welcome', type: 'default' },
    ],
  });

  if (automationRes.error || !automationRes.data) {
    console.error('  automation create failed:', automationRes.error);
    process.exit(1);
  }
  const automationId = automationRes.data.id;
  console.log(`  automation id: ${automationId}`);

  console.log('\nDone.');
  console.log(`  template_id:   ${templateId}`);
  console.log(`  automation_id: ${automationId}`);
  console.log(`  event_name:    ${EVENT_NAME}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
