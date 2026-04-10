// pages/_document.js
// Adds PWA meta tags, manifest link, and service worker registration to every page.

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color for Android chrome bar */}
        <meta name="theme-color" content="#1B2E1A" />
        <meta name="background-color" content="#0D1B2A" />

        {/* iOS PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ARK Law AI" />
        <link rel="apple-touch-icon" href="/ark-logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/ark-logo.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/ark-logo.png" />

        {/* Android / general */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="ARK Law AI" />
        <meta name="msapplication-TileColor" content="#0D1B2A" />
        <meta name="msapplication-TileImage" content="/ark-logo.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />

        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) {
                      console.log('ARK Law AI SW registered:', reg.scope);
                    })
                    .catch(function(err) {
                      console.log('SW registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
