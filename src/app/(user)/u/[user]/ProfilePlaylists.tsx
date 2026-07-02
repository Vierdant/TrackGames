import PlaylistDisplay from "@/components/playlist/PlaylistCard";
import { getUserPlaylists } from "@/lib/data/playlists";
import PlaylistCreatorModal from "./PlaylistCreatorModal";

export default async function ProfilePlaylists({ userId, canCreate, isFollower }: Readonly<{ userId: string; canCreate: boolean; isFollower: boolean }>) {
	const playlists = await getUserPlaylists(userId, isFollower ? "followers" : "public");

	return (
		<div className="flex flex-col gap-4">
			<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
				{playlists.map((playlist) => (
					<PlaylistDisplay key={playlist.id} playlist={playlist} hasHref />
				))}
				<PlaylistCreatorModal canCreate={canCreate} />
				{!playlists.length && !canCreate && <p className="rounded border border-border bg-bg p-4 text-sm text-text-muted">No playlists yet.</p>}
			</div>
		</div>
	);
}
