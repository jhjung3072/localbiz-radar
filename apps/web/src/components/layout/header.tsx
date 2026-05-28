import Link from "next/link";
import { Radar } from "lucide-react";
import { MainNav } from "@/components/layout/main-nav";
import { AuthStatusButton } from "@/features/auth/components/auth-status-button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 rounded-md text-slate-950 outline-none transition focus-visible:ring-3 focus-visible:ring-teal-500/30"
          aria-label="LocalBiz Radar 홈"
        >
          <span className="flex size-9 items-center justify-center rounded-md bg-teal-600 text-white">
            <Radar className="size-5" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-normal">
            LocalBiz Radar
          </span>
        </Link>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <MainNav />
          <AuthStatusButton />
        </div>
      </div>
    </header>
  );
}
