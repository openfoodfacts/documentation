# Openfoodfacts-documentation

This project aims at gathering all Open Food Facts technical documentation and publish it in a single website powered by Fumadocs.

In particular, it aims at providing  up-to-date API docs, generated from the spec file, for easy developer integration.

The result is available at https://openfoodfacts.github.io/documentation

## How it works

The idea is to take the docs/ and `.md` files in the source projects, transform them to mdx (whith some fancy transformations) and publish them.

It also pull OpenAPI documentations to publish them.

* `docs/` contains Markdown documentation synced from source Open Food Facts projects (`product-opener`, `robotoff`, `open-prices`, `search-a-licious`, etc.).
* `archive-docs/` keeps the historical Fumadocs-oriented rewrite structure that was used as a transition layer before publication.
* `content/docs/` is the MDX tree used at runtime by Fumadocs (`source.config.ts` points to this folder).
  * `content/docs/*/(docs)/` contains rendered guides/reference pages.
  * `content/docs/*/(api)/` contains generated OpenAPI endpoint documentation.
* `ref/` stores the source OpenAPI definitions (split YAML files, schemas, parameters, examples).
* `specfiles-json/` stores bundled/dereferenced OpenAPI JSON files consumed by the docs generators.
* `scripts/` contains documentation generation scripts:
  * `compile-openapi-specs.mjs` bundles YAML specs from `ref/` into JSON in `specfiles-json/`.
  * `generate-docs.mjs` and `generate-schemas.mjs` generate MDX API and schema pages under `content/docs/`.
* `app/`, `components/`, and `lib/` contain the Next.js/Fumadocs website code (routing/layout, UI components, and source loader/remark helpers).
* `public/` contains static assets served by the website (images, favicon, `.nojekyll`).

PS: arvchive-docs was a tentative complete rewrite of the doc for fumadocs but it is abandoned  (as it won't be updated by projects maintainers) 

## Status

Currently it accurately collects documentation updates from openfoodfacts-server repository.
Some other repository documentation are pulled but might have errors when transpiled and thus are not really updated.

## Contribution

**This projects seeks contributions**

The way to contribute to the documentation by itself is by contributing documentation to the single projects.

Contributions to this repository should be essentially:
* to modify the Fumadocs layout or configuration
* to modify the scripts that pulls / transform and publish the documentation
* to modify the general pages that introduces the whole documentation

Things really need:
* fix possible errors blocking documentations updates (it might mean fixing source repository)
* install the checks on source repositories to ensure it won't break again (see https://github.com/openfoodfacts/openfoodfacts-server/pull/12780 for an example)
We need to document:
* how to add a new repository
* the specific markup possible to use in md that will be transformed for fine rendering as mdx in fumadocs

## Testing locally

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.vercel.app) - learn about Fumadocs
