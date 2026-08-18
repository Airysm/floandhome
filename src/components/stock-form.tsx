"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTransaction } from "@/app/actions/transactions";
import type { Product } from "@/lib/supabase/types";

const typeLabels: Record<string, string> = {
  in: "입고",
  sale: "판매",
  adjust: "조정",
};

export function StockForm({ products }: { products: Product[] }) {
  const [state, action, pending] = useActionState(createTransaction, undefined);
  const [type, setType] = useState<"in" | "sale" | "adjust">("sale");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const selected = products.find((p) => p.id === productId);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">상품</label>
        <select
          name="product_id"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (현재 {p.stock}
              {p.unit})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">유형</label>
        <div className="grid grid-cols-3 gap-2">
          {(["sale", "in", "adjust"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-lg border py-2 text-sm font-medium ${
                type === t
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      {type === "adjust" && (
        <div>
          <label className="mb-1 block text-sm font-medium">조정 방향</label>
          <select
            name="direction"
            defaultValue="plus"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
          >
            <option value="plus">늘리기 (+)</option>
            <option value="minus">줄이기 (-)</option>
          </select>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">
          수량{selected ? ` (${selected.unit})` : ""}
        </label>
        <input
          name="quantity"
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">메모 (선택)</label>
        <input
          name="memo"
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">저장했어요.</p>
      )}

      <button
        type="submit"
        disabled={pending || !productId}
        className="w-full rounded-lg bg-gray-900 py-2.5 font-medium text-white disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
