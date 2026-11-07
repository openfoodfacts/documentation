import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { OpenAPIPage } from "./components/OpenAPIPage";
import { Mermaid } from "./components/Mermaid";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    OpenAPIPage,
    APIPage: OpenAPIPage,
    Mermaid,
    Accordion,
    Accordions,
    ...components,
  };
}
