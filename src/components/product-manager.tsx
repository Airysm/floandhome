"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { createProduct, deleteProduct, updateProduct } from "@/app/actions/products";
import type { Product } from "@/lib/supabase/types";

export function ProductManager({ products }: { products: Product[] }) {
  return (
    <div className="space-y-6">
      <AddProductForm />
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">상품 목록 ({products.length})</h2>
        {products.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
            등록된 상품이 없어요.
          </p>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddProductForm() {
  const [state, action, pending] = useActionState(createProduct, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-lg border border-gray-200 p-3">
      <p className="text-sm font-semibold">상품 추가</p>
      <div className="grid grid-cols-2 gap-2">
        <input name="name" placeholder="상품명" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input name="category" placeholder="카테고리" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input name="unit" placeholder="단위 (예: 개)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input name="price" type="number" min={0} step="any" placeholder="단가" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input name="stock" type="number" min={0} step="any" placeholder="시작 재고" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input name="min_stock" type="number" min={0} step="any" placeholder="최소 재고" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white disabled:opacity-50">
        {pending ? "추가 중..." : "추가"}
      </button>
    </form>
  );
}

function ProductRow({ product }: { product: Product }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category ?? "");
  const [unit, setUnit] = useState(product.unit);
  const [price, setPrice] = useState(product.price);
  const [minStock, setMinStock] = useState(product.min_stock);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await updateProduct(product.id, {
        name,
        category: category || null,
        unit,
        price,
        min_stock: minStock,
      });
      if (res.error) setError(res.error);
      else setEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm(`"${product.name}" 상품을 삭제할까요? 관련 이력도 함께 삭제돼요.`)) return;
    startTransition(async () => {
      const res = await deleteProduct(product.id);
      if (res.error) setError(res.error);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
        <div>
          <p className="text-sm font-medium">{product.name}</p>
          <p className="text-xs text-gray-400">
            {product.category ?? "카테고리 없음"} · 재고 {product.stock}
            {product.unit} · 단가 {product.price.toLocaleString()}원
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button onClick={() => setEditing(true)} className="rounded-md border border-gray-300 px-2 py-1">
            수정
          </button>
          <button onClick={handleDelete} disabled={pending} className="rounded-md border border-red-300 px-2 py-1 text-red-600">
            삭제
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-gray-300 p-3">
      <div className="grid grid-cols-2 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="상품명" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="카테고리" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="단위" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input value={price} onChange={(e) => setPrice(Number(e.target.value))} type="number" min={0} step="any" placeholder="단가" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} type="number" min={0} step="any" placeholder="최소 재고" className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={pending} className="flex-1 rounded-lg bg-gray-900 py-2 text-sm font-medium text-white disabled:opacity-50">
          저장
        </button>
        <button onClick={() => setEditing(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm">
          취소
        </button>
      </div>
    </div>
  );
}
