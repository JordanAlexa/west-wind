import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import App from './App'
import Home from './pages/Home'
import Register from './features/auth/components/Register'
import { PostThread } from './pages/PostThread'
import { Profile } from './pages/Profile'
import { Search } from './features/search/pages/SearchPage'
import { HashtagFeed } from './pages/HashtagFeed';
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

// Create the route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    registerRoute,
    profileRoute,
    postThreadRoute,
    searchRoute,
    hashtagRoute,
])

// Create the router instance
export const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
