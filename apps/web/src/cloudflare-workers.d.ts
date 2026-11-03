declare module "cloudflare:workers" {
  interface CallerRateLimit {
    readonly limit: (options: {
      readonly key: string;
    }) => Promise<{ readonly success: boolean }>;
  }

  export const env: {
    readonly BACKEND: {
      readonly fetch: (request: Request) => Promise<Response>;
    };
    readonly MESSAGE_LIMIT: CallerRateLimit;
    readonly SCAN_LIMIT: CallerRateLimit;
  };
}
