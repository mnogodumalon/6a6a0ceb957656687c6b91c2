import '@/lib/sentry';
import '@/lib/stale-bundle';
import { Fragment, lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { locale, onLocaleChange, syncProfileLocale } from '@/i18n';
import { ActionsProvider } from '@/context/ActionsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorBusProvider } from '@/components/ErrorBus';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import PublicPagesAdmin from '@/pages/PublicPagesAdmin';
import RaeumePage from '@/pages/RaeumePage';
import RaeumeDetailPage from '@/pages/RaeumeDetailPage';
import DozentenPage from '@/pages/DozentenPage';
import DozentenDetailPage from '@/pages/DozentenDetailPage';
import KurseWorkshopsPage from '@/pages/KurseWorkshopsPage';
import KurseWorkshopsDetailPage from '@/pages/KurseWorkshopsDetailPage';
import TeilnehmerPage from '@/pages/TeilnehmerPage';
import TeilnehmerDetailPage from '@/pages/TeilnehmerDetailPage';
import AnmeldungenPage from '@/pages/AnmeldungenPage';
import AnmeldungenDetailPage from '@/pages/AnmeldungenDetailPage';
import ZahlungenPage from '@/pages/ZahlungenPage';
import ZahlungenDetailPage from '@/pages/ZahlungenDetailPage';
// <custom:imports>
const KursAnlegenPage = lazy(() => import('@/pages/intents/KursAnlegenPage'));
const AnmeldungZahlungPage = lazy(() => import('@/pages/intents/AnmeldungZahlungPage'));
// </custom:imports>

// Lazy: public pages live outside <Layout> and only load on /#/public/:slug —
// dashboard users never pay for them, anonymous visitors skip the dashboard.
const PublicPage = lazy(() => import('@/pages/public/PublicPage'));

// Language switch = full remount below the router: every t()/label lookup
// re-evaluates, the la-* widgets re-read <html lang>. Sits INSIDE
// ActionsProvider so chat/drawer state survives a switch, and inside
// HashRouter so the current route survives (it re-reads the URL hash).
function LocaleGate({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(locale);
  useEffect(() => onLocaleChange(() => setCurrent(locale)), []);
  // Adopt the LA profile language (SSOT) — but never on public routes,
  // where the visitor's browser language governs (initPublicLocale).
  useEffect(() => {
    if (!window.location.hash.startsWith('#/public')) void syncProfileLocale();
  }, []);
  return <Fragment key={current}>{children}</Fragment>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ErrorBusProvider>
        <HashRouter>
          <ActionsProvider>
            <LocaleGate>
            <Routes>
              <Route path="public/:slug" element={<Suspense fallback={null}><PublicPage /></Suspense>} />
              <Route element={<Layout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="raeume" element={<RaeumePage />} />
                <Route path="raeume/:id" element={<RaeumeDetailPage />} />
                <Route path="dozenten" element={<DozentenPage />} />
                <Route path="dozenten/:id" element={<DozentenDetailPage />} />
                <Route path="kurse-workshops" element={<KurseWorkshopsPage />} />
                <Route path="kurse-workshops/:id" element={<KurseWorkshopsDetailPage />} />
                <Route path="teilnehmer" element={<TeilnehmerPage />} />
                <Route path="teilnehmer/:id" element={<TeilnehmerDetailPage />} />
                <Route path="anmeldungen" element={<AnmeldungenPage />} />
                <Route path="anmeldungen/:id" element={<AnmeldungenDetailPage />} />
                <Route path="zahlungen" element={<ZahlungenPage />} />
                <Route path="zahlungen/:id" element={<ZahlungenDetailPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="verwaltung/oeffentliche-seiten" element={<PublicPagesAdmin />} />
                {/* <custom:routes> */}
                <Route path="intents/kurs-anlegen" element={<Suspense fallback={null}><KursAnlegenPage /></Suspense>} />
                <Route path="intents/anmeldung-zahlung" element={<Suspense fallback={null}><AnmeldungZahlungPage /></Suspense>} />
                {/* </custom:routes> */}
              </Route>
            </Routes>
            </LocaleGate>
          </ActionsProvider>
        </HashRouter>
      </ErrorBusProvider>
    </ErrorBoundary>
  );
}
