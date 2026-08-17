import { chatJSON, PROMPTS } from "./ai.server";

type Input = { moduleKey: "post" | "article" | "video"; headline: string; language: string };

export async function runGeneration(
  admin: any,
  userId: string,
  data: Input,
  source: "app" | "api",
) {
  const { data: rate } = await admin
    .from("module_rates")
    .select("credits, label")
    .eq("module_key", data.moduleKey)
    .maybeSingle();
  const cost: number = rate?.credits ?? 1;

  const { error: spendError } = await admin.rpc("spend_credits", {
    _user_id: userId,
    _amount: cost,
    _reason: `${data.moduleKey} generation`,
    _module_key: data.moduleKey,
    _meta: { headline: data.headline, source },
  });
  if (spendError) {
    if (String(spendError.message).includes("INSUFFICIENT_CREDITS")) {
      throw new Error("INSUFFICIENT_CREDITS");
    }
    throw new Error("Could not reserve credits");
  }

  const prompt = PROMPTS[data.moduleKey];

  try {
    const output = await chatJSON(prompt.system, prompt.user(data.headline, data.language));

    const { data: row, error } = await admin
      .from("generations")
      .insert({
        user_id: userId,
        module_key: data.moduleKey,
        headline: data.headline,
        language: data.language,
        output,
        credits_used: cost,
        source,
      })
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);

    return {
      id: row.id as string,
      created_at: row.created_at as string,
      module_key: data.moduleKey,
      credits_used: cost,
      output: JSON.stringify(output),
    };
  } catch (err) {
    // Auto-refund on upstream failure
    await admin.rpc("grant_credits", {
      _user_id: userId,
      _amount: cost,
      _reason: `refund: ${data.moduleKey} failed`,
      _meta: { headline: data.headline, source },
    });
    throw err instanceof Error ? err : new Error("Generation failed");
  }
}
