'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from './I18nProvider';
import { NavigationTracker } from './NavigationTracker';
import { NotificationsManager } from './NotificationsManager';
import { ServiceWorkerRegistration } from './ServiceWorkerRegistration';
import { SettingsProvider } from './SettingsProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <I18nProvider>
        {children}
        <NavigationTracker />
        <NotificationsManager />
        <ServiceWorkerRegistration />
      </I18nProvider>
    </SettingsProvider>
  );
}
