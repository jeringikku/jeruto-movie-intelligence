import { supabase } from "@/lib/supabase";

export async function getMyJmiPlan(): Promise<string | null> {
  const { data, error } = await supabase.rpc("jmi_get_my_plan");

  if (error) {
    console.error("JMI plan lookup failed:", error);
    return null;
  }

  return data;
}

export async function hasJmiFeature(
  featureSlug: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc(
    "jmi_user_has_feature",
    {
      requested_feature_slug: featureSlug,
    }
  );

  if (error) {
    console.error(
      `JMI entitlement check failed for ${featureSlug}:`,
      error
    );

    return false;
  }

  return data === true;
}