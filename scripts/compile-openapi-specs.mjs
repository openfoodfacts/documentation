#!/usr/bin/env node

/**
 * OpenAPI Specification Processor
 *
 * Processes distributed OpenAPI YAML specifications using a two-step approach:
 * 1. Bundle distributed YAML files into standalone files
 * 2. Convert bundled YAML to JSON with dereferencing
 */

import $RefParser from '@apidevtools/json-schema-ref-parser';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

async function bundleYamlFile(inputFile, outputFile) {
  try {
    const bundled = await $RefParser.bundle(inputFile, {
      resolve: { file: { order: 1 }, http: false },
    });

    const yamlContent = YAML.stringify(bundled);
    fs.writeFileSync(outputFile, yamlContent);
    return true;
  } catch (error) {
    console.error(`Failed to bundle ${inputFile}: ${error.message}`);
    return false;
  }
}

async function convertYamlToJson(inputYamlFile, outputJsonFile) {
  try {
    const dereferenced = await $RefParser.dereference(inputYamlFile, {
      resolve: { file: { order: 1 }, http: false },
      dereference: { circular: 'ignore' },
    });

    fs.writeFileSync(outputJsonFile, JSON.stringify(dereferenced, null, 2));
    return true;
  } catch {
    try {
      const yamlContent = fs.readFileSync(inputYamlFile, 'utf8');
      const parsed = YAML.parse(yamlContent);
      fs.writeFileSync(outputJsonFile, JSON.stringify(parsed, null, 2));
      return true;
    } catch (fallbackError) {
      console.error(
        `Failed to convert ${inputYamlFile}: ${fallbackError.message}`
      );
      return false;
    }
  }
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function main() {
  const tempDir = 'temp-processing';
  const outputDir = 'specfiles-json';

  const specs = [
    {
      input: 'ref/api.yaml',
      tempYaml: path.join(tempDir, 'api.yaml'),
      output: path.join(outputDir, 'openapi.json'),
    },
    {
      input: 'ref/api-v3.yaml',
      tempYaml: path.join(tempDir, 'api-v3.yaml'),
      output: path.join(outputDir, 'openapi-v3.json'),
    },
  ];

  ensureDirectoryExists(tempDir);
  ensureDirectoryExists(outputDir);

  let success = true;

  // Bundle YAML files
  for (const spec of specs) {
    if (!fs.existsSync(spec.input)) {
      console.error(`Input file not found: ${spec.input}`);
      success = false;
      continue;
    }

    if (!(await bundleYamlFile(spec.input, spec.tempYaml))) {
      success = false;
    }
  }

  // Convert to JSON
  for (const spec of specs) {
    if (!fs.existsSync(spec.tempYaml)) {
      console.error(`Bundled file not found: ${spec.tempYaml}`);
      success = false;
      continue;
    }

    if (!(await convertYamlToJson(spec.tempYaml, spec.output))) {
      success = false;
    }
  }

  // Clean up
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }

  if (!success) {
    console.error('Processing failed');
    process.exit(1);
  }

  console.log('OpenAPI specifications processed successfully');
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
