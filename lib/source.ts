import { docs, reports } from '@/.source';
import { createOpenAPI } from 'fumadocs-openapi/server';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';

export const openapi = createOpenAPI({
  input: [
    './specfiles-json/openapi.json',
    './specfiles-json/openapi-v3.json',
    './specfiles-json/kPanels-openapi.json',
    './specfiles-json/robotoff-openapi.json',
    './specfiles-json/open-prices-openapi.json',
    './specfiles-json/folksonomy-openapi.json',
    './specfiles-json/nutripatrol-openapi.json',
  ],
});

// `loader()` also assign a URL to your pages
// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/docs',
  icon(icon) {
    if (icon && icon in icons)
      return createElement(icons[icon as keyof typeof icons]);
  },
  source: docs.toFumadocsSource(),
  plugins: [openapi.loaderPlugin()],
});

// Reports source loader for blog-style rendering
export const reportsSource = loader({
  baseUrl: '/docs/Infra/reports',
  source: reports.toFumadocsSource(),
});
