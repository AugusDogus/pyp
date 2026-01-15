import { headers } from "next/headers";
import { Suspense } from "react";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { Header } from "~/components/Header";
import { ScrollToTop } from "~/components/ScrollToTop";
import { SearchPageContent } from "~/components/search/SearchPageContent";
import { SearchVisibilityProvider } from "~/context/SearchVisibilityContext";
import { auth } from "~/lib/auth";

export default async function SearchPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <SearchVisibilityProvider>
      <div className="bg-background min-h-svh">
        <Header />
        <ErrorBoundary>
          <Suspense>
            <SearchPageContent isLoggedIn={!!session?.user} />
          </Suspense>
        </ErrorBoundary>
        <ScrollToTop />
      </div>
    </SearchVisibilityProvider>
  );
}
