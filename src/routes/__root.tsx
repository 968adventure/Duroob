import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import NotFound from "@/pages/NotFound";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="notfound-page is-ar" dir="rtl">
      <div className="notfound-card glass-panel">
        <h1>تعذّر تحميل هذه الصفحة</h1>
        <p lang="en" dir="ltr">
          This page didn&apos;t load. Try again or head back to the homepage.
        </p>
        <div className="notfound-actions">
          <button
            type="button"
            className="notfound-link"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            <span>إعادة المحاولة</span>
            <span lang="en" dir="ltr">
              Try again
            </span>
          </button>
          <a className="notfound-link" href="/">
            <span>الصفحة الرئيسية</span>
            <span lang="en" dir="ltr">
              Home
            </span>
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Duroob Expeditions" },
      { name: "theme-color", content: "#1e392e" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Beiruti:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Noto+Kufi+Arabic:wght@400;500;600;700&family=Tajawal:wght@400;500;700&family=Zain:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <WhatsAppFloat />
      <Toaster />
    </QueryClientProvider>
  );
}
