import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Gamepad2, LayoutGrid, DoorOpen, Settings, CircleAlert } from "lucide-react";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/admin")({
	component: AdminLayout,
});

// 5 = mock open issue count shown in sidebar badge
const OPEN_ISSUES = 5;

const NAV = [
	{ to: "/admin/lobbies", label: "Lobbies", icon: LayoutGrid, badge: null },
	{ to: "/admin/games", label: "Games", icon: Gamepad2, badge: null },
	{ to: "/admin/rooms", label: "Rooms", icon: DoorOpen, badge: null },
	{ to: "/admin/issues", label: "Issues", icon: CircleAlert, badge: OPEN_ISSUES },
];

function AdminLayout() {
	return (
		<div className="flex h-screen overflow-hidden bg-[#0c0c0e] text-white">
			{/* sidebar */}
			<aside className="flex w-56 shrink-0 flex-col border-r border-white/[0.06]">
				{/* brand */}
				<div className="flex items-center gap-2.5 px-5 py-5">
					<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
						<Gamepad2 className="h-4 w-4 text-black" />
					</div>
					<span className="text-sm font-semibold tracking-tight">
						Party Games
					</span>
				</div>

				<div className="px-3 pb-2">
					<p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/20">
						Admin
					</p>
				</div>

				{/* nav */}
				<nav className="flex-1 space-y-0.5 px-3">
					{NAV.map(({ to, label, icon: Icon, badge }) => (
						<Link
							key={to}
							to={to}
							className={cn(
								"flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
								"text-zinc-400 hover:bg-white/[0.05] hover:text-white",
							)}
							activeProps={{
								className:
									"bg-white/[0.08] text-white font-medium hover:bg-white/[0.08]",
							}}
						>
							<Icon className="h-4 w-4 shrink-0" />
							<span className="flex-1">{label}</span>
							{badge != null && (
								<span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-red-400">
									{badge}
								</span>
							)}
						</Link>
					))}
				</nav>

				{/* footer */}
				<div className="border-t border-white/[0.06] p-3">
					<button
						type="button"
						className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-white"
					>
						<Settings className="h-4 w-4" />
						Settings
					</button>
				</div>
			</aside>

			{/* main */}
			<main className="flex-1 overflow-y-auto">
				<Outlet />
			</main>
		</div>
	);
}
