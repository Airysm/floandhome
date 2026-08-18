"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/dal";
import { revalidatePath } from "next/cache";

export type TxFormState = { error?: string; success?: boolean } | undefined;

export async function createTransaction(
  _prevState: TxFormState,
  formData: FormData
): Promise<TxFormState> {
  const profile = await getProfile();

  const productId = String(formData.get("product_id") ?? "");
  const type = String(formData.get("type") ?? "");
  const rawQty = Math.abs(Number(formData.get("quantity") ?? 0));
  const direction = String(formData.get("direction") ?? "plus");
  const memo = String(formData.get("memo") ?? "").trim();

  if (!productId) return { error: "상품을 선택해주세요." };
  if (!rawQty) return { error: "수량을 입력해주세요." };
  if (type !== "in" && type !== "sale" && type !== "adjust") {
    return { error: "유형을 선택해주세요." };
  }

  const supabase = await createClient();

  let signedQty = rawQty;
  let unitPrice: number | null = null;
  let revenue: number | null = null;

  if (type === "in") {
    signedQty = rawQty;
  } else if (type === "sale") {
    signedQty = -rawQty;
    const { data: product } = await supabase
      .from("products")
      .select("price")
      .eq("id", productId)
      .single();
    unitPrice = product?.price ?? 0;
    revenue = rawQty * (unitPrice ?? 0);
  } else {
    signedQty = direction === "minus" ? -rawQty : rawQty;
  }

  const { error } = await supabase.from("transactions").insert({
    product_id: productId,
    type,
    quantity: signedQty,
    unit_price: unitPrice,
    revenue,
    memo: memo || null,
    created_by: profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/stock");
  revalidatePath("/history");
  revalidatePath("/sales");
  return { success: true };
}
