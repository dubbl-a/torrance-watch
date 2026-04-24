/**
 * inspect-resend-automation.ts
 *
 * Read-only diagnostic: lists every automation and every custom event in the
 * Resend account so we can verify the live "Welcome series" trigger is
 * actually wired to the `contact.welcome` event that signup.ts fires.
 *
 * No writes. Safe to run repeatedly.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx npx tsx scripts/inspect-resend-automation.ts
 *
 * Optional: pass --send-test <email> as the second positional arg to fire a
 * diagnostic `contact.welcome` event at that address and print the result.
 * Only do this with an inbox you control.
 *
 *   RESEND_API_KEY=re_xxx npx tsx scripts/inspect-resend-automation.ts --send-test you@example.com
 */

import { Resend } from 'resend';

const EXPECTED_EVENT_NAME = 'contact.welcome';
const EXPECTED_AUTOMATION_NAME = 'Welcome series';

function header(label: string): void {
  console.log(`\n=== ${label} ===`);
}

async function main(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set.');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  // 1. List all automations. The list endpoint returns summary fields only
  //    (id, name, status), so we follow up with get() on each to inspect the
  //    trigger config.
  header('Automations (list)');
  const listRes = await resend.automations.list({ limit: 100 });
  if (listRes.error || !listRes.data) {
    console.error('automations.list failed:', listRes.error);
    process.exit(1);
  }
  const automations = listRes.data.data;
  console.log(`Found ${automations.length} automation(s).`);
  for (const a of automations) {
    console.log(`  - ${a.id}  status=${a.status}  name=${JSON.stringify(a.name)}`);
  }

  header('Automations (detail)');
  const matches: Array<{ id: string; name: string; status: string; triggerEventName: string | null; enabled: boolean }> = [];
  for (const summary of automations) {
    const detailRes = await resend.automations.get(summary.id);
    if (detailRes.error || !detailRes.data) {
      console.error(`  automations.get(${summary.id}) failed:`, detailRes.error);
      continue;
    }
    const d = detailRes.data;
    const triggerStep = d.steps.find((s) => s.type === 'trigger');
    const triggerEventName =
      triggerStep && typeof triggerStep.config === 'object' && triggerStep.config !== null
        ? (triggerStep.config as Record<string, unknown>).eventName ??
          (triggerStep.config as Record<string, unknown>).event_name ??
          null
        : null;

    console.log(`\n  id=${d.id}`);
    console.log(`  name=${JSON.stringify(d.name)}`);
    console.log(`  status=${d.status}`);
    console.log(`  steps:`);
    for (const s of d.steps) {
      console.log(`    - key=${s.key}  type=${s.type}  config=${JSON.stringify(s.config)}`);
    }
    console.log(`  connections:`);
    for (const c of d.connections) {
      console.log(`    - ${c.from} -> ${c.to} (${c.type})`);
    }

    matches.push({
      id: d.id,
      name: d.name,
      status: d.status,
      triggerEventName: typeof triggerEventName === 'string' ? triggerEventName : null,
      enabled: d.status === 'enabled',
    });
  }

  // 2. Verdict on the Welcome series wiring.
  header('Welcome-series verdict');
  const welcomeMatches = matches.filter((m) => m.name === EXPECTED_AUTOMATION_NAME);
  if (welcomeMatches.length === 0) {
    console.log(`  NO automation named ${JSON.stringify(EXPECTED_AUTOMATION_NAME)} exists.`);
  } else {
    console.log(`  ${welcomeMatches.length} automation(s) named ${JSON.stringify(EXPECTED_AUTOMATION_NAME)}:`);
    for (const m of welcomeMatches) {
      const eventMatch = m.triggerEventName === EXPECTED_EVENT_NAME;
      console.log(
        `    - id=${m.id}  enabled=${m.enabled}  triggerEventName=${JSON.stringify(m.triggerEventName)}  matches expected? ${eventMatch}`,
      );
    }
    const enabledWithCorrectTrigger = welcomeMatches.filter(
      (m) => m.enabled && m.triggerEventName === EXPECTED_EVENT_NAME,
    );
    if (enabledWithCorrectTrigger.length === 0) {
      console.log(
        `  NO enabled automation has triggerEventName === ${JSON.stringify(EXPECTED_EVENT_NAME)}. This is the bug.`,
      );
    } else if (enabledWithCorrectTrigger.length > 1) {
      console.log(
        `  ${enabledWithCorrectTrigger.length} enabled automations share this trigger — both will fire on each signup.`,
      );
    } else {
      console.log(`  Exactly one enabled automation matches. Wiring looks correct from the config side.`);
    }
  }

  // 3. List all custom events and confirm contact.welcome is registered.
  header('Events (list)');
  const eventsRes = await resend.events.list({ limit: 100 });
  if (eventsRes.error || !eventsRes.data) {
    console.error('events.list failed:', eventsRes.error);
  } else {
    const events = eventsRes.data.data;
    console.log(`Found ${events.length} custom event(s).`);
    for (const e of events) {
      console.log(`  - ${e.id}  name=${JSON.stringify(e.name)}  schema=${JSON.stringify(e.schema)}`);
    }
    const welcomeEvent = events.find((e) => e.name === EXPECTED_EVENT_NAME);
    if (!welcomeEvent) {
      console.log(
        `  Event ${JSON.stringify(EXPECTED_EVENT_NAME)} is NOT registered. Automations in Resend match on event-name strings, so unregistered events may still fire — but if signup.ts is sending to an unknown event, Resend may silently accept and discard.`,
      );
    } else {
      console.log(`  Event ${JSON.stringify(EXPECTED_EVENT_NAME)} is registered with schema ${JSON.stringify(welcomeEvent.schema)}.`);
    }
  }

  // 4. Optional live test fire.
  const sendTestIdx = process.argv.indexOf('--send-test');
  if (sendTestIdx !== -1) {
    const testEmail = process.argv[sendTestIdx + 1];
    if (!testEmail || !testEmail.includes('@')) {
      console.error(`\n--send-test requires an email address.`);
      process.exit(1);
    }
    header(`Test fire -> ${testEmail}`);
    const sendRes = await resend.events.send({
      event: EXPECTED_EVENT_NAME,
      email: testEmail,
      payload: {
        source_page_path: '/diagnostic',
        zip: '90503',
      },
    });
    console.log('  data:', JSON.stringify(sendRes.data));
    console.log('  error:', JSON.stringify(sendRes.error));
    console.log(
      `\n  Wait ~30s then check: Resend dashboard -> Automations -> ${EXPECTED_AUTOMATION_NAME} -> Runs.`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
