import type { RequestHandler } from './$types';
import { SPOTIFY_APP_CLIENT_ID, SPOTIFY_APP_SECRET_KEY } from '$env/static/private';
import { error, json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, fetch }) => {
	const refreshToken = cookies.get('refresh_token');

	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${Buffer.from(
				`${SPOTIFY_APP_CLIENT_ID}:${SPOTIFY_APP_SECRET_KEY}`
			).toString('base64')}`
		},
		body: new URLSearchParams({
			refresh_token: refreshToken || '',
			grant_type: 'refresh_token'
		})
	});

	const responseJSON = await response.json();
	if (responseJSON.error) {
		cookies.delete('refresh_token', { path: '/' });
		cookies.delete('access_token', { path: '/' });
		throw error(401, responseJSON.error_description);
	}

	cookies.set('access_token', responseJSON.access_token, { path: '/' });
	cookies.set('refresh_token', responseJSON.refresh_token, { path: '/' });

	return json(responseJSON);
};
