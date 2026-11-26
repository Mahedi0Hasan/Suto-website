import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/* null when the keys are not set yet — the checkout then says so instead of crashing */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

export type OrderPayload = {
  name: string; phone: string; address: string; note: string;
  zone: "dhaka" | "outside"; lang: "en" | "bn";
  items: { id: string; size: string; qty: number }[];
};
export type OrderResult = { order_code: string; subtotal: number; delivery_fee: number; total: number };

export async function placeOrder(payload: OrderPayload): Promise<OrderResult> {
  if (!supabase) throw new Error("not_configured");
  const { data, error } = await supabase.rpc("suto_place_order", { payload });
  if (error) throw new Error(error.message);
  return data as OrderResult;
}
