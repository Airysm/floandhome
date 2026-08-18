import { createClient } from "@/lib/supabase/server";

const typeLabels: Record<string, string> = {
  in: "입고",
  sale: "판매",
  adjust: "조정",
};

const typeStyles: Record<string, string> = {
  in: "bg-blue-50 text-blue-600",
  sale: "bg-green-50 text-green-600",
  adjust: "bg-amber-50 text-amber-600",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, products(name, unit), profiles(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const list = transactions ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">입출고 이력</h1>
      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
          아직 기록이 없어요.
        </p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
          {list.map((t) => {
            const product = t.products as unknown as { name: string; unit: string } | null;
            const actor = t.profiles as unknown as { name: string } | null;
            return (
              <div key={t.id} className="flex items-center justify-between px-3 py-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${typeStyles[t.type]}`}
                    >
                      {typeLabels[t.type]}
                    </span>
                    <span className="text-sm font-medium">
                      {product?.name ?? "삭제된 상품"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(t.created_at).toLocaleString("ko-KR", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {actor?.name ? ` · ${actor.name}` : ""}
                    {t.memo ? ` · ${t.memo}` : ""}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    t.quantity < 0 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {t.quantity > 0 ? "+" : ""}
                  {t.quantity}
                  {product?.unit ?? ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
