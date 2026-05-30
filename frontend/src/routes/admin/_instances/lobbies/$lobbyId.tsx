import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	ChevronLeft,
	Copy,
	Edit,
	MoreHorizontal,
	RefreshCw,
	Search,
	Server,
	Trash2,
	UserX,
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardFooter } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import {
	formatUptime,
	type Lobby,
	type LobbyStatus,
	type MinestomLobby,
	minestomToLobby,
	type Player,
	STATUS_CONFIG,
} from "#/lib/lobby-data";
import { cn } from "#/lib/utils";
import { useWsEvent, wsClient } from "#/lib/ws";

export const Route = createFileRoute("/admin/_instances/lobbies/$lobbyId")({
	component: RouteComponent,
});

// ── Live clock ────────────────────────────────────────────────────────────
function useNow() {
	const [now, setNow] = React.useState(Date.now);
	React.useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);
	return now;
}

// ── Status Badge ──────────────────────────────────────────────────────────
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

// ── Player Avatar ─────────────────────────────────────────────────────────
const AVATAR_COLORS = [
	"from-amber-700 to-orange-800",
	"from-emerald-700 to-teal-800",
	"from-blue-700 to-indigo-800",
	"from-purple-700 to-violet-800",
	"from-cyan-700 to-sky-800",
];

function PlayerAvatar({ id, name }: { id: string; name: string }) {
	const cls = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
	return (
		<Avatar className={cn("size-7 bg-linear-to-br rounded-none", cls)}>
			<AvatarFallback className="bg-transparent text-white text-[10px] font-bold">
				{name.slice(0, 2).toUpperCase()}
			</AvatarFallback>
			<AvatarImage
				src={`https://crafthead.net/avatar/${id}/256`}
				className="rounded-none"
			/>
		</Avatar>
	);
}

// ── Move Player Dialog ────────────────────────────────────────────────────
function MovePlayerDialog({
	open,
	player,
	currentLobbyId,
	onClose,
	onMove,
}: {
	open: boolean;
	player: Player | null;
	currentLobbyId: string;
	onClose: () => void;
	onMove: (targetLobbyId: string) => void;
}) {
	const [lobbies, setLobbies] = React.useState<
		import("#/lib/lobby-data").Lobby[]
	>([]);
	const [search, setSearch] = React.useState("");
	const [selected, setSelected] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		if (!open) {
			setSelected(null);
			setSearch("");
			return;
		}
		setLoading(true);
		wsClient
			.request<import("#/lib/lobby-data").MinestomLobby[]>("lobby:getAll")
			.then((raw) => {
				setLobbies(
					raw.map(minestomToLobby).filter((l) => l.id !== currentLobbyId),
				);
			})
			.finally(() => setLoading(false));
	}, [open, currentLobbyId]);

	const filtered = lobbies.filter((l) =>
		l.name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="text-sm">
						Move{" "}
						<span className="font-mono text-muted-foreground">
							{player?.username}
						</span>{" "}
						to lobby
					</DialogTitle>
				</DialogHeader>

				<div className="relative mt-1">
					<Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
					<Input
						placeholder="Filter lobbies…"
						className="h-8 pl-7 text-xs"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<ScrollArea className="h-[260px] -mx-1 px-1">
					{loading ? (
						<p className="text-xs text-muted-foreground text-center py-8">
							Loading…
						</p>
					) : filtered.length === 0 ? (
						<p className="text-xs text-muted-foreground text-center py-8">
							No other lobbies available.
						</p>
					) : (
						<ul className="flex flex-col gap-1">
							{filtered.map((l) => {
								const cfg = STATUS_CONFIG[l.status];
								const cap =
									l.playerCap === 2147483647 ? "∞" : String(l.playerCap);
								const isSelected = selected === l.id;
								return (
									<li key={l.id}>
										<button
											type="button"
											onClick={() => setSelected(l.id)}
											className={cn(
												"w-full text-left rounded-md px-3 py-2 text-xs border transition-colors",
												isSelected
													? "border-primary/50 bg-primary/5"
													: "border-transparent hover:bg-muted/50",
											)}
										>
											<div className="flex items-center justify-between gap-2">
												<span className="font-medium">{l.name}</span>
												<span
													className={cn(
														"inline-flex items-center gap-1 font-mono text-[10px]",
														cfg.color,
													)}
												>
													<span
														className={cn("size-1.5 rounded-full", cfg.dot)}
													/>
													{cfg.label}
												</span>
											</div>
											<div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
												<span className="font-mono">{l.map}</span>
												<span>·</span>
												<span className="tabular-nums">
													{l.count} / {cap}
												</span>
											</div>
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</ScrollArea>

				<DialogFooter className="gap-2">
					<Button variant="outline" size="sm" onClick={onClose}>
						Cancel
					</Button>
					<Button
						size="sm"
						disabled={!selected}
						onClick={() => {
							onMove(selected!);
							onClose();
						}}
					>
						<ArrowRight className="size-3" />
						Move
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ── Players Table ─────────────────────────────────────────────────────────
function PlayersTable({
	players,
	onKick,
	onMove,
}: {
	players: Player[];
	onKick: (id: string) => void;
	onMove: (player: Player) => void;
}) {
	if (players.length === 0) {
		return (
			<div className="p-12 flex items-center justify-center">
				<div className="text-center">
					<div className="mx-auto size-10 rounded-md border bg-muted/50 flex items-center justify-center text-muted-foreground mb-3">
						<Server className="size-5" />
					</div>
					<p className="text-xs font-medium">No players in lobby</p>
					<p className="text-[11px] text-muted-foreground mt-1">
						This instance is currently empty.
					</p>
				</div>
			</div>
		);
	}
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="pl-4">Player</TableHead>
					<TableHead className="pr-4 w-12" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{players.map((p) => (
					<TableRow key={p.id}>
						<TableCell className="pl-4">
							<div className="flex items-center gap-2.5">
								<PlayerAvatar id={p.id} name={p.username} />
								<div className="min-w-0">
									<p className="text-xs font-medium leading-tight">
										{p.username}
									</p>
									<p className="font-mono text-[10px] text-muted-foreground">
										{p.id}
									</p>
								</div>
							</div>
						</TableCell>
						<TableCell className="pr-4">
							<div className="flex items-center justify-end gap-0.5">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => onKick(p.id)}
										>
											<UserX className="size-3 text-muted-foreground" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Kick</TooltipContent>
								</Tooltip>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon-sm">
											<MoreHorizontal className="size-3 text-muted-foreground" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onSelect={() => navigator.clipboard.writeText(p.id)}
										>
											Copy UUID
										</DropdownMenuItem>
										<DropdownMenuItem onSelect={() => onMove(p)}>
											Move to lobby…
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="text-destructive focus:text-destructive"
											onSelect={() => onKick(p.id)}
										>
											Kick
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

// ── Main ──────────────────────────────────────────────────────────────────
function RouteComponent() {
	const { lobbyId } = Route.useParams();
	const navigate = useNavigate();
	const now = useNow();

	const [lobby, setLobby] = React.useState<Lobby | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [players, setPlayers] = React.useState<Player[]>([]);
	const [events, setEvents] = React.useState<
		{ time: string; text: string; cls: string }[]
	>([]);
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [moveTarget, setMoveTarget] = React.useState<Player | null>(null);

	React.useEffect(() => {
		setLoading(true);
		wsClient
			.request<MinestomLobby>("lobby:get", { lobbyId })
			.then((raw) => {
				const l = minestomToLobby(raw);
				setLobby(l);
				setPlayers(l.players);
			})
			.catch(() => setLobby(null))
			.finally(() => setLoading(false));

		wsClient.subscribe("lobby", lobbyId);
		return () => wsClient.unsubscribe("lobby", lobbyId);
	}, [lobbyId]);

	useWsEvent<{ lobbyId: string; playerId: string; username: string }>(
		"lobby:playerJoined",
		({ lobbyId: id, playerId, username }) => {
			if (id !== lobbyId) return;
			setPlayers((ps) => {
				if (ps.some((p) => p.id === playerId)) return ps;
				return [...ps, { id: playerId, username }];
			});
			setEvents((evs) =>
				[
					{
						time: new Date().toLocaleTimeString("en-US", {
							hour12: false,
							hour: "2-digit",
							minute: "2-digit",
						}),
						text: `${username} joined`,
						cls: "text-emerald-400",
					},
					...evs,
				].slice(0, 20),
			);
		},
	);

	useWsEvent<{ lobbyId: string; playerId: string; username: string }>(
		"lobby:playerLeft",
		({ lobbyId: id, playerId, username }) => {
			if (id !== lobbyId) return;
			setPlayers((ps) => ps.filter((p) => p.id !== playerId));
			setEvents((evs) =>
				[
					{
						time: new Date().toLocaleTimeString("en-US", {
							hour12: false,
							hour: "2-digit",
							minute: "2-digit",
						}),
						text: `${username} left`,
						cls: "text-muted-foreground/70",
					},
					...evs,
				].slice(0, 20),
			);
		},
	);

	useWsEvent<{ lobbyId: string }>("lobby:deleted", ({ lobbyId: id }) => {
		if (id !== lobbyId) return;
		navigate({ to: "/admin/lobbies" });
	});

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center">
				<p className="text-xs text-muted-foreground">Loading…</p>
			</div>
		);
	}

	if (!lobby) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-center">
					<p className="text-sm font-medium">Lobby not found</p>
					<Link
						to="/admin/lobbies"
						className="text-xs text-muted-foreground hover:text-foreground mt-1 inline-block"
					>
						← Back to lobbies
					</Link>
				</div>
			</div>
		);
	}

	const liveLobby: Lobby = { ...lobby, players, count: players.length };
	const status: LobbyStatus =
		liveLobby.count === 0
			? "empty"
			: liveLobby.playerCap !== 2147483647 && liveLobby.count >= liveLobby.playerCap
				? "full"
				: "healthy";
	const occ =
		liveLobby.playerCap === 2147483647
			? 0
			: Math.round((liveLobby.count / liveLobby.playerCap) * 100);
	const capLabel =
		liveLobby.playerCap === 2147483647 ? "∞" : String(liveLobby.playerCap);
	const uptime = formatUptime(liveLobby.startedAt, now);

	const handleDelete = () => {
		wsClient.send("lobby:delete", { id: liveLobby.id });
		setDeleteOpen(false);
		navigate({ to: "/admin/lobbies" });
	};

	const handleKick = (playerId: string) => {
		wsClient.send("lobby:kick", { lobbyId: liveLobby.id, playerId });
	};

	const handleMove = (targetLobbyId: string) => {
		if (!moveTarget) return;
		wsClient.send("lobby:move", {
			lobbyId: liveLobby.id,
			playerId: moveTarget.id,
			targetLobbyId,
		});
	};

	return (
		<ScrollArea className="h-full">
			{/* Page Header */}
			<div className="border-b">
				<Link
					to="/admin/lobbies"
					className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mb-3 transition-colors"
				>
					<ChevronLeft className="size-3" />
					Back to lobbies
				</Link>
				<div className="flex items-start gap-4">
					<div className="size-12 rounded-md border bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0">
						<Server className="size-5" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2 flex-wrap">
							<h1 className="text-xl font-semibold tracking-tight">
								{liveLobby.name}
							</h1>
							<StatusBadge status={status} />
							<Badge
								variant="outline"
								className="font-mono text-[10px] text-muted-foreground"
							>
								{liveLobby.map}
							</Badge>
						</div>
						<div className="flex items-center gap-3 mt-1.5 flex-wrap">
							<div className="flex items-center gap-1">
								<span className="font-mono text-[11px] text-muted-foreground">
									{liveLobby.id}
								</span>
								<button
									className="text-muted-foreground hover:text-foreground transition-colors"
									onClick={() => navigator.clipboard.writeText(liveLobby.id)}
								>
									<Copy className="size-3" />
								</button>
							</div>
							<span className="text-muted-foreground/40">·</span>
							<span className="font-mono text-[11px] text-muted-foreground">
								up {uptime}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-1.5 shrink-0">
						<Button variant="outline" size="sm">
							<RefreshCw className="size-3" />
							Restart
						</Button>
						<Button variant="outline" size="sm">
							Broadcast…
						</Button>
						<Button variant="outline" size="sm">
							<Edit className="size-3" />
							Edit
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="text-destructive hover:text-destructive"
							onClick={() => setDeleteOpen(true)}
						>
							<Trash2 className="size-3" />
							Delete
						</Button>
					</div>
				</div>

				{/* Metric Cards */}
				<div className="mt-5 grid grid-cols-3 gap-3">
					<Card className="p-3 gap-0 py-0 rounded-lg">
						<CardContent className="p-3">
							<p className="text-[11px] text-muted-foreground">Players</p>
							<div className="mt-1 flex items-baseline gap-1.5">
								<span className="text-lg font-semibold tabular-nums">
									{liveLobby.count}
								</span>
								<span className="font-mono text-[11px] text-muted-foreground">
									/ {capLabel}
								</span>
								{occ > 0 && (
									<span className="ml-auto font-mono text-[10.5px] text-muted-foreground/70">
										{occ}%
									</span>
								)}
							</div>
							<Progress
								value={occ}
								className="mt-2 h-1"
								indicatorClassName={
									occ >= 100
										? "bg-blue-500"
										: occ >= 85
											? "bg-amber-500"
											: occ === 0
												? "bg-muted-foreground/30"
												: "bg-emerald-500"
								}
							/>
						</CardContent>
					</Card>
					<Card className="p-3 gap-0 py-0 rounded-lg">
						<CardContent className="p-3">
							<p className="text-[11px] text-muted-foreground">Uptime</p>
							<div className="mt-1 flex items-baseline gap-1.5">
								<span className="text-lg font-semibold tabular-nums font-mono">
									{uptime}
								</span>
							</div>
							<p className="font-mono text-[10.5px] text-muted-foreground/60 mt-2">
								since instance start
							</p>
						</CardContent>
					</Card>
					<Card className="p-3 gap-0 py-0 rounded-lg">
						<CardContent className="p-3">
							<p className="text-[11px] text-muted-foreground">Map</p>
							<div className="mt-1 flex items-baseline gap-1.5">
								<span className="text-lg font-semibold tabular-nums truncate">
									{liveLobby.map}
								</span>
							</div>
							<p className="font-mono text-[10.5px] text-muted-foreground/60 mt-2">
								{liveLobby.id.slice(0, 8)}…
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Content */}
			<div className="py-5 grid grid-cols-[1fr_280px] gap-5">
				{/* Main Tabs */}
				<Card className="overflow-hidden rounded-lg gap-0 py-0">
					<Tabs defaultValue="players">
						<div className="px-4 py-2.5 border-b flex items-center gap-2">
							<TabsList>
								<TabsTrigger value="players" className="text-xs">
									Players
									<span className="font-mono text-[10px] text-muted-foreground ml-1">
										{liveLobby.count}
									</span>
								</TabsTrigger>
								<TabsTrigger value="events" className="text-xs">
									Events
								</TabsTrigger>
								<TabsTrigger value="config" className="text-xs">
									Config
								</TabsTrigger>
							</TabsList>
							<div className="ml-auto flex items-center gap-1.5">
								<div className="relative">
									<Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
									<Input
										placeholder="Filter players"
										className="h-7 w-[180px] pl-7 text-xs"
									/>
								</div>
							</div>
						</div>
						<TabsContent value="players" className="mt-0">
							<PlayersTable
								players={players}
								onKick={handleKick}
								onMove={setMoveTarget}
							/>
						</TabsContent>
						<TabsContent value="events" className="mt-0 p-5">
							{events.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									No events yet — join/leave events will appear here in real
									time.
								</p>
							) : (
								<ul className="flex flex-col gap-2.5">
									{events.map((x, i) => (
										<li key={i} className="flex items-start gap-2 text-xs">
											<span className="font-mono text-[10.5px] text-muted-foreground/60 pt-px w-9 shrink-0">
												{x.time}
											</span>
											<span className={x.cls}>{x.text}</span>
										</li>
									))}
								</ul>
							)}
						</TabsContent>
						<TabsContent value="config" className="mt-0 p-5">
							<dl className="text-xs grid grid-cols-2 gap-3">
								<div>
									<dt className="text-muted-foreground">Player cap</dt>
									<dd className="font-mono mt-0.5 tabular-nums">{capLabel}</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Map</dt>
									<dd className="font-mono mt-0.5">{liveLobby.map}</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Instance ID</dt>
									<dd className="font-mono mt-0.5 text-[10px] break-all">
										{liveLobby.id}
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Name</dt>
									<dd className="font-mono mt-0.5">{liveLobby.name}</dd>
								</div>
							</dl>
						</TabsContent>
					</Tabs>
					<CardFooter className="px-4 py-2.5 border-t">
						<span className="text-[11px] text-muted-foreground">
							<span className="text-foreground">{players.length}</span> player
							{players.length === 1 ? "" : "s"}
						</span>
						<span className="font-mono text-[10px] text-muted-foreground/50 ml-2 flex items-center gap-1">
							<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
							live
						</span>
						<div className="ml-auto flex items-center gap-1.5">
							<Button variant="outline" size="sm">
								Export CSV
							</Button>
						</div>
					</CardFooter>
				</Card>

				{/* Side Panel */}
				<aside className="flex flex-col gap-3">
					<Card className="p-4 rounded-lg gap-0 py-0">
						<CardContent className="p-4">
							<p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-2.5">
								Instance
							</p>
							<dl className="text-xs flex flex-col gap-1.5">
								<div className="flex justify-between gap-2">
									<dt className="text-muted-foreground">Type</dt>
									<dd>Lobby</dd>
								</div>
								<div className="flex justify-between gap-2">
									<dt className="text-muted-foreground">Map</dt>
									<dd className="font-mono truncate">{liveLobby.map}</dd>
								</div>
								<div className="flex justify-between gap-2">
									<dt className="text-muted-foreground">Players</dt>
									<dd className="font-mono tabular-nums">
										{liveLobby.count} / {capLabel}
									</dd>
								</div>
								<div className="flex justify-between gap-2">
									<dt className="text-muted-foreground">Uptime</dt>
									<dd className="font-mono tabular-nums">{uptime}</dd>
								</div>
								<div className="flex justify-between gap-2">
									<dt className="text-muted-foreground">Status</dt>
									<dd>
										<StatusBadge status={status} />
									</dd>
								</div>
							</dl>
						</CardContent>
					</Card>

					<Card className="p-4 rounded-lg gap-0 py-0">
						<CardContent className="p-4">
							<div className="flex items-center justify-between mb-2.5">
								<p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
									Recent events
								</p>
								<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
							</div>
							{events.length === 0 ? (
								<p className="text-[11px] text-muted-foreground/60">
									Waiting for events…
								</p>
							) : (
								<ul className="flex flex-col gap-2">
									{events.slice(0, 6).map((x, i) => (
										<li key={i} className="flex items-start gap-2 text-[11px]">
											<span className="font-mono text-[10px] text-muted-foreground/50 pt-px w-9 shrink-0">
												{x.time}
											</span>
											<span className={x.cls}>{x.text}</span>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>
				</aside>
			</div>

			{/* Move Dialog */}
			<MovePlayerDialog
				open={moveTarget !== null}
				player={moveTarget}
				currentLobbyId={lobbyId}
				onClose={() => setMoveTarget(null)}
				onMove={handleMove}
			/>

			{/* Delete Dialog */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<div className="flex items-start gap-3">
							<div className="size-9 rounded-md border border-red-400/20 bg-red-400/10 flex items-center justify-center shrink-0">
								<Trash2 className="size-4 text-red-400" />
							</div>
							<div>
								<AlertDialogTitle>Delete lobby instance?</AlertDialogTitle>
								<AlertDialogDescription className="mt-1">
									<span className="font-mono">{liveLobby.id}</span> will be stopped
									and all{" "}
									<span className="font-medium text-foreground">
										{liveLobby.count}
									</span>{" "}
									players disconnected.
								</AlertDialogDescription>
							</div>
						</div>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"
						>
							<Trash2 className="size-3" />
							Delete instance
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</ScrollArea>
	);
}
