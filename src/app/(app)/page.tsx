import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todaySales } = await supabase
    .from("transactions")
    .select("quantity, revenue")
    .eq("type", "sale")
    .gte("created_at", todayStart.toISOString());

  const todayQty = (todaySales ?? []).reduce(
    (sum, t) => sum + Math.abs(t.quantity),
    0
  );
  const todayRevenue = (todaySales ?? []).reduce(
    (sum, t) => sum + (t.revenue ?? 0),
    0
  );

  const list = products ?? [];
  const lowStock = list.filter((p) => p.stock <= p.min_stock);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-900 p-4 text-white">
          <p className="text-xs opacity-70">오늘 판매량</p>
          <p className="mt-1 text-2xl font-bold">{todayQty}</p>
        </div>
        <div className="rounded-xl bg-gray-900 p-4 text-white">
          <p className="text-xs opacity-70">오늘 매출</p>
          <p className="mt-1 text-2xl font-bold">
            {todayRevenue.toLocaleString()}원
          </p>
        </div>
      </section>

      {lowStock.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-red-600">
            재고 부족 ({lowStock.length})
          </h2>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2"
              >
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-sm text-red-600">
                  {p.stock}
                  {p.unit} (최소 {p.min_stock}
                  {p.unit})
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">전체 재고</h2>
          <Link href="/stock" className="text-xs text-gray-500">
            입출고 등록 →
          </Link>
        </div>
        {list.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
            등록된 상품이 없어요. 상품관리에서 추가해주세요.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {list.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  {p.category && (
                    <p className="text-xs text-gray-400">{p.category}</p>
                  )}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    p.stock <= p.min_stock ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {p.stock}
                  {p.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
