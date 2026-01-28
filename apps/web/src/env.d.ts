/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Workers Cache API global
declare const caches: { default: Cache } | undefined;

// Cloudflare Workers ExecutionContext (used for waitUntil)
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface Env {
  PUBLIC_SANITY_PROJECT_ID: string;
  PUBLIC_SANITY_DATASET: string;
  SANITY_TOKEN: string;
  CF_ZONE_ID: string;
  CF_API_TOKEN: string;
  ASSETS: Fetcher;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
