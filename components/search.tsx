"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";

export default function StaticSearchDialog(props: SharedProps) {
  const { locale } = useI18n(); // (optional) for i18n

  // Check if we're on GitHub Pages by looking at the hostname or pathname
  const isGitHubPages =
    typeof window !== "undefined" &&
    (window.location.hostname === "github.io" ||
      window.location.hostname.endsWith(".github.io") ||
      window.location.pathname.startsWith("/openfoodfacts-documentation"));

  const basePath = isGitHubPages ? "/openfoodfacts-documentation" : "";

  const { search, setSearch, query } = useDocsSearch({
    type: "static", // Use static mode for static export
    locale,
    from: `${basePath}/api/search`, // Use correct path for GitHub Pages
  });

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== "empty" ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
