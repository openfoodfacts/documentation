import * as OpenAPI from 'fumadocs-openapi';
import { rimrafSync } from 'rimraf';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const outV2 = './content/docs/Product-Opener/(api)/v2'; 
const outV3 = './content/docs/Product-Opener/(api)/v3';
const outkPanel = './content/docs/Knowledge-Panel/(api)';
const outRobotoff = './content/docs/Robotoff/(api)';
const outOpenPrices = './content/docs/Open-prices/(api)';
const outFolksonomy = './content/docs/folksonomy/(api)';
const outNutripatrol = './content/docs/nutripatrol/(api)';

rimrafSync(outV2, {
  filter(v) {
    return !v.endsWith('index.mdx') && !v.endsWith('meta.json');
  },
});

rimrafSync(outV3, {
  filter(v) {
    return !v.endsWith('index.mdx') && !v.endsWith('meta.json');
  },
});

rimrafSync(outkPanel, {
  filter(v) {
    return !v.endsWith('index.mdx') && !v.endsWith('meta.json');
  },
});

rimrafSync(outRobotoff, {
  filter(v) {
    return !v.endsWith('index.mdx') && !v.endsWith('meta.json');
  },
});

rimrafSync(outOpenPrices, {
  filter(v) {
    return !v.endsWith('index.mdx') && !v.endsWith('meta.json');
  },
});

rimrafSync(outFolksonomy, {
  filter(v) {
    return !v.endsWith('index.mdx') && !v.endsWith('meta.json');
  },
});

rimrafSync(outNutripatrol, {
  filter(v) {
    return !v.endsWith('index.mdx') && !v.endsWith('meta.json');
  },
});

// Run filter-schemas.js to create schemas-only.json
execSync('node scripts/filter-schemas.mjs', { stdio: 'inherit' });

// Generate schemas-only documentation first (API Schemas)
// The schemas are in the /schemas/schemas folder, and we reference /schemas here so that the sidebar groups them and hides them until expanded
void OpenAPI.generateFiles({
  input: ['./specfiles-json/schemas-only.json'],
  output: './content/docs/Product-Opener/(api)/schemas/schemas',
  options: {
    includeResponses: true,
  },
  includeDescription: true,
  groupBy: false
});

// Run update-schemas.js to process the generated schema files to turn them to MDX with JSON code blocks
execSync('node scripts/update-schemas.mjs', { stdio: 'inherit' });

// Generate v2 API documentation (API v2 Operations)
void OpenAPI.generateFiles({
  input: ['./specfiles-json/openapi.json'],
  output: outV2,
  groupBy: 'tag',
  options: {
    includeResponses: true,
  },
  includeDescription: true
});

// Generate v3 API documentation (API v3 Operations)
void OpenAPI.generateFiles({
  input: ['./specfiles-json/openapi-v3.json'],
  output: outV3,
  groupBy: 'tag',
  options: {
    includeResponses: true,
  },
  includeDescription: true
});

if (existsSync('./specfiles-json/kPanels-openapi.json')) {
  void OpenAPI.generateFiles({
    input: ['./specfiles-json/kPanels-openapi.json'],
    output: outkPanel,
    groupBy: 'tag',
    options: {
      includeResponses: true,
    },
    includeDescription: true
  });
} else {
  console.log('FastAPI spec not found, skipping Facets documentation generation');
}

if (existsSync('./specfiles-json/robotoff-openapi.json')) {
  void OpenAPI.generateFiles({
    input: ['./specfiles-json/robotoff-openapi.json'],
    output: outRobotoff,
    groupBy: 'tag',
    options: {
      includeResponses: true,
    },
    includeDescription: true
  });
} else {
  console.log('Robotoff spec not found, skipping Robotoff documentation generation');
}

if (existsSync('./specfiles-json/open-prices-openapi.json')) {
  void OpenAPI.generateFiles({
    input: ['./specfiles-json/open-prices-openapi.json'],
    output: outOpenPrices,
    groupBy: 'tag',
    options: {
      includeResponses: true,
    },
    includeDescription: true
  });
} else {
  console.log('Open Prices spec not found, skipping Open Prices documentation generation');
}

if (existsSync('./specfiles-json/folksonomy-openapi.json')) {
  void OpenAPI.generateFiles({
    input: ['./specfiles-json/folksonomy-openapi.json'],
    output: outFolksonomy,
    groupBy: 'tag',
    options: {
      includeResponses: true,
    },
    includeDescription: true
  });
} else {
  console.log('Folksonomy spec not found, skipping Folksonomy documentation generation');
}

if (existsSync('./specfiles-json/nutripatrol-openapi.json')) {
  void OpenAPI.generateFiles({
    input: ['./specfiles-json/nutripatrol-openapi.json'],
    output: outNutripatrol,
    groupBy: 'tag',
    options: {
      includeResponses: true,
    },
    includeDescription: true
  });
} else {
  console.log('Nutripatrol spec not found, skipping Nutripatrol documentation generation');
}
