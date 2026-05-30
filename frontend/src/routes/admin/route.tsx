import {
	createFileRoute,
	Link,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import {
	Activity,
	Bell,
	ChevronDown,
	ChevronRight,
	Gamepad2,
	Globe,
	Layers,
	LayoutDashboard,
	Map,
	PartyPopper,
	Server,
	Settings,
	ShieldBan,
	Users,
} from "lucide-react";
import * as React from "react";
import { Badge } from "#/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Separator } from "#/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "#/components/ui/sidebar";
import { cn } from "#/lib/utils";
import { wsClient } from "#/lib/ws";

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
});

function NavBadge({ children }: { children: React.ReactNode }) {
	return (
		<span className="ml-auto font-mono text-[10px] text-muted-foreground">
			{children}
		</span>
	);
}

function AdminSidebar({ pathname }: { pathname: string }) {
	const [instancesOpen, setInstancesOpen] = React.useState(true);

	const isActive = (path: string) =>
		pathname === path || pathname.startsWith(path + "/");

	return (
		<Sidebar>
			<SidebarHeader className="border-b h-12">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton className="h-9 gap-2">
									<div className="flex aspect-square size-6 items-center justify-center rounded-md bg-foreground text-background shrink-0">
										<Layers className="size-3" />
									</div>
									<div className="flex flex-col leading-tight min-w-0">
										<span className="text-xs font-semibold">Minestom</span>
										<span className="font-mono text-[10px] text-muted-foreground">
											admin · v0.7.4
										</span>
									</div>
									<ChevronDown className="size-3 text-muted-foreground ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="min-w-[180px]">
								<DropdownMenuLabel>Workspace</DropdownMenuLabel>
								<DropdownMenuItem>minestom · prod</DropdownMenuItem>
								<DropdownMenuItem className="text-muted-foreground">
									minestom · staging
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>New workspace…</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-[10px] tracking-wider">
						Overview
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									size="sm"
									asChild
									isActive={isActive("/admin") && !isActive("/admin/lobbies")}
								>
									<Link to="/admin">
										<LayoutDashboard className="size-3.5" />
										Dashboard
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton size="sm">
									<Activity className="size-3.5" />
									Live activity
								</SidebarMenuButton>
								<SidebarMenuBadge>
									<NavBadge>218</NavBadge>
								</SidebarMenuBadge>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton size="sm">
									<Bell className="size-3.5" />
									Alerts
								</SidebarMenuButton>
								<SidebarMenuBadge>
									<NavBadge>3</NavBadge>
								</SidebarMenuBadge>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel className="text-[10px] tracking-wider">
						Instances
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									size="sm"
									onClick={() => setInstancesOpen((v) => !v)}
								>
									<Layers className="size-3.5" />
									Instances
									<ChevronRight
										className={cn(
											"size-3 text-muted-foreground ml-auto transition-transform",
											instancesOpen && "rotate-90",
										)}
									/>
								</SidebarMenuButton>
							</SidebarMenuItem>

							{instancesOpen && (
								<>
									<SidebarMenuItem>
										<SidebarMenuButton
											size="sm"
											asChild
											isActive={isActive("/admin/lobbies")}
											className="pl-7"
										>
											<Link to="/admin/lobbies">
												<Server className="size-3.5" />
												Lobbies
											</Link>
										</SidebarMenuButton>
										<SidebarMenuBadge>
											<NavBadge>12</NavBadge>
										</SidebarMenuBadge>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton
											size="sm"
											className="pl-7 text-muted-foreground"
										>
											<Gamepad2 className="size-3.5" />
											Games
										</SidebarMenuButton>
										<SidebarMenuBadge>
											<NavBadge>34</NavBadge>
										</SidebarMenuBadge>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton
											size="sm"
											className="pl-7 text-muted-foreground"
										>
											<PartyPopper className="size-3.5" />
											Parties
										</SidebarMenuButton>
										<SidebarMenuBadge>
											<NavBadge>89</NavBadge>
										</SidebarMenuBadge>
									</SidebarMenuItem>
								</>
							)}

							<SidebarMenuItem>
								<SidebarMenuButton size="sm">
									<Map className="size-3.5" />
									Maps
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton size="sm">
									<Users className="size-3.5" />
									Players
								</SidebarMenuButton>
								<SidebarMenuBadge>
									<NavBadge>1.2k</NavBadge>
								</SidebarMenuBadge>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel className="text-[10px] tracking-wider">
						Infrastructure
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton size="sm" className="text-muted-foreground">
									<Globe className="size-3.5" />
									Nodes
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton size="sm" className="text-muted-foreground">
									<ShieldBan className="size-3.5" />
									Bans &amp; reports
								</SidebarMenuButton>
								<SidebarMenuBadge>
									<NavBadge>7</NavBadge>
								</SidebarMenuBadge>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel className="text-[10px] tracking-wider">
						System
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton size="sm" className="text-muted-foreground">
									<Settings className="size-3.5" />
									Settings
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size="sm" className="h-9 gap-2">
							<div className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-[10px] font-bold shrink-0">
								RT
							</div>
							<div className="flex flex-col leading-tight min-w-0">
								<span className="text-xs font-medium truncate">
									root@minestom
								</span>
								<span className="font-mono text-[10px] text-muted-foreground">
									owner · 2fa on
								</span>
							</div>
							<ChevronDown className="size-3 text-muted-foreground ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="min-w-[180px]">
						<DropdownMenuLabel>Account</DropdownMenuLabel>
						<DropdownMenuItem>Profile</DropdownMenuItem>
						<DropdownMenuItem>API tokens</DropdownMenuItem>
						<DropdownMenuItem>Preferences</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-destructive">
							Sign out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarFooter>
		</Sidebar>
	);
}

function Topbar({ crumbs }: { crumbs: { label: string; href?: string }[] }) {
	return (
		<header className="h-12 shrink-0 border-b bg-sidebar flex items-center px-3 gap-3">
			<SidebarTrigger className="size-4" />
			<Separator orientation="vertical" className="h-6 my-auto" />
			<nav className="flex items-center gap-1 text-xs min-w-0">
				{crumbs.map((c, i) => {
					const last = i === crumbs.length - 1;
					return (
						<React.Fragment key={i}>
							{i > 0 && (
								<ChevronRight className="size-3 text-muted-foreground/60 shrink-0" />
							)}
							{c.href && !last ? (
								<Link
									to={c.href}
									className="text-muted-foreground hover:text-foreground truncate transition-colors"
								>
									{c.label}
								</Link>
							) : (
								<span
									className={cn(
										last
											? "font-medium truncate"
											: "text-muted-foreground truncate",
									)}
								>
									{c.label}
								</span>
							)}
						</React.Fragment>
					);
				})}
				<Badge
					variant="outline"
					className="font-mono ml-1.5 shrink-0 h-4 text-[10px] text-muted-foreground"
				>
					prod
				</Badge>
			</nav>
			<div className="ml-auto flex items-center gap-1.5">
				<div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
					<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
					node-eu-1 · 124ms
				</div>
			</div>
		</header>
	);
}

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
	if (pathname.match(/^\/admin\/lobbies\/[^/]+/)) {
		return [
			{ label: "Instances" },
			{ label: "Lobbies", href: "/admin/lobbies" },
			{ label: "Instance detail" },
		];
	}
	if (pathname.startsWith("/admin/lobbies")) {
		return [{ label: "Instances" }, { label: "Lobbies" }];
	}
	return [{ label: "Dashboard" }];
}

function RouteComponent() {
	const state = useRouterState();
	const pathname = state.location.pathname;
	const crumbs = getBreadcrumbs(pathname);

	React.useEffect(() => {
		wsClient.connect();
	}, []);

	return (
		<SidebarProvider>
			<AdminSidebar pathname={pathname} />
			<SidebarInset>
				<Topbar crumbs={crumbs} />
				<div className="p-6">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
