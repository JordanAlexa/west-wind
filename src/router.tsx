import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import App from './App'
// const DummyComponent = ({ name }: { name: string }) => <div>Dummy {name}</div>
import Home from './features/feed/pages/Home'
import Register from './features/auth/components/Register'
import { PostThread } from './features/feed/pages/PostThread'
import { Profile } from './features/profile/pages/Profile'
import { Search } from './features/search/pages/SearchPage'

import Onboarding from './routes/Onboarding'
import { Settings } from './features/settings/pages/Settings'

const rootRoute = createRootRoute({
    component: App,
})

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
})

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: Register,
})

const onboardingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/onboarding',
    component: Onboarding,
})

const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile/$handle',
    component: Profile,
})

const postThreadRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile/$handle/post/$rkey',
    component: PostThread,
})

const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/search',
    component: Search,
})

const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings',
    component: () => <div>Settings Page (Dummy)</div>,
})

const routeTree = rootRoute.addChildren([
    indexRoute,
    registerRoute,
    onboardingRoute,
    profileRoute,
    postThreadRoute,
    searchRoute,
    settingsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
