import fs from 'fs';
import path from 'path';

// Read the schemas-only OpenAPI spec
const spec = JSON.parse(fs.readFileSync('./specfiles-json/schemas-only.json', 'utf8'));

// Get all schema files
const schemasDir = './content/docs/Product-Opener/(api)/schemas/schemas';
const schemaFiles = fs.readdirSync(schemasDir).filter(file => {
  return file.endsWith('.mdx') && file !== 'index.mdx'; // Skip the overview index.mdx
});

schemaFiles.forEach(schemaFile => {
  const filePath = path.join(schemasDir, schemaFile);

  console.log(`Processing ${schemaFile}...`);

  // Read the current MDX content
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract schema name from the operations in the APIPage component
  const apiPageMatch = content.match(/operations=\{[^}]*"path":"([^"]+)"/);
  if (!apiPageMatch) {
    console.log(`Could not extract path from ${schemaFile}`);
    return;
  }

  const route = apiPageMatch[1]; // e.g., "/product"
  const schemaKey = route.substring(1); // Remove leading slash: "product"

  // Find the schema in the OpenAPI spec
  const actualSchemaKey = Object.keys(spec.components.schemas).find(key =>
    key.toLowerCase().replace(/-/g, '_') === schemaKey
  );

  if (!actualSchemaKey) {
    console.log(`Could not find schema ${schemaKey} in OpenAPI spec`);
    return;
  }

  const schema = spec.components.schemas[actualSchemaKey];

  // Replace the APIPage component with JSON code block
  const schemaJson = JSON.stringify(schema, null, 2);
  const newContent = content.replace(
    /Schema definition for [^\n]+\n\n<APIPage[^>]+\/>/,
    `# ${actualSchemaKey} Schema\n\n\`\`\`json\n${schemaJson}\n\`\`\``
  );

  // Write back the modified content
  fs.writeFileSync(filePath, newContent);
  console.log(`Updated ${schemaFile}`);
});

console.log('All schema files updated!');