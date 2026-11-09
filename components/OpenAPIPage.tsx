"use client";

import { createOpenAPIPage } from "fumadocs-openapi/ui";
import type { ComponentProps } from "react";

const BaseOpenAPIPage = createOpenAPIPage();

export function OpenAPIPage(props: ComponentProps<typeof BaseOpenAPIPage>) {
  return (
    <BaseOpenAPIPage
      preloaded={{ docs: {}, proxyUrl: undefined }}
      {...props}
    />
  );
}
