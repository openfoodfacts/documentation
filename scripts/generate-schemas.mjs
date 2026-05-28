import fs from 'fs';
import path from 'path';
import { rimrafSync } from 'rimraf';

const schemasToInclude = [
  "Product-Base",
  "Product-Misc",
  "Product-Tags",
  "Product-Images",
  "Product-Eco-Score",
  "Product-Ingredients",
  "Product-Nutrition",
  "Product-Nutrition-v3.5",
  "Product-Nutriscore",
  "Product-Quality",
  "Product-Extended",
  "Product-Metadata",
  "Product-Knowledge-Panels",
  "Product-Attribute-Groups",
  "Product",
  "Ingredient",
  "Nutrient"
];

const outDir = './content/docs/Product-Opener/(api)/schemas/schemas';

// Clean generated files, preserving index.mdx and meta.json
rimrafSync(outDir, {
  filter(v) {
    return !v.endsWith('index.mdx') && !v.endsWith('meta.json');
  },
});

// Read the full OpenAPI spec
const fullSpec = JSON.parse(fs.readFileSync('./specfiles-json/openapi.json', 'utf8'));

schemasToInclude.forEach(schemaName => {
  const schema = fullSpec.components?.schemas?.[schemaName];
  if (!schema) {
    console.warn(`Schema "${schemaName}" not found in the OpenAPI spec`);
    return;
  }

  const fileName = schemaName.toLowerCase().replace(/-/g, '_') + '.mdx';
  const filePath = path.join(outDir, fileName);

  const schemaJson = JSON.stringify(schema, null, 2);

  const content = `---
title: ${schemaName} Schema
description: Schema definition for the ${schemaName} object in product data
full: true
---

# ${schemaName} Schema

This is a **data schema**, not an API endpoint. The \`${schemaName}\` object describes the shape of
data returned inside product records by the [Product Opener API](/docs/Product-Opener/api/).

\`\`\`json
${schemaJson}
\`\`\`
`;

  fs.writeFileSync(filePath, content);
  console.log(`Written ${fileName}`);
});

console.log('Schema MDX files generated successfully.');
