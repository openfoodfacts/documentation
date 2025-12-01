import fs from 'fs';

// List of schemas to include
const schemasToInclude = [
  "Product-Base",
  "Product-Misc",
  "Product-Tags",
  "Product-Images",
  "Product-Eco-Score",
  "Product-Ingredients",
  "Product-Nutrition",
  "Product-Nutrition-v3.5"
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

// Read the full OpenAPI spec
const fullSpec = JSON.parse(fs.readFileSync('./specfiles-json/openapi.json', 'utf8'));

// Create a filtered spec with only the selected schemas
const filteredSpec = {
  openapi: fullSpec.openapi,
  info: {
    ...fullSpec.info,
    title: "OpenAPI Schemas"
  },
  servers: fullSpec.servers,
  components: {
    securitySchemes: fullSpec.components.securitySchemes,
    schemas: {}
  },
  paths: {}
};

// Add only the selected schemas
schemasToInclude.forEach(schemaName => {
  if (fullSpec.components.schemas[schemaName]) {
    filteredSpec.components.schemas[schemaName] = fullSpec.components.schemas[schemaName];
    
    // Add a dummy path for each schema
    const pathName = `/${schemaName.toLowerCase().replace(/-/g, '_')}`;
    const operationId = schemaName.toLowerCase().replace(/-/g, '_');
    filteredSpec.paths[pathName] = {
      get: {
        operationId: operationId,
        summary: `${schemaName} Schema`,
        description: `Schema definition for ${schemaName}`,
        tags: ["Schemas"],
        responses: {
          200: {
            description: "Schema definition",
            content: {
              "application/json": {
                schema: {
                  $ref: `#/components/schemas/${schemaName}`
                }
              }
            }
          }
        }
      }
    };
  } else {
    console.warn(`Schema "${schemaName}" not found in the OpenAPI spec`);
  }
});

// Write the filtered spec
fs.writeFileSync('./specfiles-json/schemas-only.json', JSON.stringify(filteredSpec, null, 2));

console.log('Filtered schemas-only.json created successfully');