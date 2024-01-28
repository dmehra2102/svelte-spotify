import type { PageLoad } from './$types';
import { fetchRefresh } from '$helpers';

export const load: PageLoad = async ({ fetch: _fetch, parent }) => {
	const fetch = (path: string) => fetchRefresh(_fetch, path);
	const { user } = await parent();
	const newReleases = fetch('/api/spotify/browse/new-releases?limit=6');
	const featuredPlaylists = fetch('/api/spotify/browse/featured-playlists?limit=6');
	const userPlaylists = fetch(`/api/spotify/users/${user?.id}/playlists?limit=6`);

	const categoriesResponse = await fetch(`api/spotify/browse/categories`);
	const categoriesResponseJSON: SpotifyApi.MultipleCategoriesResponse | undefined =
		categoriesResponse.ok ? await categoriesResponse.json() : undefined;

	const randomCats = categoriesResponseJSON
		? categoriesResponseJSON.categories.items.sort(() => 0.5 - Math.random()).slice(0, 3)
		: [];

	const randomCatsPromises = randomCats.map((cat) =>
		fetch(`/api/spotify/browse/categories/${cat.id}/playlists?limit=6`)
	);

	const [newReleasesRes, featuredPlaylistsRes, userPlaylistsRes, ...randomCatsRes] =
		await Promise.all([newReleases, featuredPlaylists, userPlaylists, ...randomCatsPromises]);

	return {
		newReleases: newReleasesRes.ok
			? ((await newReleasesRes.json()) as SpotifyApi.ListOfNewReleasesResponse)
			: undefined,
		featuredPlaylists: featuredPlaylistsRes.ok
			? ((await featuredPlaylistsRes.json()) as SpotifyApi.ListOfFeaturedPlaylistsResponse)
			: undefined,
		userPlaylists: userPlaylistsRes.ok
			? ((await userPlaylistsRes.json()) as SpotifyApi.ListOfUsersPlaylistsResponse)
			: undefined,
		homeCategories: randomCats,
		categoriesPlaylists: await Promise.all(
			randomCatsRes.map((res) =>
				res.ok ? (res.json() as Promise<SpotifyApi.CategoryPlaylistsResponse>) : undefined
			)
		)
	};
};
