import { getProfile } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { NavBar } from "@/components/nav-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const isOwner = profile.role === "owner";

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <p className="font-bold">floandhome</p>
          <p className="text-xs text-gray-500">
            {profile.name} · {isOwner ? "사장" : "알바"}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600"
          >
            로그아웃
          </button>
        </form>
      </header>

      <main className="flex-1 px-4 pb-20 pt-4">{children}</main>

      <NavBar isOwner={isOwner} />
    </div>
  );
}
