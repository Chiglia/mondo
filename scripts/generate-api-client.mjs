import { spawnSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiDocsUrl = 'http://localhost:8080/v3/api-docs';
const temporarySpecPath = resolve(tmpdir(), `mondo-openapi-${process.pid}.json`);

try {
  const response = await fetch(apiDocsUrl);
  if (!response.ok) {
    throw new Error(`OpenAPI endpoint returned HTTP ${response.status}`);
  }

  const specification = await response.json();
  if (!specification.openapi || !specification.paths) {
    throw new Error('The API endpoint did not return a valid OpenAPI specification');
  }

  for (const pathItem of Object.values(specification.paths)) {
    for (const operation of Object.values(pathItem)) {
      if (!operation || typeof operation !== 'object' || !operation.responses) {
        continue;
      }

      for (const apiResponse of Object.values(operation.responses)) {
        const content = apiResponse?.content;
        const wildcardJson = content?.['*/*'];
        if (!wildcardJson || ['binary', 'byte'].includes(wildcardJson.schema?.format)) {
          continue;
        }

        content['application/json'] ??= wildcardJson;
        delete content['*/*'];
      }
    }
  }

  writeFileSync(temporarySpecPath, JSON.stringify(specification));

  const generatorCli = resolve(projectRoot, 'node_modules/ng-openapi/cli.cjs');
  const result = spawnSync(
    process.execPath,
    [generatorCli, '-i', temporarySpecPath, '-o', resolve(projectRoot, 'src/app/api')],
    { cwd: projectRoot, stdio: 'inherit' },
  );

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`OpenAPI generator exited with status ${result.status ?? 'unknown'}`);
  }
} catch (error) {
  console.error(`API client generation failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  try {
    unlinkSync(temporarySpecPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Could not remove temporary OpenAPI file: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
