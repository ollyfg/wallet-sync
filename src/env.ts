import { z } from "zod";

export const RuntimeEnv = z.object({
  WALLET_ACCOUNT_NUMBER: z.string(),
  WALLET_ACCOUNT_NAME: z.string(),
  WALLET_AKAHU_ID: z.string(),
  BANK_AKAHU_ID: z.string(),
});
export type RuntimeEnv = z.infer<typeof RuntimeEnv>;

let cachedRuntimeEnv: RuntimeEnv | undefined;
export const runtimeEnv = new Proxy({} as RuntimeEnv, {
  get(_, prop) {
    if (!cachedRuntimeEnv) {
      cachedRuntimeEnv = RuntimeEnv.parse(
        Object.fromEntries(
          Object.keys(RuntimeEnv.shape).map((name) => [name, process.env[name]])
        )
      );
    }
    return cachedRuntimeEnv[prop];
  },
});

export const AkahuEnv = z.object({
  AKAHU_APP_TOKEN: z.string(),
  AKAHU_USER_TOKEN: z.string(),
});
export type AkahuEnv = z.infer<typeof AkahuEnv>;

let cachedAkahuEnv: AkahuEnv | undefined;
export const akahuEnv = new Proxy({} as AkahuEnv, {
  get(_, prop) {
    if (!cachedAkahuEnv) {
      cachedAkahuEnv = AkahuEnv.parse(
        Object.fromEntries(
          Object.keys(AkahuEnv.shape).map((name) => [name, process.env[name]])
        )
      );
    }
    return cachedAkahuEnv[prop];
  },
});
