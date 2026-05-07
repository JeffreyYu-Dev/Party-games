import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/lobbies")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/admin/lobbies"!</div>;
}
