import type { APIContext } from 'astro';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';
import { NEWSLETTER_TOPIC_ID } from '../../data/site';

export const prerender = false;

type FieldMap = Record<string, string>;

const ALLOWED_SOURCES = new Set<string>([
  'Word of mouth',
  'Social media',
  'Search',
  'News article or blog',
  'Community meeting or event',
  'Email from someone',
  'Other',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_RE = /^\d{5}(-\d{4})?$/;

async function parseBody(
  request: Request,
): Promise<{ fields: FieldMap; wantsRedirect: boolean }> {
  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    const json = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const fields: FieldMap = {};
    for (const [k, v] of Object.entries(json)) {
      fields[k] = v == null ? '' : String(v);
    }
    return { fields, wantsRedirect: false };
  }
  // application/x-www-form-urlencoded or multipart/form-data
  const form = await request.formData();
  const fields: FieldMap = {};
  form.forEach((value, key) => {
    fields[key] = typeof value === 'string' ? value : '';
  });
  return { fields, wantsRedirect: true };
}

type ValidationResult =
  | { ok: true; clean: {
      first_name: string;
      last_name: string;
      email: string;
      zip: string;
      source_self_reported: string;
      source_page_path: string;
    } }
  | { ok: false; field: string; message: string };

function validate(fields: FieldMap): ValidationResult {
  const first_name = (fields.first_name || '').trim();
  if (first_name.length < 1) {
    return { ok: false, field: 'first_name', message: 'Please enter your first name.' };
  }
  if (first_name.length > 100) {
    return { ok: false, field: 'first_name', message: 'First name is too long.' };
  }

  const last_name = (fields.last_name || '').trim();
  if (last_name.length < 1) {
    return { ok: false, field: 'last_name', message: 'Please enter your last name.' };
  }
  if (last_name.length > 100) {
    return { ok: false, field: 'last_name', message: 'Last name is too long.' };
  }

  const rawEmail = (fields.email || '').trim();
  if (rawEmail.length < 1) {
    return { ok: false, field: 'email', message: 'Please enter your email.' };
  }
  if (rawEmail.length > 254 || !EMAIL_RE.test(rawEmail)) {
    return { ok: false, field: 'email', message: 'Please enter a valid email.' };
  }
  const email = rawEmail.toLowerCase();

  const zip = (fields.zip || '').trim();
  if (zip && !ZIP_RE.test(zip)) {
    return { ok: false, field: 'zip', message: 'Zip must be 5 digits (or ZIP+4).' };
  }

  const source_self_reported = (fields.source_self_reported || '').trim();
  if (source_self_reported && !ALLOWED_SOURCES.has(source_self_reported)) {
    return {
      ok: false,
      field: 'source_self_reported',
      message: 'Please pick an option from the list.',
    };
  }

  const source_page_path = (fields.source_page_path || '').trim();
  if (source_page_path) {
    if (source_page_path.length > 500 || !source_page_path.startsWith('/')) {
      return {
        ok: false,
        field: 'source_page_path',
        message: 'Invalid source path.',
      };
    }
  }

  return {
    ok: true,
    clean: {
      first_name,
      last_name,
      email,
      zip,
      source_self_reported,
      source_page_path,
    },
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function successResponse(wantsRedirect: boolean, url: URL): Response {
  if (wantsRedirect) {
    return Response.redirect(new URL('/subscribed', url), 303);
  }
  return jsonResponse(200, { ok: true });
}

function validationErrorResponse(
  wantsRedirect: boolean,
  field: string,
  message: string,
): Response {
  if (wantsRedirect) {
    return new Response(`${message} (field: ${field})`, {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  return jsonResponse(400, { ok: false, error: 'validation', field, message });
}

function serverErrorResponse(wantsRedirect: boolean): Response {
  const message = 'Something went wrong. Please try again.';
  if (wantsRedirect) {
    return new Response(message, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  return jsonResponse(500, { ok: false, error: 'server', message });
}

function isDuplicateContactError(err: {
  name?: string;
  statusCode?: number | null;
  message?: string;
} | null | undefined): boolean {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('already exists') || msg.includes('duplicate')) return true;
  if (err.name === 'validation_error' && err.statusCode === 422) {
    // Best-effort: Resend returns validation_error/422 on duplicate create.
    // Keep the message check above as the tighter signal.
    return true;
  }
  return false;
}

export async function POST(context: APIContext): Promise<Response> {
  const { request, url } = context;

  let parsed: { fields: FieldMap; wantsRedirect: boolean };
  try {
    parsed = await parseBody(request);
  } catch (err) {
    console.error('[signup] body parse failed', err);
    return jsonResponse(400, {
      ok: false,
      error: 'validation',
      field: '',
      message: 'Could not parse request body.',
    });
  }
  const { fields, wantsRedirect } = parsed;

  // Honeypot: any non-empty website value = bot. Return success without writing.
  if ((fields.website || '').trim() !== '') {
    console.info('[signup] honeypot triggered, skipping Resend call');
    return successResponse(wantsRedirect, url);
  }

  const result = validate(fields);
  if (!result.ok) {
    return validationErrorResponse(wantsRedirect, result.field, result.message);
  }
  const clean = result.clean;

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[signup] RESEND_API_KEY not configured');
    return serverErrorResponse(wantsRedirect);
  }

  const resend = new Resend(apiKey);

  const properties: Record<string, string> = {
    signup_at: new Date().toISOString(),
  };
  if (clean.zip) properties.zip = clean.zip;
  if (clean.source_self_reported) properties.source_self_reported = clean.source_self_reported;
  if (clean.source_page_path) properties.source_page_path = clean.source_page_path;

  const createResult = await resend.contacts.create({
    email: clean.email,
    firstName: clean.first_name,
    lastName: clean.last_name,
    unsubscribed: false,
    properties,
    topics: [{ id: NEWSLETTER_TOPIC_ID, subscription: 'opt_in' }],
  });

  if (!createResult.error) {
    return successResponse(wantsRedirect, url);
  }

  if (isDuplicateContactError(createResult.error)) {
    const updateResult = await resend.contacts.update({
      email: clean.email,
      firstName: clean.first_name,
      lastName: clean.last_name,
      unsubscribed: false,
      properties,
    });
    if (updateResult.error) {
      console.error('[signup] duplicate update failed', updateResult.error);
      return serverErrorResponse(wantsRedirect);
    }

    const topicsResult = await resend.contacts.topics.update({
      email: clean.email,
      topics: [{ id: NEWSLETTER_TOPIC_ID, subscription: 'opt_in' }],
    });
    if (topicsResult.error) {
      console.error('[signup] duplicate topics update failed', topicsResult.error);
      return serverErrorResponse(wantsRedirect);
    }

    return successResponse(wantsRedirect, url);
  }

  console.error('[signup] resend create failed', {
    name: createResult.error.name,
    statusCode: createResult.error.statusCode,
    message: createResult.error.message,
  });
  return serverErrorResponse(wantsRedirect);
}
