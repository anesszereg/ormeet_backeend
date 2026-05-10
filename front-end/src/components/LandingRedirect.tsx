import { useEffect } from 'react';

/**
 * Redirects to the public Next.js landing page.
 * URL is configurable via VITE_LANDING_URL (defaults to https://ormeet.com).
 *
 * Used for the React app's `/` route so visitors don't see a blank
 * "No routes matched" screen when the React app is hit at the root
 * (e.g. on app.ormeet.com or while the landing page hasn't been deployed yet).
 */
const LandingRedirect = () => {
  useEffect(() => {
    const landingUrl =
      import.meta.env.VITE_LANDING_URL || 'https://ormeet.com';

    // If we're already on the landing host, fall back to /browse-events
    // to avoid an infinite redirect loop.
    try {
      const target = new URL(landingUrl);
      if (target.host === window.location.host) {
        window.location.replace('/browse-events');
        return;
      }
    } catch {
      // ignore URL parse errors and proceed with replace below
    }

    window.location.replace(landingUrl);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        color: '#4F4F4F',
      }}
    >
      Redirecting to Ormeet…
    </div>
  );
};

export default LandingRedirect;
