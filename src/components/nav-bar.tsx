"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/stock", label: "입출고", icon: "📦" },
  { href: "/sales", label: "매출", icon: "📈" },
  { href: "/history", label: "이력", icon: "🕒" },
];

const ownerItems = [{ href: "/products", label: "상품관리", icon: "🏷️" }];

export function NavBar({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  const links = isOwner ? [...items, ...ownerItems] : items;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {links.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
                active ? "text-gray-900 font-semibold" : "text-gray-400"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
