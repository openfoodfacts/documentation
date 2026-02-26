import { source, reportsSource } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { DocsActions } from "@/components/DocsActions";
import { ReportBlogRenderer } from "@/components/ReportBlogRenderer";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { parse } from "yaml";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { ComponentProps } from "react";

interface ReportPageData {
  data: {
    title: string;
    body: React.ComponentType<{ components?: Record<string, unknown> }>;
    toc: Array<{ title: string; url: string; depth: number }>;
  };
}

async function getSchemaPaths(): Promise<
  Array<{ slug: string[]; lang: string }>
> {
  try {
    const apiYamlPath = join(process.cwd(), "ref", "api.yaml");
    const apiYamlContent = await readFile(apiYamlPath, "utf-8");
    const apiSpec = parse(apiYamlContent);

    const schemas = apiSpec.components?.schemas || {};
    const schemaPaths = Object.keys(schemas).map((schemaName) => {
      // Convert schema names like "Product-Base" to URL-friendly format like "product_base"
      // The schemas are in the /schemas/schemas folder, and we reference /schemas here so that the sidebar groups them and hides them until expanded
      const urlName = schemaName.toLowerCase().replace(/-/g, "_");
      return {
        slug: ["Product-Opener", "api", "schemas", "schemas", urlName],
        lang: "en",
      };
    });

    // Add the base schemas path
    schemaPaths.unshift({
      slug: ["Product-Opener", "api", "schemas"],
      lang: "en",
    });

    return schemaPaths;
  } catch (error) {
    console.error("Error reading api.yaml:", error);
    // Fallback to hardcoded paths if YAML parsing fails
    return [
      { slug: ["Product-Opener", "api", "schemas"], lang: "en" },
      {
        slug: ["Product-Opener", "api", "schemas", "schemas", "product_base"],
        lang: "en",
      },
      {
        slug: ["Product-Opener", "api", "schemas", "schemas", "product_misc"],
        lang: "en",
      },
      {
        slug: ["Product-Opener", "api", "schemas", "schemas", "product_tags"],
        lang: "en",
      },
      {
        slug: ["Product-Opener", "api", "schemas", "schemas", "product_images"],
        lang: "en",
      },
      {
        slug: [
          "Product-Opener",
          "api",
          "schemas",
          "schemas",
          "product_eco_score",
        ],
        lang: "en",
      },
      {
        slug: [
          "Product-Opener",
          "api",
          "schemas",
          "schemas",
          "product_ingredients",
        ],
        lang: "en",
      },
      {
        slug: [
          "Product-Opener",
          "api",
          "schemas",
          "schemas",
          "product_nutrition",
        ],
        lang: "en",
      },
      {
        slug: [
          "Product-Opener",
          "api",
          "schemas",
          "schemas",
          "product_nutriscore",
        ],
        lang: "en",
      },
      {
        slug: [
          "Product-Opener",
          "api",
          "schemas",
          "schemas",
          "product_quality",
        ],
        lang: "en",
      },
      {
        slug: [
          "Product-Opener",
          "api",
          "schemas",
          "schemas",
          "product_extended",
        ],
        lang: "en",
      },
      {
        slug: [
          "Product-Opener",
          "api",
          "schemas",
          "schemas",
          "product_metadata",
        ],
        lang: "en",
      },
      {
        slug: [
          "Product-Opener",
          "api",
          "schemas",
          "schemas",
          "product_knowledge_panels",
        ],
        lang: "en",
      },
      {
        slug: [
          "Product-Opener",
          "api",
          "schemas",
          "schemas",
          "product_attribute_groups",
        ],
        lang: "en",
      },
      {
        slug: ["Product-Opener", "api", "schemas", "schemas", "product"],
        lang: "en",
      },
      {
        slug: ["Product-Opener", "api", "schemas", "schemas", "ingredient"],
        lang: "en",
      },
      {
        slug: ["Product-Opener", "api", "schemas", "schemas", "nutrient"],
        lang: "en",
      },
    ];
  }
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;

  // Check if this is a report page (under Infra/reports)
  const isReportPage =
    params.slug &&
    params.slug.length >= 3 &&
    params.slug[0] === "Infra" &&
    params.slug[1] === "reports";

  if (isReportPage && params.slug) {
    // Use reports source for blog-style rendering
    const reportSlug = params.slug.slice(2); // Remove 'Infra/reports' prefix
    const reportPage = reportsSource.getPage(reportSlug);

    if (!reportPage) notFound();

    let markdownContent = "";
    // Try to read the report markdown file
    const reportPath = params.slug.join("/");
    const possiblePaths = [
      join(process.cwd(), "content/docs", `${reportPath}.mdx`),
      join(process.cwd(), "content/docs", reportPath, "index.mdx"),
    ];

    for (const filePath of possiblePaths) {
      try {
        markdownContent = await readFile(filePath, "utf-8");
        break;
      } catch {
        // Continue to next path
      }
    }

    return (
      <ReportBlogRenderer
        page={reportPage as ReportPageData}
        markdownContent={markdownContent}
      />
    );
  }

  // Regular docs page handling
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const RelativeLink = createRelativeLink(source, page);

  /** Build the ordered list of resolvable href variants for known synced-link shapes. */
  const buildHrefCandidates = (path: string): string[] => {
    // Extend this list if new upstream link shapes appear.
    if (path.endsWith(".md")) return [path, `${path.slice(0, -3)}.mdx`];
    if (path.endsWith(".mdx")) return [path];

    if (path.endsWith("/")) {
      const noSlash = path.slice(0, -1);
      return [`${noSlash}.mdx`, `${path}index.mdx`];
    }

    // Other shapes are left untouched.
    return [path];
  };

  /**
   * Resolve internal docs links from synced markdown via Fumadocs' page index.
   *
   * Some upstream links use `.md` files or trailing-slash paths (`foo/`).
   * Browsers resolve these by URL-joining, which can create incorrect nested paths.
   * We normalize a small set of common shapes and resolve them against the current
   * page directory + locale. If a match exists, we return the canonical docs URL
   * while preserving `?query` and `#hash`. Otherwise, we keep the original href.
   */
  const resolveInternalHref = (href: string): string => {
    // Only handle internal relative docs links.
    if (
      href.startsWith("/") ||
      href.startsWith("#") ||
      /^[a-z][a-z\d+.-]*:/i.test(href)
    ) {
      return href;
    }

    // Preserve `?query` and `#hash`; resolve only the path part.
    const [withoutHash, hashPart = ""] = href.split("#", 2);
    const [rawPath, queryPart = ""] = withoutHash.split("?", 2);
    const suffix = `${queryPart ? `?${queryPart}` : ""}${
      hashPart ? `#${hashPart}` : ""
    }`;

    // Make relativity explicit for the resolver (`foo` -> `./foo`).
    const base =
      rawPath.startsWith("./") || rawPath.startsWith("../")
        ? rawPath
        : `./${rawPath}`;

    // Resolve candidates against current page directory and locale.
    for (const candidate of buildHrefCandidates(base)) {
      const target = source.getPageByHref(candidate, {
        dir: dirname(page.path),
        language: page.locale,
      });

      if (target) {
        return `${target.page.url}${suffix}`;
      }
    }

    // As a conservative fallback, avoid rewriting links we couldn't resolve.
    return href;
  };

  const LinkComponent = (props: ComponentProps<"a">) => {
    const resolvedHref =
      typeof props.href === "string"
        ? resolveInternalHref(props.href)
        : props.href;

    return <RelativeLink {...props} href={resolvedHref} />;
  };

  let markdownContent = "";

  // Skip reading content for API documentation pages (auto-generated files)
  // Only skip for actual API endpoints, not documentation about APIs
  const isApiPage =
    params.slug?.some(
      (segment) =>
        segment.startsWith("get-") ||
        segment.startsWith("post-") ||
        segment.startsWith("patch-") ||
        segment.startsWith("delete-") ||
        segment.startsWith("put-") ||
        /_(get|post|patch|delete|put)$/.test(segment) ||
        /^(predict|extract|generate|create|update|delete|retrieve|list|destroy|partial_update|stats)/.test(
          segment
        ) ||
        /_auth_|authentication/.test(segment) ||
        /knowledge_panel/.test(segment) ||
        /_(create|update|delete|retrieve|list|destroy|partial_update|stats)$/.test(
          segment
        )
    ) ||
    // Check for known API path patterns (actual API endpoints)
    (params.slug &&
      ((params.slug.includes("Product-Opener") &&
        (params.slug.includes("v2") || params.slug.includes("v3"))) ||
        (params.slug.includes("Open-prices") &&
          (params.slug.includes("prices") ||
            params.slug.includes("auth") ||
            params.slug.includes("users") ||
            params.slug.includes("locations") ||
            params.slug.includes("proofs"))) ||
        (params.slug.includes("Robotoff") &&
          (params.slug.includes("predict") ||
            params.slug.includes("annotation-management") ||
            params.slug.includes("insight-management")))));

  if (!isApiPage) {
    const slugPath = params.slug?.join("/") || "index";

    const generatePaths = (basePath: string) => {
      const paths = [
        // Direct file path
        join(process.cwd(), "content/docs", `${basePath}.mdx`),
        // Folder with index.mdx
        join(process.cwd(), "content/docs", basePath, "index.mdx"),
      ];

      // Handle fumadocs (docs) folder convention
      if (params.slug && params.slug.length > 0) {
        // Try injecting (docs) after the first segment
        if (params.slug.length >= 1) {
          const pathWithDocs = [
            params.slug[0],
            "(docs)",
            ...params.slug.slice(1),
          ].join("/");
          paths.push(
            join(process.cwd(), "content/docs", `${pathWithDocs}.mdx`),
            join(process.cwd(), "content/docs", pathWithDocs, "index.mdx")
          );
        }

        // Try injecting (docs) after the second segment
        if (params.slug.length >= 2) {
          const pathWithDocs = [
            params.slug[0],
            params.slug[1],
            "(docs)",
            ...params.slug.slice(2),
          ].join("/");
          paths.push(
            join(process.cwd(), "content/docs", `${pathWithDocs}.mdx`),
            join(process.cwd(), "content/docs", pathWithDocs, "index.mdx")
          );
        }
      }

      return paths;
    };

    const possiblePaths = generatePaths(slugPath);

    // Add root index for homepage
    if (!params.slug || params.slug.length === 0) {
      possiblePaths.push(join(process.cwd(), "content/docs", "index.mdx"));
    }

    for (const filePath of possiblePaths) {
      try {
        markdownContent = await readFile(filePath, "utf-8");
        break; // Exit loop on success
      } catch {
        // Continue to next path
      }
    }
  }

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsActions slug={params.slug} markdownContent={markdownContent} />
      <DocsBody>
        <MDX components={getMDXComponents({ a: LinkComponent })} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  // Combine regular docs params with reports params
  const docsParams = source.generateParams();
  const reportsParams = reportsSource.generateParams().map((param) => ({
    slug: ["Infra", "reports", ...param.slug],
  }));

  // Dynamically generate schemas paths from api.yaml
  const schemaPaths = await getSchemaPaths();

  // Ensure all params have the correct structure for [[...slug]]
  const allParams = [...docsParams, ...reportsParams, ...schemaPaths];

  // Filter out any params that don't have a slug property or have invalid slug
  const validParams = allParams.filter((param) => {
    return param && param.slug && Array.isArray(param.slug);
  });

  return validParams;
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
