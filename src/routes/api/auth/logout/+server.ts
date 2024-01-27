import { json, redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = ({ cookies, request }) => {
	cookies.delete('refersh_token', { path: '/' });
	cookies.delete('access_token', { path: '/' });

	if (request.headers.get('accept') === 'application/json') {
		return json({ success: true });
	}
	throw redirect(303, '/login');
};
