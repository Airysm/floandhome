import { getProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { ProductManager } from "@/components/product-manager";

export default async function ProductsPage() {
  const profile = await getProfile();

  if (profile.role !== "owner") {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
        상품 관리는 사장만 이용할 수 있어요.
      </p>
    );
  }

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">상품 관리</h1>
      <ProductManager products={products ?? []} />
    </div>
  );
}
