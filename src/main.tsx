import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { RouterProvider } from '@tanstack/react-router'
// import { router } from './router'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import './index.css'

import { AppProvider } from './providers/AppProvider'
import { SocketProvider } from './providers/SocketProvider'


import * as Sentry from "@sentry/react";

/*
Sentry.init({
  dsn: "https://317d07f9e55f2da8caf8d9cb4595dc8f@o4510461476995072.ingest.de.sentry.io/4510461818241104",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/west-wind-server-.*\.a\.run\.app/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when an error occurs.
});
*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <SocketProvider>
        <RouterProvider router={router} />
        {/* <div>Minimal App with Provider and Router Import</div> */}
      </SocketProvider>
    </AppProvider>
  </StrictMode>,
)
