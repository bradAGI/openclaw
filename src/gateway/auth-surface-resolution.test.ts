import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/types.js";
import {
  resolveGatewayInteractiveSurfaceAuth,
  resolveGatewayProbeSurfaceAuth,
} from "./auth-surface-resolution.js";

describe("gateway auth surface resolution", () => {
  const trustedProxyPasswordConfig = {
    gateway: {
      auth: {
        mode: "trusted-proxy",
        trustedProxy: { userHeader: "x-forwarded-user" },
        password: "local-password",
      },
    },
  } as OpenClawConfig;

  it("uses local trusted-proxy password fallback for probe surfaces", async () => {
    await expect(
      resolveGatewayProbeSurfaceAuth({
        config: trustedProxyPasswordConfig,
        env: {} as NodeJS.ProcessEnv,
        surface: "local",
      }),
    ).resolves.toEqual({ password: "local-password" });
  });

  it("uses local trusted-proxy password fallback for interactive surfaces", async () => {
    await expect(
      resolveGatewayInteractiveSurfaceAuth({
        config: trustedProxyPasswordConfig,
        env: {} as NodeJS.ProcessEnv,
        surface: "local",
      }),
    ).resolves.toMatchObject({ password: "local-password" });
  });
});
