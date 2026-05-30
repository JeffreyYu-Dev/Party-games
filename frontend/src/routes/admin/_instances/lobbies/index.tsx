import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ArrowDown,
	ArrowUp,
	ChevronDown,
	Filter,
	LayoutGrid,
	LayoutList,
	MoreHorizontal,
	Plus,
	RefreshCw,
	Search,
	Server,
	Trash2,
} from "lucide-react";
import { Skeleton } from "#/components/ui/skeleton";
import * as React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardFooter } from "#/components/ui/card";
import { Checkbox } from "#/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Input } from "#/components/ui/input";
import { Progress } from "#/components/ui/progress";
import { ScrollArea } from "#/components/ui/scroll-area";
import { Separator } from "#/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import {
	type Lobby,
	type LobbyStatus,
	type MinestomLobby,
	minestomToLobby,
	formatUptime,
	STATUS_CONFIG,
} from "#/lib/lobby-data";
import { useWsEvent, wsClient } from "#/lib/ws";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/admin/_instances/lobbies/")({
	component: RouteComponent,
});

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
	label,
	value,
	sub,
	footer,
}: {
	label: string;
	value: string | number;
	sub?: string;
	footer?: string;
}) {
	return (
		<Card className="flex flex-col gap-3 p-4 rounded-lg">
			<div className="flex items-start justify-between gap-2">
				<div>
					<p className="text-xs text-muted-foreground">{label}</p>
					<div className="mt-1.5 flex items-baseline gap-2">
						<span className="text-2xl font-semibold tracking-tight tabular-nums">
							{value}
						</span>
						{sub && (
							<span className="text-[11px] text-muted-foreground tabular-nums">
								{sub}
							</span>
						)}
					</div>
				</div>
			</div>
			{footer && (
				<p className="text-[11px] text-muted-foreground/70">{footer}</p>
			)}
		</Card>
	);
}

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: LobbyStatus }) {
	const cfg = STATUS_CONFIG[status];
	return (
		<span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
			<span
				className={cn(
					"size-1.5 rounded-full shrink-0",
					cfg.dot,
					status === "degraded" && "animate-pulse",
				)}
			/>
			<span className={cfg.color}>{cfg.label}</span>
		</span>
	);
}

// ── Capacity Bar ───────────────────────────────────────────────────────────
function CapacityBar({ count, cap }: { count: number; cap: number }) {
	const effectiveCap = cap === 2147483647 ? 0 : cap;
	const pct = effectiveCap === 0 ? 0 : (count / effectiveCap) * 100;
	const tone =
		pct >= 100
			? "bg-blue-500"
			: pct >= 85
				? "bg-amber-500"
				: pct === 0
					? "bg-muted-foreground/30"
					: "bg-emerald-500";
	const capLabel = cap === 2147483647 ? "∞" : String(cap);
	return (
		<div className="flex items-center gap-2 min-w-[140px]">
			<Progress
				value={pct}
				className="h-1.5 flex-1"
				indicatorClassName={tone}
			/>
			<span className="font-mono text-[11px] tabular-nums text-muted-foreground w-[52px] text-right shrink-0">
				{count}/{capLabel}
			</span>
		</div>
	);
}

// ── Create Dialog ──────────────────────────────────────────────────────────
function CreateLobbyDialog({
	open,
	onOpenChange,
	onCreate,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onCreate: (data: { name: string; map: string; playerCap: number }) => void;
}) {
	const [name, setName] = React.useState("");
	const [map, setMap] = React.useState("super-flat-world");
	const [playerCap, setPlayerCap] = React.useState(40);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onCreate({ name: name || map, map, playerCap });
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<div className="flex items-start gap-3">
							<div className="size-9 rounded-md border bg-muted flex items-center justify-center shrink-0">
								<Plus className="size-4 text-muted-foreground" />
							</div>
							<div>
								<DialogTitle>Create lobby instance</DialogTitle>
								<DialogDescription className="mt-0.5">
									A new lobby will be spun up on the Minestom server.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<div className="px-1 pt-4 grid grid-cols-2 gap-4">
						<div className="col-span-2">
							<label className="text-xs text-muted-foreground block mb-1">
								Name
							</label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="My Lobby"
								className="h-8"
							/>
						</div>
						<div className="col-span-2">
							<label className="text-xs text-muted-foreground block mb-1">
								Map
							</label>
							<Input
								value={map}
								onChange={(e) => setMap(e.target.value)}
								className="h-8 font-mono text-xs"
							/>
						</div>
						<div>
							<label className="text-xs text-muted-foreground block mb-1">
								Player cap
							</label>
							<Input
								type="number"
								min={1}
								max={120}
								value={playerCap}
								onChange={(e) => setPlayerCap(Number(e.target.value))}
								className="h-8"
							/>
						</div>
					</div>

					<DialogFooter className="mt-4">
						<div className="flex items-center gap-2 ml-auto">
							<Button
								variant="ghost"
								type="button"
								size="sm"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" size="sm">
								<Plus className="size-3" />
								Create lobby
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

// ── Delete Dialog ──────────────────────────────────────────────────────────
function DeleteLobbyDialog({
	lobby,
	open,
	onOpenChange,
	onConfirm,
}: {
	lobby: Lobby | null;
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onConfirm: (lobby: Lobby) => void;
}) {
	if (!lobby) return null;
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<div className="flex items-start gap-3">
						<div className="size-9 rounded-md border border-red-400/20 bg-red-400/10 flex items-center justify-center shrink-0">
							<Trash2 className="size-4 text-red-400" />
						</div>
						<div>
							<AlertDialogTitle>Delete lobby instance?</AlertDialogTitle>
							<AlertDialogDescription className="mt-1">
								<span className="font-mono">{lobby.id}</span> will be stopped
								immediately and all{" "}
								<span className="font-medium text-foreground">{lobby.count}</span>{" "}
								connected players will be disconnected. This cannot be undone.
							</AlertDialogDescription>
						</div>
					</div>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => onConfirm(lobby)}
						className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"
					>
						<Trash2 className="size-3" />
						Delete instance
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

// ── Live clock ─────────────────────────────────────────────────────────────
function useNow() {
	const [now, setNow] = React.useState(Date.now);
	React.useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);
	return now;
}

// ── Main Component ─────────────────────────────────────────────────────────
function RouteComponent() {
	const navigate = useNavigate();
	const now = useNow();
	const [lobbies, setLobbies] = React.useState<Lobby[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [pendingCount, setPendingCount] = React.useState(0);
	const [selected, setSelected] = React.useState<Set<string>>(new Set());
	const [query, setQuery] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState<"all" | LobbyStatus>(
		"all",
	);
	const [sort, setSort] = React.useState<{
		key: "count" | "cap" | "map";
		dir: "asc" | "desc";
	}>({ key: "count", dir: "desc" });
	const [createOpen, setCreateOpen] = React.useState(false);
	const [deleteTarget, setDeleteTarget] = React.useState<Lobby | null>(null);

	const fetchLobbies = React.useCallback(() => {
		setLoading(true);
		wsClient
			.request<MinestomLobby[]>("lobby:getAll")
			.then((data) => setLobbies(data.map(minestomToLobby)))
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	React.useEffect(() => {
		fetchLobbies();
		wsClient.subscribe("lobbies");
		return () => wsClient.unsubscribe("lobbies");
	}, [fetchLobbies]);

	// Real-time events
	useWsEvent<MinestomLobby>("lobby:created", (data) => {
		setPendingCount((n) => Math.max(0, n - 1));
		setLobbies((ls) => {
			if (ls.some((l) => l.id === data.id)) return ls;
			return [minestomToLobby({ ...data, players: [], startedAt: Math.floor(Date.now() / 1000) }), ...ls];
		});
	});

	useWsEvent<{ lobbyId: string }>("lobby:deleted", ({ lobbyId }) => {
		setLobbies((ls) => ls.filter((l) => l.id !== lobbyId));
	});

	useWsEvent<{ lobbyId: string; playerId: string; username: string }>(
		"lobby:playerJoined",
		({ lobbyId, playerId, username }) => {
			setLobbies((ls) =>
				ls.map((l) => {
					if (l.id !== lobbyId || l.players.some((p) => p.id === playerId)) return l;
					const players = [...l.players, { id: playerId, username }];
					return { ...l, players, count: players.length };
				}),
			);
		},
	);

	useWsEvent<{ lobbyId: string; playerId: string }>(
		"lobby:playerLeft",
		({ lobbyId, playerId }) => {
			setLobbies((ls) =>
				ls.map((l) => {
					if (l.id !== lobbyId) return l;
					const players = l.players.filter((p) => p.id !== playerId);
					return { ...l, players, count: players.length };
				}),
			);
		},
	);

	useWsEvent<{ lobbyId: string; name: string }>("lobby:edited", ({ lobbyId, name }) => {
		setLobbies((ls) =>
			ls.map((l) => (l.id === lobbyId ? { ...l, name } : l)),
		);
	});

	const filtered = React.useMemo(() => {
		let r = lobbies;
		if (query) {
			const q = query.toLowerCase();
			r = r.filter(
				(l) =>
					l.map.toLowerCase().includes(q) ||
					l.id.toLowerCase().includes(q) ||
					l.name.toLowerCase().includes(q),
			);
		}
		if (statusFilter !== "all") r = r.filter((l) => l.status === statusFilter);
		return [...r].sort((a, b) => {
			const dir = sort.dir === "asc" ? 1 : -1;
			if (sort.key === "count") return (a.count - b.count) * dir;
			if (sort.key === "cap") return (a.playerCap - b.playerCap) * dir;
			if (sort.key === "map") return a.map.localeCompare(b.map) * dir;
			return 0;
		});
	}, [lobbies, query, statusFilter, sort]);

	const toggleSel = (id: string) => {
		const s = new Set(selected);
		s.has(id) ? s.delete(id) : s.add(id);
		setSelected(s);
	};
	const toggleAll = () =>
		setSelected(
			selected.size === filtered.length
				? new Set()
				: new Set(filtered.map((l) => l.id)),
		);

	const totalPlayers = lobbies.reduce((a, l) => a + l.count, 0);
	const totalCap = lobbies.reduce((a, l) => (l.playerCap === 2147483647 ? a : a + l.playerCap), 0);
	const occupancy = totalCap ? Math.round((totalPlayers / totalCap) * 100) : 0;
	const emptyCount = lobbies.filter((l) => l.status === "empty").length;
	const fullCount = lobbies.filter((l) => l.status === "full").length;

	const SortHead = ({
		k,
		children,
	}: {
		k: typeof sort.key;
		children: React.ReactNode;
	}) => (
		<button
			onClick={() =>
				setSort((s) => ({
					key: k,
					dir: s.key === k && s.dir === "desc" ? "asc" : "desc",
				}))
			}
			className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
		>
			{children}
			{sort.key === k &&
				(sort.dir === "desc" ? (
					<ArrowDown className="size-2.5" />
				) : (
					<ArrowUp className="size-2.5" />
				))}
		</button>
	);

	const handleCreate = ({ name, map, playerCap }: { name: string; map: string; playerCap: number }) => {
		wsClient.send("lobby:create", { name, map, playerCap });
		setPendingCount((n) => n + 1);
	};

	const handleDelete = (lobby: Lobby) => {
		wsClient.send("lobby:delete", { id: lobby.id });
		setDeleteTarget(null);
	};

	return (
		<ScrollArea className="h-full">
			<div className="pb-6">
				{/* Header */}
				<div className="flex items-start gap-3">
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-lg font-semibold tracking-tight">Lobbies</h1>
							<Badge
								variant="outline"
								className="font-mono text-[10px] text-muted-foreground"
							>
								{lobbies.length} instances
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Manage lobby instances on your Minestom server. Lobbies hold
							players between matches.
						</p>
					</div>
					<div className="ml-auto flex items-center gap-2">
						<Button variant="outline" size="lg" onClick={fetchLobbies}>
							<RefreshCw className={cn("size-3", loading && "animate-spin")} />
							Refresh
						</Button>
						<Button size="lg" onClick={() => setCreateOpen(true)}>
							<Plus className="size-3" />
							New lobby
						</Button>
					</div>
				</div>

				{/* Stat Cards */}
				<div className="mt-5 grid grid-cols-4 gap-3">
					<StatCard
						label="Players in lobbies"
						value={totalPlayers.toLocaleString()}
						sub={totalCap ? `of ${totalCap} slots` : undefined}
						footer={totalCap ? `${occupancy}% capacity` : "unlimited capacity"}
					/>
					<StatCard
						label="Active instances"
						value={lobbies.length}
						sub={`${fullCount} full · ${emptyCount} empty`}
						footer={`across ${new Set(lobbies.map((l) => l.map)).size} maps`}
					/>
					<StatCard
						label="Avg occupancy"
						value={totalCap ? `${occupancy}%` : "—"}
						footer="of capped lobbies"
					/>
					<StatCard
						label="Total players"
						value={totalPlayers}
						footer="across all instances"
					/>
				</div>
			</div>

			{/* Table Card */}
			<Card className="overflow-hidden rounded-lg gap-0 py-0">
				{/* Toolbar */}
				<div className="px-3 py-2.5 border-b flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Filter by map or instance id…"
							className="w-65 pl-7 h-7 text-xs"
						/>
					</div>
					<div className="relative">
						<select
							value={statusFilter}
							onChange={(e) =>
								setStatusFilter(e.target.value as typeof statusFilter)
							}
							className="h-7 w-[130px] appearance-none rounded-md border border-input bg-background pl-2.5 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
						>
							<option value="all">All statuses</option>
							<option value="healthy">Healthy</option>
							<option value="full">Full</option>
							<option value="empty">Empty</option>
						</select>
						<ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
					</div>
					<Button variant="outline" size="sm" className="h-7">
						<Filter className="size-3" />
						More filters
					</Button>
					<div className="ml-auto flex items-center gap-2">
						{selected.size > 0 && (
							<>
								<span className="text-xs text-muted-foreground">
									{selected.size} selected
								</span>
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-destructive hover:text-destructive"
								>
									<Trash2 className="size-3" />
									Delete
								</Button>
								<Separator orientation="vertical" className="h-4" />
							</>
						)}
						<div className="flex items-center rounded-md border bg-muted/30 p-0.5">
							<button className="size-6 rounded flex items-center justify-center bg-background border text-foreground">
								<LayoutList className="size-3" />
							</button>
							<button className="size-6 rounded flex items-center justify-center text-muted-foreground">
								<LayoutGrid className="size-3" />
							</button>
						</div>
					</div>
				</div>

				{/* Table */}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-4 w-8">
								<Checkbox
									checked={
										selected.size === filtered.length && filtered.length > 0
									}
									onCheckedChange={toggleAll}
								/>
							</TableHead>
							<TableHead>
								<SortHead k="map">Instance</SortHead>
							</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>
								<SortHead k="count">Players</SortHead>
							</TableHead>
							<TableHead>Uptime</TableHead>
							<TableHead className="pr-4 w-[100px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center text-xs text-muted-foreground py-8"
								>
									Loading…
								</TableCell>
							</TableRow>
						) : filtered.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center text-xs text-muted-foreground py-8"
								>
									No lobbies found.
								</TableCell>
							</TableRow>
						) : (
							filtered.map((lobby) => (
								<TableRow
									key={lobby.id}
									className="cursor-pointer"
									onClick={() =>
										navigate({
											to: "/admin/lobbies/$lobbyId",
											params: { lobbyId: lobby.id },
										})
									}
								>
									<TableCell
										className="pl-4"
										onClick={(e) => {
											e.stopPropagation();
											toggleSel(lobby.id);
										}}
									>
										<Checkbox
											checked={selected.has(lobby.id)}
											onCheckedChange={() => toggleSel(lobby.id)}
										/>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2.5">
											<div className="size-7 rounded-md border bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0">
												<Server className="size-3.5" />
											</div>
											<div className="min-w-0">
												<div className="flex items-center gap-1.5">
													<span className="text-xs font-medium truncate">
														{lobby.name}
													</span>
													<Badge
														variant="outline"
														className="font-mono text-[10px] text-muted-foreground h-4"
													>
														{lobby.map}
													</Badge>
												</div>
												<div className="font-mono text-[10.5px] text-muted-foreground truncate">
													{lobby.id}
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<StatusBadge status={lobby.status} />
									</TableCell>
									<TableCell>
										<CapacityBar count={lobby.count} cap={lobby.playerCap} />
									</TableCell>
									<TableCell>
										<span className="font-mono text-[11px] tabular-nums text-muted-foreground">
											{formatUptime(lobby.startedAt, now)}
										</span>
									</TableCell>
									<TableCell
										className="pr-4"
										onClick={(e) => e.stopPropagation()}
									>
										<div className="flex items-center justify-end gap-0.5">
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={() => setDeleteTarget(lobby)}
													>
														<Trash2 className="size-3 text-muted-foreground" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>Delete</TooltipContent>
											</Tooltip>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon-sm">
														<MoreHorizontal className="size-3 text-muted-foreground" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onSelect={() => navigator.clipboard.writeText(lobby.id)}
													>
														Copy instance id
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-destructive focus:text-destructive"
														onSelect={() => setDeleteTarget(lobby)}
													>
														<Trash2 className="size-3" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
						{Array.from({ length: pendingCount }).map((_, i) => (
							<TableRow key={`pending-${i}`}>
								<TableCell className="pl-4">
									<Skeleton className="size-4 rounded" />
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2.5">
										<Skeleton className="size-7 rounded-md shrink-0" />
										<div className="flex flex-col gap-1.5">
											<Skeleton className="h-3 w-24" />
											<Skeleton className="h-2.5 w-36" />
										</div>
									</div>
								</TableCell>
								<TableCell><Skeleton className="h-3 w-14" /></TableCell>
								<TableCell><Skeleton className="h-2 w-28" /></TableCell>
								<TableCell><Skeleton className="h-3 w-10" /></TableCell>
								<TableCell />
							</TableRow>
						))}
					</TableBody>
				</Table>

				<CardFooter className="px-4 py-2.5 border-t">
					<span className="text-[11px] text-muted-foreground">
						Showing <span className="text-foreground">{filtered.length}</span> of{" "}
						<span className="text-foreground">{lobbies.length}</span> lobbies
					</span>
					<span className="font-mono text-[10px] text-muted-foreground/60 ml-2">
						live
					</span>
				</CardFooter>
			</Card>

			<CreateLobbyDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				onCreate={handleCreate}
			/>
			<DeleteLobbyDialog
				lobby={deleteTarget}
				open={!!deleteTarget}
				onOpenChange={(v) => !v && setDeleteTarget(null)}
				onConfirm={handleDelete}
			/>
		</ScrollArea>
	);
}
