import { init, browserTracingIntegration } from '@sentry/react';
import { Replay } from '@sentry/replay';

export const initSentry = () => {
  if (import.meta.env.PROD) {
    init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        browserTracingIntegration(),
        new Replay(),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
};