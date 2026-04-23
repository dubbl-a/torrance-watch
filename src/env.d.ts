/// <reference types="astro/client" />

declare module 'cloudflare:workers' {
  interface Env {
    RESEND_API_KEY: string;
  }
}
