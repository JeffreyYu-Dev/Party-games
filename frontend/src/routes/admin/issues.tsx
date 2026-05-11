import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	AlertTriangle,
	CheckCircle2,
	ChevronDown,
	CircleAlert,
	CircleDot,
	Clock,
	MessageSquare,
	Search,
	User,
	X,
	XCircle,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/admin/issues")({
	component: IssuesPage,
});

/* ── types ─────────────────────────────────────────────────────────── */

type Priority = "critical" | "high" | "medium" | "low";
type Status = "open" | "in_progress" | "resolved" | "dismissed";

interface Issue {
	id: string;
	title: string;
	description: string;
	type: string;
	priority: Priority;
	status: Status;
	lobby: string | null;
	reporter: string;
	assignee: string | null;
	createdAt: string;
	updatedAt: string;
	notes: string;
}

/* ── mock data ─────────────────────────────────────────────────────── */

const ISSUES: Issue[] = [
	{
		id: "ISS-001",
		title: "Friday Brawl lobby crashed mid-game",
		description:
			"The lobby crashed unexpectedly during round 3. All 8 players were disconnected simultaneously. Server logs show an unhandled exception in the game state manager.",
		type: "Crash",
		priority: "critical",
		status: "open",
		lobby: "LBY-002",
		reporter: "system",
		assignee: null,
		createdAt: "12 min ago",
		updatedAt: "12 min ago",
		notes: "",
	},
	{
		id: "ISS-002",
		title: "Player disconnect loop in Night Owls",
		description:
			"Two players in Night Owls (LBY-006) are repeatedly connecting and disconnecting every ~30 seconds. This may be a client-side network issue or a server keepalive bug.",
		type: "Disconnect",
		priority: "high",
		status: "in_progress",
		lobby: "LBY-006",
		reporter: "player_anna",
		assignee: "jeff_admin",
		createdAt: "1h ago",
		updatedAt: "22 min ago",
		notes: "Investigating server keepalive config. Reproduced locally on flaky network.",
	},
	{
		id: "ISS-003",
		title: "Tournament Qualifier not accepting new players",
		description:
			"LBY-004 is showing 9/10 but rejecting all join attempts with error code JOIN_REJECTED_CAPACITY. The slot count may be out of sync with the actual state.",
		type: "Capacity bug",
		priority: "high",
		status: "open",
		lobby: "LBY-004",
		reporter: "player_mike",
		assignee: null,
		createdAt: "2h ago",
		updatedAt: "2h ago",
		notes: "",
	},
	{
		id: "ISS-004",
		title: "Cheating report — player_x99 in Game Night Alpha",
		description:
			"Three separate players reported player_x99 for using an automated script to respond faster than humanly possible. Score deltas are anomalous.",
		type: "Cheating",
		priority: "high",
		status: "open",
		lobby: "LBY-001",
		reporter: "player_dana",
		assignee: null,
		createdAt: "3h ago",
		updatedAt: "3h ago",
		notes: "",
	},
	{
		id: "ISS-005",
		title: "Incorrect score shown at end of round",
		description:
			"Players in Casual Round saw their scores reset to 0 at the end of round 2 before the final tally. The correct scores appeared after a page refresh.",
		type: "Score bug",
		priority: "medium",
		status: "in_progress",
		lobby: "LBY-003",
		reporter: "player_sam",
		assignee: "jeff_admin",
		createdAt: "5h ago",
		updatedAt: "1h ago",
		notes: "Likely a race condition in the score flush. Ticket open with backend team.",
	},
	{
		id: "ISS-006",
		title: "Spam messages flooding Game Night Alpha chat",
		description:
			"A player posted hundreds of repeated messages in the lobby chat, making it unusable for other players for about 5 minutes.",
		type: "Moderation",
		priority: "low",
		status: "resolved",
		lobby: "LBY-001",
		reporter: "player_lucy",
		assignee: "jeff_admin",
		createdAt: "1d ago",
		updatedAt: "18h ago",
		notes: "Player warned and rate limiting applied to the lobby chat endpoint.",
	},
	{
		id: "ISS-007",
		title: "Weekend Warriors — game timer stuck at 0:00",
		description:
			"The round timer froze at 0:00 but the game kept running. Players had no indication the round was over. Manually ended by admin.",
		type: "UI bug",
		priority: "medium",
		status: "resolved",
		lobby: "LBY-005",
		reporter: "player_tom",
		assignee: null,
		createdAt: "2d ago",
		updatedAt: "1d ago",
		notes: "Root cause found: timer component unmounts when tab loses focus. Fix shipped.",
	},
	{
		id: "ISS-008",
		title: "False positive ban on player_rae",
		description:
			"player_rae was auto-banned by the anti-cheat system despite playing normally. The trigger was an unusually fast internet connection causing sub-10ms response times.",
		type: "False positive",
		priority: "medium",
		status: "dismissed",
		lobby: null,
		reporter: "player_rae",
		assignee: "jeff_admin",
		createdAt: "3d ago",
		updatedAt: "2d ago",
		notes: "Ban lifted. Anti-cheat threshold adjusted to account for very low latency.",
	},
];

const STATUS_TABS: { key: Status | "all"; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "open", label: "Open" },
	{ key: "in_progress", label: "In Progress" },
	{ key: "resolved", label: "Resolved" },
	{ key: "dismissed", label: "Dismissed" },
];

/* ── config maps ───────────────────────────────────────────────────── */

const PRIORITY: Record<Priority, { label: string; color: string; dot: string; ring: string }> = {
	critical: { label: "Critical", color: "text-red-400", dot: "bg-red-500", ring: "border-red-500/30" },
	high:     { label: "High",     color: "text-orange-400", dot: "bg-orange-400", ring: "border-orange-500/20" },
	medium:   { label: "Medium",   color: "text-amber-400", dot: "bg-amber-400", ring: "border-amber-500/20" },
	low:      { label: "Low",      color: "text-zinc-400", dot: "bg-zinc-500", ring: "border-zinc-700" },
};

const STATUS_CFG: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string }> = {
	open:        { label: "Open",        icon: CircleAlert,   color: "text-sky-400",     bg: "bg-sky-500/10" },
	in_progress: { label: "In Progress", icon: CircleDot,     color: "text-amber-400",   bg: "bg-amber-500/10" },
	resolved:    { label: "Resolved",    icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
	dismissed:   { label: "Dismissed",   icon: XCircle,       color: "text-zinc-500",    bg: "bg-zinc-500/10" },
};

/* ── issue detail dialog ───────────────────────────────────────────── */

function IssueDialog({ issue, trigger }: { issue: Issue; trigger: React.ReactNode }) {
	const p = PRIORITY[issue.priority];
	const s = STATUS_CFG[issue.status];
	const StatusIcon = s.icon;
	const isActive = issue.status === "open" || issue.status === "in_progress";

	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-xl border-white/[0.08] bg-[#111113] p-0 shadow-2xl overflow-hidden">

				{/* priority stripe */}
				<div className={cn(
					"h-0.5 w-full",
					issue.priority === "critical" ? "bg-red-500" :
					issue.priority === "high" ? "bg-orange-400" :
					issue.priority === "medium" ? "bg-amber-400" : "bg-zinc-600",
				)} />

				<div className="px-6 pt-5 pb-0">
					<DialogHeader>
						<div className="flex items-start justify-between gap-3">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="font-mono text-[11px] text-zinc-600">{issue.id}</span>
									<span className="text-zinc-700">·</span>
									<span className={cn("text-[11px] font-medium", p.color)}>{p.label} priority</span>
								</div>
								<DialogTitle className="text-sm font-semibold leading-snug text-white">
									{issue.title}
								</DialogTitle>
							</div>
						</div>
					</DialogHeader>
				</div>

				{/* meta row */}
				<div className="mx-6 mt-4 flex flex-wrap gap-2">
					<span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium", s.bg, s.color)}>
						<StatusIcon className="h-3 w-3" />
						{s.label}
					</span>
					<span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-400">
						{issue.type}
					</span>
					{issue.lobby && (
						<span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-zinc-400">
							{issue.lobby}
						</span>
					)}
				</div>

				{/* description */}
				<div className="mx-6 mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
					<p className="text-sm leading-relaxed text-zinc-300">{issue.description}</p>
				</div>

				{/* timeline metadata */}
				<div className="mx-6 mt-3 grid grid-cols-2 gap-3">
					<div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
						<p className="text-[10px] uppercase tracking-wider text-zinc-600">Reporter</p>
						<div className="mt-1 flex items-center gap-1.5">
							<User className="h-3 w-3 text-zinc-500" />
							<span className="text-xs font-medium text-zinc-300">{issue.reporter}</span>
						</div>
					</div>
					<div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
						<p className="text-[10px] uppercase tracking-wider text-zinc-600">Assignee</p>
						<div className="mt-1 flex items-center gap-1.5">
							<User className="h-3 w-3 text-zinc-500" />
							<span className="text-xs font-medium text-zinc-300">{issue.assignee ?? "Unassigned"}</span>
						</div>
					</div>
					<div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
						<p className="text-[10px] uppercase tracking-wider text-zinc-600">Opened</p>
						<div className="mt-1 flex items-center gap-1.5">
							<Clock className="h-3 w-3 text-zinc-500" />
							<span className="text-xs font-medium text-zinc-300">{issue.createdAt}</span>
						</div>
					</div>
					<div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
						<p className="text-[10px] uppercase tracking-wider text-zinc-600">Last updated</p>
						<div className="mt-1 flex items-center gap-1.5">
							<Clock className="h-3 w-3 text-zinc-500" />
							<span className="text-xs font-medium text-zinc-300">{issue.updatedAt}</span>
						</div>
					</div>
				</div>

				{/* notes */}
				<div className="mx-6 mt-3">
					<div className="flex items-center gap-1.5 mb-1.5">
						<MessageSquare className="h-3 w-3 text-zinc-600" />
						<p className="text-[10px] uppercase tracking-wider text-zinc-600">Resolution notes</p>
					</div>
					<textarea
						defaultValue={issue.notes}
						placeholder="Add notes on how this was resolved or what's being done…"
						rows={3}
						className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-white/20 focus:bg-white/[0.06]"
					/>
				</div>

				{/* actions */}
				<div className="mt-4 border-t border-white/[0.06] px-6 py-4">
					{isActive ? (
						<div className="flex items-center gap-2">
							<button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98]">
								<CheckCircle2 className="h-4 w-4" />
								Mark resolved
							</button>
							<button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white">
								<CircleDot className="h-4 w-4" />
								{issue.status === "open" ? "Start work" : "Pause"}
							</button>
							<button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-600 transition hover:bg-white/[0.05] hover:text-zinc-300">
								<X className="h-4 w-4" />
								Dismiss
							</button>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white">
								<CircleAlert className="h-4 w-4" />
								Reopen issue
							</button>
						</div>
					)}
				</div>

			</DialogContent>
		</Dialog>
	);
}

/* ── issue row ─────────────────────────────────────────────────────── */

function IssueRow({ issue }: { issue: Issue }) {
	const p = PRIORITY[issue.priority];
	const s = STATUS_CFG[issue.status];
	const StatusIcon = s.icon;

	return (
		<IssueDialog
			issue={issue}
			trigger={
				<tr className="group cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
					{/* priority dot + title */}
					<td className="py-3.5 pl-6 pr-4">
						<div className="flex items-start gap-3">
							<span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", p.dot)} />
							<div>
								<p className="text-sm text-white group-hover:text-white">{issue.title}</p>
								<div className="mt-0.5 flex items-center gap-2">
									<span className="font-mono text-[11px] text-zinc-600">{issue.id}</span>
									<span className="text-zinc-700">·</span>
									<span className="text-[11px] text-zinc-600">{issue.type}</span>
									{issue.lobby && (
										<>
											<span className="text-zinc-700">·</span>
											<span className="font-mono text-[11px] text-zinc-600">{issue.lobby}</span>
										</>
									)}
								</div>
							</div>
						</div>
					</td>

					{/* priority */}
					<td className="px-4 py-3.5">
						<span className={cn("text-xs font-medium", p.color)}>{p.label}</span>
					</td>

					{/* status */}
					<td className="px-4 py-3.5">
						<span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium", s.bg, s.color)}>
							<StatusIcon className="h-3 w-3" />
							{s.label}
						</span>
					</td>

					{/* assignee */}
					<td className="px-4 py-3.5">
						{issue.assignee ? (
							<div className="flex items-center gap-1.5">
								<div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[9px] font-bold text-indigo-400">
									{issue.assignee[0].toUpperCase()}
								</div>
								<span className="text-xs text-zinc-400">{issue.assignee}</span>
							</div>
						) : (
							<span className="text-xs text-zinc-700">—</span>
						)}
					</td>

					{/* time */}
					<td className="px-4 py-3.5 text-xs text-zinc-600">{issue.createdAt}</td>

					{/* chevron */}
					<td className="py-3.5 pl-4 pr-6">
						<ChevronDown className="h-3.5 w-3.5 -rotate-90 text-zinc-700 opacity-0 transition group-hover:opacity-100" />
					</td>
				</tr>
			}
		/>
	);
}

/* ── page ──────────────────────────────────────────────────────────── */

function IssuesPage() {
	const [tab, setTab] = useState<Status | "all">("all");
	const [search, setSearch] = useState("");

	const openCount = ISSUES.filter((i) => i.status === "open").length;
	const criticalCount = ISSUES.filter((i) => i.priority === "critical" && i.status === "open").length;
	const inProgressCount = ISSUES.filter((i) => i.status === "in_progress").length;
	const resolvedCount = ISSUES.filter((i) => i.status === "resolved").length;

	const filtered = ISSUES.filter((i) => {
		const matchTab = tab === "all" || i.status === tab;
		const matchSearch =
			i.title.toLowerCase().includes(search.toLowerCase()) ||
			i.id.toLowerCase().includes(search.toLowerCase()) ||
			(i.lobby ?? "").toLowerCase().includes(search.toLowerCase()) ||
			i.type.toLowerCase().includes(search.toLowerCase());
		return matchTab && matchSearch;
	}).sort((a, b) => {
		const order: Priority[] = ["critical", "high", "medium", "low"];
		const statusOrder: Status[] = ["open", "in_progress", "resolved", "dismissed"];
		if (a.status !== b.status) return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
		return order.indexOf(a.priority) - order.indexOf(b.priority);
	});

	return (
		<div className="space-y-6 px-8 py-8">

			{/* header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-xl font-semibold text-white">Issues</h1>
					<p className="mt-0.5 text-sm text-zinc-500">
						{openCount} open · {inProgressCount} in progress · {resolvedCount} resolved
					</p>
				</div>
			</div>

			{/* critical banner */}
			{criticalCount > 0 && (
				<div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
					<AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
					<p className="text-sm text-red-300">
						<span className="font-semibold">{criticalCount} critical {criticalCount === 1 ? "issue" : "issues"}</span>
						{" "}need immediate attention.
					</p>
					<button
						type="button"
						onClick={() => setTab("open")}
						className="ml-auto shrink-0 rounded-md border border-red-500/30 px-2.5 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
					>
						View critical
					</button>
				</div>
			)}

			{/* stat tiles */}
			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				{[
					{ label: "Total issues",  value: ISSUES.length,   sub: "All time",         color: "text-white" },
					{ label: "Open",          value: openCount,        sub: `${criticalCount} critical`, color: openCount > 0 ? "text-sky-400" : "text-zinc-400" },
					{ label: "In progress",   value: inProgressCount,  sub: "Being worked on",  color: inProgressCount > 0 ? "text-amber-400" : "text-zinc-400" },
					{ label: "Resolved",      value: resolvedCount,    sub: "All time",         color: "text-emerald-400" },
				].map(({ label, value, sub, color }) => (
					<div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
						<p className="text-xs text-zinc-500">{label}</p>
						<p className={cn("mt-2 text-2xl font-semibold tabular-nums", color)}>{value}</p>
						<p className="mt-0.5 text-[11px] text-zinc-600">{sub}</p>
					</div>
				))}
			</div>

			{/* table card */}
			<div className="rounded-xl border border-white/[0.06] overflow-hidden">

				{/* toolbar */}
				<div className="flex items-center justify-between gap-4 border-b border-white/[0.06] bg-white/[0.02] px-6 py-3">
					{/* status tabs */}
					<div className="flex items-center gap-0.5">
						{STATUS_TABS.map(({ key, label }) => {
							const count = key === "all" ? ISSUES.length : ISSUES.filter((i) => i.status === key).length;
							return (
								<button
									key={key}
									type="button"
									onClick={() => setTab(key)}
									className={cn(
										"flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors",
										tab === key
											? "bg-white/[0.08] text-white font-medium"
											: "text-zinc-500 hover:text-zinc-300",
									)}
								>
									{label}
									<span className={cn("tabular-nums", tab === key ? "text-zinc-400" : "text-zinc-700")}>
										{count}
									</span>
								</button>
							);
						})}
					</div>

					<div className="flex items-center gap-3">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
							<input
								placeholder="Search issues…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="h-8 w-52 rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 outline-none transition focus:border-white/25"
							/>
						</div>
					</div>
				</div>

				{/* table */}
				<table className="w-full text-left">
					<thead>
						<tr className="border-b border-white/[0.04]">
							{["Issue", "Priority", "Status", "Assignee", "Opened", ""].map((h) => (
								<th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-zinc-600 first:pl-6 last:pr-6">
									{h}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{filtered.length === 0 ? (
							<tr>
								<td colSpan={6} className="py-20 text-center">
									<div className="flex flex-col items-center gap-2">
										<CheckCircle2 className="h-8 w-8 text-zinc-700" />
										<p className="text-sm text-zinc-500">No issues found</p>
										<p className="text-xs text-zinc-700">
											{tab !== "all" ? "Try switching tabs or clearing your search." : "Everything looks clean."}
										</p>
									</div>
								</td>
							</tr>
						) : (
							filtered.map((issue) => <IssueRow key={issue.id} issue={issue} />)
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
