import { createClient } from "@/lib/supabase/server";
import { StockForm } from "@/components/stock-form";

export default async function StockPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name");

  const list = products ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">입출고 등록</h1>
      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
          등록된 상품이 없어요. 상품관리에서 먼저 상품을 추가해주세요.
        </p>
      ) : (
        <StockForm products={list} />
      )}
    </div>
  );
}
