import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import { AuthProvider } from "@/components/context/AuthContext";

export const metadata: Metadata = {
  title: "HomeStay - Find Your Perfect Stay",
  description:
    "Discover homestays, villas, apartments, and cabins for your next trip with HomeStay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                try {
                  // Ignore third-party Chrome Extension errors (e.g. M_ID in 200.js)
                  window.addEventListener('unhandledrejection', function(event) {
                    var reason = event.reason;
                    var str = String((reason && (reason.stack || reason.message)) || reason || '');
                    if (str.indexOf('chrome-extension://') !== -1 || str.indexOf('M_ID') !== -1) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                    }
                  }, true);

                  window.addEventListener('error', function(event) {
                    var filename = event.filename || '';
                    var message = String(event.message || '');
                    var stack = event.error ? String(event.error.stack || '') : '';
                    if (
                      filename.indexOf('chrome-extension://') !== -1 ||
                      message.indexOf('M_ID') !== -1 ||
                      stack.indexOf('chrome-extension://') !== -1
                    ) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                    }
                  }, true);

                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                        m.target.removeAttribute('bis_skin_checked');
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked']
                  });
                  setTimeout(function() { observer.disconnect(); }, 5000);
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
