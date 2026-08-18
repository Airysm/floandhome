"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/dal";
import { revalidatePath } from "next/cache";

export type ProductFormState = { error?: string; success?: boolean } | undefined;

function revalidateProductPaths() {
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/stock");
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const profile = await getProfile();
  if (profile.role !== "owner") {
    return { error: "사장만 상품을 추가할 수 있어요." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim() || "개";
  const price = Number(formData.get("price") ?? 0) || 0;
  const stock = Number(formData.get("stock") ?? 0) || 0;
  const minStock = Number(formData.get("min_stock") ?? 0) || 0;

  if (!name) {
    return { error: "상품명을 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    name,
    category: category || null,
    unit,
    price,
    stock,
    min_stock: minStock,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateProductPaths();
  return { success: true };
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    category: string | null;
    unit: string;
    price: number;
    min_stock: number;
  }
): Promise<{ error?: string }> {
  const profile = await getProfile();
  if (profile.role !== "owner") {
    return { error: "사장만 수정할 수 있어요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(data).eq("id", id);

  if (error) return { error: error.message };

  revalidateProductPaths();
  return {};
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const profile = await getProfile();
  if (profile.role !== "owner") {
    return { error: "사장만 삭제할 수 있어요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidateProductPaths();
  return {};
}
