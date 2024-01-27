<script lang="ts">
	import { page } from '$app/stores';
	import { tick, type ComponentType } from 'svelte';
	import logo from '$assets/Spotify_Logo_RGB_White.png';
	import { Home, Search, ListMusic, type Icon, Menu, X } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { beforeNavigate } from '$app/navigation';
	import { IconButton } from '$components';

	export let desktop: boolean;

	let isMobileMenuOpen: boolean = false;
	let openMenuButton: IconButton;
	let closeMenuButton: IconButton;
	let lastFocusableElement: HTMLAnchorElement;
	$: isOpen = desktop || isMobileMenuOpen;

	const menuItems: { path: string; label: string; icon: ComponentType<Icon> }[] = [
		{
			path: '/',
			label: 'Home',
			icon: Home
		},
		{
			path: '/search',
			label: 'Search',
			icon: Search
		},
		{
			path: '/playlists',
			label: 'Playlists',
			icon: ListMusic
		}
	];

	const openMenu = async () => {
		isMobileMenuOpen = true;
		await tick();
		closeMenuButton.getButton().focus();
	};

	const closeMenu = async () => {
		isMobileMenuOpen = false;
		await tick();
		openMenuButton.getButton().focus();
	};

	// We are creating this functions for making Menu accessable through keyboard
	const moveFocusToBottom = (e: KeyboardEvent) => {
		if (desktop) return;
		if (e.key === 'Tab' && e.shiftKey) {
			e.preventDefault();
			lastFocusableElement.focus();
		}
	};
	const moveFocusToTop = (e: KeyboardEvent) => {
		if (desktop) return;
		if (e.key === 'Tab' && !e.shiftKey) {
			e.preventDefault();
			closeMenuButton.getButton().focus();
		}
	};

	const handleEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			closeMenu();
		}
	};

	// We are using this beforeNaigate method to close our sidebar first, before moving to some other pages.
	beforeNavigate(() => {
		isMobileMenuOpen = false;
	});
</script>

<svelte:head>
	<!-- We are doing this to stop background scrolling when sidebar is open .-->
	{#if !desktop && isMobileMenuOpen}
		<style>
			body {
				overflow: hidden;
			}
		</style>
	{/if}
</svelte:head>

<div class="nav-content" class:desktop class:mobile={!desktop}>
	{#if !desktop && isMobileMenuOpen}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="overlay"
			on:click={closeMenu}
			transition:fade={{ duration: 200 }}
			on:keyup={handleEscape}
		/>
	{/if}
	<nav aria-label="Main">
		{#if !desktop}
			<IconButton
				icon={Menu}
				label="Open Menu"
				bind:this={openMenuButton}
				aria-expanded={isOpen}
				on:click={openMenu}
				class="open-menu-button"
			/>
		{/if}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="nav-content-inner"
			class:is-hidden={!isOpen}
			style:visibility={isOpen ? 'visible' : 'hidden'}
			on:keyup={handleEscape}
		>
			{#if !desktop}
				<IconButton
					icon={X}
					label="Close Menu"
					bind:this={closeMenuButton}
					on:click={closeMenu}
					on:keydown={moveFocusToBottom}
					class="close-menu-button"
				/>
			{/if}
			<img src={logo} alt="logo" class="logo" />
			<ul>
				{#each menuItems as item, index}
					{@const iconProps = {
						focusable: 'false',
						'aria-hidden': true,
						color: 'var(--text-color)',
						size: 26,
						strokeWidth: 2
					}}
					<li class:active={item.path === $page.url.pathname}>
						{#if menuItems.length === index + 1}
							<a href={item.path} bind:this={lastFocusableElement} on:keydown={moveFocusToTop}>
								<svelte:component this={item.icon} {...iconProps} />
								{item.label}
							</a>
						{:else}
							<a href={item.path}>
								<svelte:component this={item.icon} {...iconProps} />
								{item.label}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</nav>
</div>

<style lang="scss">
	.nav-content {
		.overlay {
			position: fixed;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			background-color: var(--sidebar-color);
			opacity: 0.7;
			z-index: 100;
			@include breakpoint.up('md') {
				display: none;
			}
		}
		.logo {
			max-width: 100%;
			width: 130px;
		}
		.nav-content-inner {
			padding: 20px;
			min-width: var(--sidebar-width);
			background-color: var(--sidebar-color);
			height: 100vh;
			overflow: auto;
			display: none;
			ul {
				padding: 0;
				margin: 20px 0 0;
				list-style: none;
				li {
					&.active {
						a {
							opacity: 1;
						}
					}
					a {
						display: flex;
						align-items: center;
						text-decoration: none;
						color: var(--text-color);
						font-size: functions.toRem(14);
						font-weight: 500;
						padding: 5px;
						margin: 10px 0;
						opacity: 0.7;
						transition: opacity 0.2s;
						&:hover,
						&:focus {
							opacity: 1;
						}
						:global(svg) {
							margin-right: 12px;
						}
					}
				}
			}
		}
		&.desktop {
			position: sticky;
			top: 0;
			.nav-content-inner {
				@include breakpoint.up('md') {
					display: block;
				}
			}
		}
		&.mobile .nav-content-inner {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 100;
			transition:
				transform 200ms,
				opacity 200ms;
			&.is-hidden {
				transition:
					transform 200ms,
					opacity 200ms,
					visibility 200ms;
				transform: translateX(-100%);
				opacity: 0;
			}
			@include breakpoint.down('md') {
				display: block;
			}
		}
		:global(.open-menu-button) {
			@include breakpoint.up('md') {
				display: none;
			}
		}
		:global(.close-menu-button) {
			position: absolute;
			right: 20px;
			top: 20px;
		}
	}
</style>
