import { describe, expect, it } from "vitest";
import { QWEN_36_PLUS_MODEL_ID, QWEN_BASE_URL, QWEN_STANDARD_GLOBAL_BASE_URL } from "./api.js";
import qwenPlugin from "./index.js";

type RegisteredQwenProvider = {
  normalizeConfig?: (ctx: {
    provider: string;
    providerConfig: {
      baseUrl?: string;
      models?: Array<{ id: string }>;
    };
  }) =>
    | {
        baseUrl?: string;
        models?: Array<{ id: string }>;
      }
    | null
    | undefined;
  suppressBuiltInModel?: (ctx: {
    provider: string;
    modelId: string;
    baseUrl?: string;
    config?: unknown;
  }) =>
    | {
        suppress?: boolean;
        errorMessage?: string;
      }
    | null
    | undefined;
};

function registerQwenProviderForTest(): RegisteredQwenProvider {
  let provider: RegisteredQwenProvider | undefined;
  qwenPlugin.register?.({
    registerProvider: (next: RegisteredQwenProvider) => {
      provider = next;
    },
    registerMediaUnderstandingProvider: () => {},
    registerVideoGenerationProvider: () => {},
  } as never);
  if (!provider) {
    throw new Error("Qwen provider was not registered");
  }
  return provider;
}

describe("qwen provider policy", () => {
  it("keeps qwen3.6-plus out of Coding Plan normalized catalogs", () => {
    const provider = registerQwenProviderForTest();

    const normalized = provider.normalizeConfig?.({
      provider: "qwen",
      providerConfig: {
        baseUrl: QWEN_BASE_URL,
        models: [{ id: "qwen3.5-plus" }, { id: QWEN_36_PLUS_MODEL_ID }],
      },
    });

    expect(normalized?.models?.map((model) => model.id)).toEqual(["qwen3.5-plus"]);
  });

  it("suppresses implicit qwen3.6-plus only on Coding Plan endpoints", () => {
    const provider = registerQwenProviderForTest();

    expect(
      provider.suppressBuiltInModel?.({
        provider: "qwen",
        modelId: QWEN_36_PLUS_MODEL_ID,
        baseUrl: QWEN_BASE_URL,
      }),
    ).toMatchObject({ suppress: true });
    expect(
      provider.suppressBuiltInModel?.({
        provider: "qwen",
        modelId: QWEN_36_PLUS_MODEL_ID,
        baseUrl: QWEN_STANDARD_GLOBAL_BASE_URL,
      }),
    ).toBeUndefined();
  });
});
