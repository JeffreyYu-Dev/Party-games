import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowDownRight,
	ArrowUpRight,
	Pencil,
	Plus,
	Search,
	Trash2,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import { useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
} from "recharts";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/admin/lobbies")({
	component: LobbiesPage,
});

/* ── lobby data ────────────────────────────────────────────────────── */

const LOBBIES = [
	{
		id: "LBY-001",
		name: "Game Night Alpha",
		playerCount: 3,
		maxPlayers: 8,
		photo:
			"https://images.unsplash.com/photo-1511512578047-dfb367046420?w=120&h=120&auto=format&fit=crop",
		createdAt: "2h ago",
	},
	{
		id: "LBY-002",
		name: "Friday Brawl",
		playerCount: 8,
		maxPlayers: 8,
		photo:
			"https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=120&h=120&auto=format&fit=crop",
		createdAt: "5h ago",
	},
	{
		id: "LBY-003",
		name: "Casual Round",
		playerCount: 1,
		maxPlayers: 4,
		photo:
			"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=120&h=120&auto=format&fit=crop",
		createdAt: "1d ago",
	},
	{
		id: "LBY-004",
		name: "Tournament Qualifier",
		playerCount: 9,
		maxPlayers: 10,
		photo:
			"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&h=120&auto=format&fit=crop",
		createdAt: "1d ago",
	},
	{
		id: "LBY-005",
		name: "Weekend Warriors",
		playerCount: 5,
		maxPlayers: 6,
		photo:
			"https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&h=120&auto=format&fit=crop",
		createdAt: "2d ago",
	},
	{
		id: "LBY-006",
		name: "Night Owls",
		playerCount: 2,
		maxPlayers: 4,
		photo:
			"https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=120&h=120&auto=format&fit=crop",
		createdAt: "3d ago",
	},
];

type Lobby = (typeof LOBBIES)[number];

/* ── chart data ────────────────────────────────────────────────────── */

const CHART_7D = [
	{ t: "Mon", a: 14, b: 9 },
	{ t: "Tue", a: 22, b: 14 },
	{ t: "Wed", a: 18, b: 11 },
	{ t: "Thu", a: 31, b: 20 },
	{ t: "Fri", a: 45, b: 28 },
	{ t: "Sat", a: 52, b: 33 },
	{ t: "Sun", a: 38, b: 22 },
];

const CHART_30D = [
	{ t: "Jun 1", a: 12, b: 7 },
	{ t: "Jun 3", a: 18, b: 11 },
	{ t: "Jun 5", a: 15, b: 9 },
	{ t: "Jun 7", a: 24, b: 15 },
	{ t: "Jun 9", a: 30, b: 19 },
	{ t: "Jun 11", a: 22, b: 14 },
	{ t: "Jun 13", a: 28, b: 17 },
	{ t: "Jun 15", a: 41, b: 26 },
	{ t: "Jun 17", a: 35, b: 22 },
	{ t: "Jun 19", a: 48, b: 30 },
	{ t: "Jun 21", a: 52, b: 33 },
	{ t: "Jun 23", a: 44, b: 28 },
	{ t: "Jun 25", a: 39, b: 24 },
	{ t: "Jun 27", a: 55, b: 35 },
	{ t: "Jun 29", a: 47, b: 29 },
];

const CHART_3M = [
	{ t: "Apr 3", a: 20, b: 12 },
	{ t: "Apr 9", a: 35, b: 21 },
	{ t: "Apr 15", a: 28, b: 17 },
	{ t: "Apr 21", a: 42, b: 26 },
	{ t: "Apr 27", a: 38, b: 24 },
	{ t: "May 3", a: 55, b: 34 },
	{ t: "May 9", a: 48, b: 30 },
	{ t: "May 15", a: 63, b: 40 },
	{ t: "May 21", a: 57, b: 36 },
	{ t: "May 28", a: 44, b: 27 },
	{ t: "Jun 3", a: 51, b: 32 },
	{ t: "Jun 9", a: 68, b: 43 },
	{ t: "Jun 15", a: 72, b: 46 },
	{ t: "Jun 21", a: 60, b: 38 },
	{ t: "Jun 29", a: 65, b: 41 },
];

type Range = "7d" | "30d" | "3m";

const RANGES: { key: Range; label: string }[] = [
	{ key: "3m", label: "Last 3 months" },
	{ key: "30d", label: "Last 30 days" },
	{ key: "7d", label: "Last 7 days" },
];

const CHART_DATA: Record<Range, typeof CHART_7D> = {
	"7d": CHART_7D,
	"30d": CHART_30D,
	"3m": CHART_3M,
};

/* ── helpers ───────────────────────────────────────────────────────── */

function fillPct(l: Lobby) {
	return (l.playerCount / l.maxPlayers) * 100;
}
function fillColor(pct: number) {
	if (pct >= 100) return "bg-red-500";
	if (pct >= 75) return "bg-amber-400";
	return "bg-emerald-400";
}
function statusLabel(pct: number) {
	if (pct >= 100)
		return {
			text: "Full",
			cls: "bg-red-500/10 text-red-400",
			dot: "bg-red-400",
		};
	if (pct >= 75)
		return {
			text: "Filling",
			cls: "bg-amber-500/10 text-amber-400",
			dot: "bg-amber-400",
		};
	return {
		text: "Open",
		cls: "bg-emerald-500/10 text-emerald-400",
		dot: "bg-emerald-400",
	};
}

/* ── primitives ────────────────────────────────────────────────────── */

function GhostInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			{...props}
			className={cn(
				"w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-white/25 focus:bg-white/[0.06]",
				props.className,
			)}
		/>
	);
}

function Field({
	label,
	id,
	children,
}: {
	label: string;
	id: string;
	children: React.ReactNode;
}) {
	return (
		<div className="grid gap-1.5">
			<label htmlFor={id} className="text-xs font-medium text-zinc-400">
				{label}
			</label>
			{children}
		</div>
	);
}

/* ── dialogs ───────────────────────────────────────────────────────── */

function LobbyDialog({
	trigger,
	title,
	lobby,
}: {
	trigger: React.ReactNode;
	title: string;
	lobby?: Lobby;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-md border-white/[0.08] bg-[#111113] p-0 shadow-2xl overflow-hidden">
				<div className="p-6 pb-0">
					<DialogHeader>
						<DialogTitle className="text-sm font-semibold text-white">
							{title}
						</DialogTitle>
					</DialogHeader>
				</div>
				{lobby?.photo && (
					<div className="relative mx-6 mt-4 aspect-video overflow-hidden rounded-xl border border-white/[0.08]">
						<img
							src={lobby.photo}
							alt={lobby.name}
							className="h-full w-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
						<span className="absolute bottom-3 left-3 text-xs text-white/50">
							Current photo
						</span>
					</div>
				)}
				<div className="grid gap-4 px-6 py-4">
					<Field label="Lobby name" id="name">
						<GhostInput
							id="name"
							placeholder="e.g. Friday Brawl"
							defaultValue={lobby?.name}
						/>
					</Field>
					<Field label="Max players" id="max">
						<GhostInput
							id="max"
							type="number"
							min={2}
							max={20}
							placeholder="8"
							defaultValue={lobby?.maxPlayers}
						/>
					</Field>
					<Field label="Photo URL" id="photo">
						<GhostInput
							id="photo"
							placeholder="https://…"
							defaultValue={lobby?.photo}
						/>
					</Field>
				</div>
				<div className="border-t border-white/[0.06] px-6 py-4">
					<DialogFooter>
						<button
							type="submit"
							className="w-full rounded-lg bg-white py-2 text-sm font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98]"
						>
							{title}
						</button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function DeleteDialog({
	trigger,
	name,
}: {
	trigger: React.ReactNode;
	name: string;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-sm border-white/[0.08] bg-[#111113] shadow-2xl">
				<DialogHeader>
					<DialogTitle className="text-sm font-semibold text-white">
						Delete lobby
					</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-zinc-500">
					Permanently delete{" "}
					<span className="font-medium text-zinc-300">"{name}"</span> and remove
					all players?
				</p>
				<DialogFooter className="gap-2 sm:gap-2">
					<button
						type="button"
						className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white"
					>
						Cancel
					</button>
					<button
						type="button"
						className="flex-1 rounded-lg bg-red-500/90 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
					>
						Delete
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/* ── stat card ─────────────────────────────────────────────────────── */

function StatCard({
	label,
	value,
	trend,
	trendLabel,
	sub,
}: {
	label: string;
	value: string | number;
	trend: number;
	trendLabel: string;
	sub: string;
}) {
	const up = trend >= 0;
	const TrendIcon = up ? TrendingUp : TrendingDown;
	const ArrowIcon = up ? ArrowUpRight : ArrowDownRight;

	return (
		<div className="flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 gap-3">
			{/* top row */}
			<div className="flex items-start justify-between gap-2">
				<p className="text-sm text-zinc-400">{label}</p>
				<span
					className={cn(
						"flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
						up
							? "bg-emerald-500/15 text-emerald-400"
							: "bg-red-500/15 text-red-400",
					)}
				>
					<ArrowIcon className="h-3 w-3" />
					{up ? "+" : ""}
					{trend}%
				</span>
			</div>

			{/* big number */}
			<p className="text-4xl font-bold tracking-tight text-white tabular-nums">
				{value}
			</p>

			{/* bottom */}
			<div>
				<div
					className={cn(
						"flex items-center gap-1 text-sm font-semibold",
						up ? "text-white" : "text-zinc-300",
					)}
				>
					{trendLabel}
					<TrendIcon className="h-3.5 w-3.5" />
				</div>
				<p className="mt-0.5 text-xs text-zinc-600">{sub}</p>
			</div>
		</div>
	);
}

/* ── chart tooltip ─────────────────────────────────────────────────── */

function ChartTip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: { value: number; name?: string }[];
	label?: string;
}) {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-lg border border-white/10 bg-[#111113] px-3 py-2 shadow-xl">
			<p className="mb-1 text-[11px] text-zinc-500">{label}</p>
			{payload.map((p, i) => (
				<p key={i} className="text-sm font-semibold text-white">
					{p.value} players
				</p>
			))}
		</div>
	);
}

/* ── lobby row ─────────────────────────────────────────────────────── */

function LobbyRow({ lobby }: { lobby: Lobby }) {
	const pct = fillPct(lobby);
	const { text, cls, dot } = statusLabel(pct);

	return (
		<tr className="group border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]">
			<td className="py-3.5 pl-6 pr-4">
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-zinc-800">
						<img
							src={lobby.photo}
							alt={lobby.name}
							className="h-full w-full object-cover"
						/>
					</div>
					<div>
						<p className="text-sm font-medium text-white">{lobby.name}</p>
						<p className="font-mono text-[11px] text-zinc-600">{lobby.id}</p>
					</div>
				</div>
			</td>

			<td className="px-4 py-3.5">
				<div className="flex items-center gap-2.5">
					<div className="h-1 w-20 overflow-hidden rounded-full bg-white/[0.06]">
						<div
							className={cn("h-full rounded-full", fillColor(pct))}
							style={{ width: `${Math.min(pct, 100)}%` }}
						/>
					</div>
					<span className="text-xs tabular-nums text-zinc-400">
						{lobby.playerCount}
						<span className="text-zinc-700">/{lobby.maxPlayers}</span>
					</span>
				</div>
			</td>

			<td className="px-4 py-3.5">
				<span
					className={cn(
						"inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
						cls,
					)}
				>
					<span className={cn("h-1 w-1 rounded-full", dot)} />
					{text}
				</span>
			</td>

			<td className="px-4 py-3.5 text-xs text-zinc-600">{lobby.createdAt}</td>

			<td className="py-3.5 pl-4 pr-6">
				<div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
					<LobbyDialog
						title="Edit lobby"
						lobby={lobby}
						trigger={
							<button
								type="button"
								className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
							>
								<Pencil className="h-3 w-3" />
								Edit
							</button>
						}
					/>
					<DeleteDialog
						name={lobby.name}
						trigger={
							<button
								type="button"
								className="rounded-md p-1.5 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
							>
								<Trash2 className="h-3.5 w-3.5" />
							</button>
						}
					/>
				</div>
			</td>
		</tr>
	);
}

/* ── page ──────────────────────────────────────────────────────────── */

function LobbiesPage() {
	const [search, setSearch] = useState("");
	const [range, setRange] = useState<Range>("3m");

	const totalPlayers = LOBBIES.reduce((s, l) => s + l.playerCount, 0);
	const totalCapacity = LOBBIES.reduce((s, l) => s + l.maxPlayers, 0);
	const openCount = LOBBIES.filter((l) => l.playerCount < l.maxPlayers).length;
	const fullCount = LOBBIES.filter((l) => l.playerCount >= l.maxPlayers).length;

	const filtered = LOBBIES.filter(
		(l) =>
			l.name.toLowerCase().includes(search.toLowerCase()) ||
			l.id.toLowerCase().includes(search.toLowerCase()),
	);

	const chartData = CHART_DATA[range];
	const rangeLabel: Record<Range, string> = {
		"7d": "Total for the last 7 days",
		"30d": "Total for the last 30 days",
		"3m": "Total for the last 3 months",
	};

	return (
		<div className="space-y-5 px-8 py-8">
			{/* header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold text-white">Lobbies</h1>
					<p className="mt-0.5 text-sm text-zinc-500">
						{totalPlayers} of {totalCapacity} slots filled across{" "}
						{LOBBIES.length} lobbies
					</p>
				</div>
				<LobbyDialog
					title="Create lobby"
					trigger={
						<button
							type="button"
							className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98]"
						>
							<Plus className="h-3.5 w-3.5" />
							New lobby
						</button>
					}
				/>
			</div>

			{/* stat cards */}
			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<StatCard
					label="Total Lobbies"
					value={LOBBIES.length}
					trend={33}
					trendLabel="Growing this month"
					sub="2 new lobbies added"
				/>
				<StatCard
					label="Players Online"
					value={totalPlayers}
					trend={12}
					trendLabel="Up from yesterday"
					sub="Across all active lobbies"
				/>
				<StatCard
					label="Open Lobbies"
					value={openCount}
					trend={-8}
					trendLabel="Down this period"
					sub="More lobbies filling up"
				/>
				<StatCard
					label="Fill Rate"
					value={`${Math.round((totalPlayers / totalCapacity) * 100)}%`}
					trend={4}
					trendLabel="Steady increase"
					sub="Meets weekly targets"
				/>
			</div>

			{/* chart card */}
			<div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
				<div className="mb-5 flex items-start justify-between gap-4">
					<div>
						<p className="text-base font-semibold text-white">
							Player Activity
						</p>
						<p className="mt-0.5 text-sm text-zinc-500">{rangeLabel[range]}</p>
					</div>

					{/* range toggle */}
					<div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-1 gap-1">
						{RANGES.map(({ key, label }) => (
							<button
								key={key}
								type="button"
								onClick={() => setRange(key)}
								className={cn(
									"rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
									range === key
										? "bg-white/[0.1] text-white"
										: "text-zinc-500 hover:text-zinc-300",
								)}
							>
								{label}
							</button>
						))}
					</div>
				</div>

				<div className="h-52">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={chartData}
							margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
						>
							<defs>
								<linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="rgba(255,255,255,0.15)" />
									<stop offset="95%" stopColor="rgba(255,255,255,0)" />
								</linearGradient>
								<linearGradient id="fillB" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="rgba(255,255,255,0.07)" />
									<stop offset="95%" stopColor="rgba(255,255,255,0)" />
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="rgba(255,255,255,0.04)"
								vertical={false}
							/>
							<XAxis
								dataKey="t"
								tick={{ fill: "#52525b", fontSize: 11 }}
								axisLine={false}
								tickLine={false}
							/>
							<Tooltip
								content={<ChartTip />}
								cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
							/>
							<Area
								type="monotone"
								dataKey="b"
								stroke="rgba(255,255,255,0.25)"
								strokeWidth={1.5}
								fill="url(#fillB)"
								dot={false}
								activeDot={false}
							/>
							<Area
								type="monotone"
								dataKey="a"
								stroke="rgba(255,255,255,0.8)"
								strokeWidth={2}
								fill="url(#fillA)"
								dot={false}
								activeDot={{
									r: 4,
									fill: "#fff",
									stroke: "#0c0c0e",
									strokeWidth: 2,
								}}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* table */}
			<div className="rounded-xl border border-white/[0.06] overflow-hidden">
				<div className="flex items-center justify-between gap-4 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
						<GhostInput
							placeholder="Search lobbies…"
							className="h-8 w-52 pl-9 text-xs"
							value={search}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setSearch(e.target.value)
							}
						/>
					</div>
					<span className="text-xs text-zinc-600">
						{filtered.length} of {LOBBIES.length}
					</span>
				</div>

				<table className="w-full text-left">
					<thead>
						<tr className="border-b border-white/[0.04]">
							{["Lobby", "Capacity", "Status", "Created", ""].map((h) => (
								<th
									key={h}
									className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-zinc-600 first:pl-6 last:pr-6"
								>
									{h}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{filtered.length === 0 ? (
							<tr>
								<td colSpan={5} className="py-16 text-center">
									<div className="flex flex-col items-center gap-2">
										<Users className="h-7 w-7 text-zinc-700" />
										<p className="text-sm text-zinc-500">No lobbies found</p>
									</div>
								</td>
							</tr>
						) : (
							filtered.map((lobby) => <LobbyRow key={lobby.id} lobby={lobby} />)
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
