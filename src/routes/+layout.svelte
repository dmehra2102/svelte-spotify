<script lang="ts">
	import '../styles/main.scss';
	import 'modern-normalize/modern-normalize.css';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	$: user = data?.user;
</script>

<slot />
