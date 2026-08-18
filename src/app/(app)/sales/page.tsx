import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SalesChart, type DailySales } from "@/components/sales-chart";

const RANGE_OPTIONS = [
  { value: "7", label: "7일" },
  { value: "14", label: "14일" },
  { value: "30", label: "30일" },
];

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = range === "7" || range === "30" ? Number(range) : 14;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (days - 1));

  const supabase = await createClient();

  const [{ data: sales }, { data: products }] = await Promise.all([
    supabase
      .from("transactions")
      .select("quantity, revenue, created_at, product_id")
      .eq("type", "sale")
      .gte("created_at", startDate.toISOString()),
    supabase.from("products").select("id, name"),
  ]);

  const productNameById = new Map((products ?? []).map((p) => [p.id, p.name]));

  const buckets = new Map<string, { qty: number; revenue: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    buckets.set(toDateKey(d), { qty: 0, revenue: 0 });
  }

  const revenueByProduct = new Map<string, number>();

  for (const sale of sales ?? []) {
    const key = toDateKey(new Date(sale.created_at));
    const bucket = buckets.get(key);
    const qty = Math.abs(sale.quantity);
    const revenue = sale.revenue ?? 0;
    if (bucket) {
      bucket.qty += qty;
      bucket.revenue += revenue;
    }
    revenueByProduct.set(
      sale.product_id,
      (revenueByProduct.get(sale.product_id) ?? 0) + revenue
    );
  }

  const chartData: DailySales[] = Array.from(buckets.entries()).map(
    ([date, v]) => ({
      date,
      label: `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`,
      qty: v.qty,
      revenue: v.revenue,
    })
  );

  const totalQty = chartData.reduce((s, d) => s + d.qty, 0);
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);

  const topProducts = Array.from(revenueByProduct.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, revenue]) => ({
      name: productNameById.get(productId) ?? "삭제된 상품",
      revenue,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">매출 현황</h1>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 text-xs">
          {RANGE_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/sales?range=${opt.value}`}
              className={`rounded-md px-2.5 py-1 font-medium ${
                days === Number(opt.value)
                  ? "bg-white shadow"
                  : "text-gray-500"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">기간 판매량</p>
          <p className="mt-1 text-xl font-bold">{totalQty}</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">기간 매출</p>
          <p className="mt-1 text-xl font-bold">{totalRevenue.toLocaleString()}원</p>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">일별 매출</h2>
        <SalesChart data={chartData} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">인기 상품 TOP 5</h2>
        {topProducts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
            이 기간에는 판매 기록이 없어요.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {topProducts.map((p, i) => (
              <div key={p.name + i} className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm">
                  <span className="mr-2 text-gray-400">{i + 1}</span>
                  {p.name}
                </span>
                <span className="text-sm font-semibold">{p.revenue.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
