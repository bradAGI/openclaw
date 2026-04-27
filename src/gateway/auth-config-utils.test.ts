import { describe, expect, it } from "vitest";
import {
  shouldResolveGatewayPasswordSecretRef,
  shouldResolveGatewayTokenSecretRef,
} from "./auth-config-utils.js";

describe("gateway auth config utils", () => {
  it("resolves trusted-proxy password SecretRefs but keeps token SecretRefs disabled", () => {
    const params = {
      mode: "trusted-proxy" as const,
      hasPasswordCandidate: false,
      hasTokenCandidate: false,
    };

    expect(shouldResolveGatewayPasswordSecretRef(params)).toBe(true);
    expect(shouldResolveGatewayTokenSecretRef(params)).toBe(false);
  });
});
