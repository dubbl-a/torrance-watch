/**
 * republish-resend-welcome.ts
 *
 * Updates the live "welcome-torrance-watch" template with new HTML + text,
 * then publishes. Re-runnable: editing a published template creates a new
 * draft; the publish call flips the draft live for future sends.
 *
 * The template literals here are kept in sync with the ones in
 * setup-resend-welcome.ts (the setup script is one-time and frozen; this
 * script is the living source for subsequent edits).
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx npx tsx scripts/republish-resend-welcome.ts
 */

import { Resend } from 'resend';

const TEMPLATE_ID = 'a15a5587-e199-40cb-9179-49d19b6cd4f8';

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
          Hi {{{FIRST}}},
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

Hi {{{FIRST}}},

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
    console.error('RESEND_API_KEY is not set.');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  console.log(`Updating template ${TEMPLATE_ID}...`);
  const updateRes = await resend.templates.update(TEMPLATE_ID, {
    html: WELCOME_HTML,
    text: WELCOME_TEXT,
    variables: [{ key: 'FIRST', type: 'string', fallbackValue: 'there' }],
  });
  if (updateRes.error) {
    console.error('  update failed:', updateRes.error);
    process.exit(1);
  }
  console.log('  draft updated.');

  console.log('Publishing...');
  const publishRes = await resend.templates.publish(TEMPLATE_ID);
  if (publishRes.error) {
    console.error('  publish failed:', publishRes.error);
    process.exit(1);
  }
  console.log(`  published. template id: ${publishRes.data?.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
