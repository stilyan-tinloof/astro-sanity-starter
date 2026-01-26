/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Workers Cache API global
declare const caches: { default: Cache } | undefined;

interface Env {
  PUBLIC_SANITY_PROJECT_ID: string;
  PUBLIC_SANITY_DATASET: string;
  SANITY_TOKEN: string;
  CF_ZONE_ID: string;
  CF_API_TOKEN: string;
  PURGE_SECRET: string;
  ASSETS: Fetcher;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
