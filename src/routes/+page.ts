import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
	const { user } = await parent();
	const new_releases = fetch('/api/spotify/browse/new-releases?limit=6');
	const featured_playlists = fetch('/api/spotify/browse/featured-playlists?limit=6');
	const user_playlists = fetch(`/api/spotify/user/${user?.id}/playlists?limit=6`);

	const categoriesResponse = await fetch('/api/spotify/browse/categories');
	const categoriesResponseJSON: SpotifyApi.MultipleCategoriesResponse | undefined =
		categoriesResponse.ok ? await categoriesResponse.json() : undefined;

	const randomCategories = categoriesResponseJSON
		? categoriesResponseJSON.categories.items.sort(() => 0.5 - Math.random()).slice(0.3)
		: [];

	const randomCategoriesPromises = randomCategories.map((categories) =>
		fetch(`/api/spotify/browse/categories/${categories.id}/playlists?limit=6`)
	);

	const [
		newReleasesResponse,
		featuredPlaylistsResponse,
		userPlaylistsResponse,
		...randomCategoriesResponse
	] = await Promise.all([
		new_releases,
		featured_playlists,
		user_playlists,
		...randomCategoriesPromises
	]);

	return {
		newReleases: newReleasesResponse.ok
			? (newReleasesResponse.json() as Promise<SpotifyApi.ListOfNewReleasesResponse>)
			: undefined,
		featuredPlaylists: featuredPlaylistsResponse.ok
			? (featuredPlaylistsResponse.json() as Promise<SpotifyApi.ListOfFeaturedPlaylistsResponse>)
			: undefined,
		userPlaylists: userPlaylistsResponse.ok
			? (userPlaylistsResponse.json() as Promise<SpotifyApi.ListOfUsersPlaylistsResponse>)
			: undefined,
		homeCategories: randomCategories,
		categoriesPlaylists: Promise.all(
			randomCategoriesResponse.map((response) =>
				response.ok ? (response.json() as Promise<SpotifyApi.CategoryPlaylistsResponse>) : undefined
			)
		)
	};
};
