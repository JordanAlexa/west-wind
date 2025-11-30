import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import App from './App'
import Home from './pages/Home'
import Register from './features/auth/components/Register'
import { PostThread } from './pages/PostThread'
import { Profile } from './pages/Profile'
import { Search } from './features/search/pages/SearchPage'
import { HashtagFeed } from './pages/HashtagFeed';
import { Settings } from './pages/Settings';
const rootRoute = createRootRoute({
    component: App,
})

// Create an index route
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
})

// Create a register route
const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: Register,
})

// Create profile route
const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile/$handle',
    component: Profile,
})

// Create post thread route
const postThreadRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile/$handle/post/$rkey',
    component: PostThread,
})

// Create search route
const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/search',
    component: Search,
})

const hashtagRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/hashtag/$tag',
    component: HashtagFeed,
});

const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings',
    component: Settings,
});

import { Notifications } from './pages/Notifications';
import { redirect } from '@tanstack/react-router';

// ... imports ...

// Create notifications route
const notificationsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/notifications',
    component: Notifications,
})

// Create simplified post route (redirects to full thread URL)
const postRedirectRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/post/$id',
    loader: async ({ params }) => {
        // In a real app, we might fetch the post to get the author handle
        // For now, let's just redirect to a generic URL or handle it in the component
        // Since our PostThread URL requires handle, we have a mismatch.
        // Let's update PostThread to optionally accept just ID or fetch handle.
        // OR, better for now: redirect to a route that handles the lookup.
        // But we don't have that.
        // Let's just make a route that renders PostThread and let it handle the missing handle.
        // Actually, PostThread expects $handle and $rkey (which is ID).
        // We can just use "user" as handle placeholder if we don't know it, 
        // as long as the backend only cares about ID.
        throw redirect({
            to: '/profile/$handle/post/$rkey',
            params: { handle: 'user', rkey: params.id },
        })
    },
})

// Create the route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    registerRoute,
    profileRoute,
    postThreadRoute,
    searchRoute,
    hashtagRoute,
    settingsRoute,
    notificationsRoute,
    postRedirectRoute,
])

// Create the router instance
export const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
