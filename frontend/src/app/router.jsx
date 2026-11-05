import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../features/home/HomePage';
import SiteLayout from '../shared/layout/SiteLayout';

const SolutionsPage = lazy(() => import('../features/solutions/SolutionsPage'));
const DiscoveryHubPage = lazy(() => import('../features/discovery/pages/DiscoveryHubPage'));
const GuideMePage = lazy(() => import('../features/discovery/pages/GuideMePage'));
const DescribePage = lazy(() => import('../features/discovery/pages/DescribePage'));
const TalkPage = lazy(() => import('../features/discovery/pages/TalkPage'));
const ResumePage = lazy(() => import('../features/discovery/pages/ResumePage'));
const ConfirmationPage = lazy(() => import('../features/discovery/pages/ConfirmationPage'));
const ContactPage = lazy(() => import('../features/contact/ContactPage'));
const PrivacyPage = lazy(() => import('../features/legal/PrivacyPage'));
const TermsPage = lazy(() => import('../features/legal/TermsPage'));
const NotFoundPage = lazy(() => import('../features/not-found/NotFoundPage'));

const page = (Component) => (
  <Suspense fallback={<div className="route-loading" aria-busy="true" />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/solutions', element: page(SolutionsPage) },
      { path: '/discovery', element: page(DiscoveryHubPage) },
      { path: '/discovery/guide', element: page(GuideMePage) },
      { path: '/discovery/describe', element: page(DescribePage) },
      { path: '/discovery/talk', element: page(TalkPage) },
      { path: '/discovery/resume/:token', element: page(ResumePage) },
      { path: '/discovery/thanks', element: page(ConfirmationPage) },
      { path: '/contact', element: page(ContactPage) },
      { path: '/privacy', element: page(PrivacyPage) },
      { path: '/terms', element: page(TermsPage) },
      { path: '*', element: page(NotFoundPage) },
    ],
  },
]);
