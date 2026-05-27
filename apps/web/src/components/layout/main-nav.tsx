"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Database, Home, LineChart, MapPinned, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/dashboard", label: "대시보드", icon: BarChart3 },
  { href: "/stores", label: "상가 목록", icon: Store },
  { href: "/analysis", label: "상권 분석", icon: LineChart },
  { href: "/map", label: "지도", icon: MapPinned },
  { href: "/api-setup", label: "API 설정", icon: Database },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요 메뉴" className="overflow-x-auto">
      <ul className="flex min-w-max items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 outline-none transition hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-3 focus-visible:ring-teal-500/30",
                  isActive && "bg-slate-950 text-white hover:bg-slate-900 hover:text-white",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
