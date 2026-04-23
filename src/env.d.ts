/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        RESEND_API_KEY: string;
      };
    };
  }
}
