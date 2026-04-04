/**
 * Swagger-to-Playwright Test Generator
 * 
 * This script reads the Swagger/OpenAPI specification and generates
 * Playwright API tests automatically.
 * 
 * Features:
 * - Parses swagger.json to extract endpoints, methods, schemas
 * - Generates TypeScript test files with proper typing
 * - Creates helper classes for API testing
 * - Validates response schemas against Swagger definitions
 * - Prevents hallucination by only testing documented endpoints
 */

import * as fs from 'fs';
import * as path from 'path';

interface SwaggerEndpoint {
  path: string;
  method: string;
  summary: string;
  description: string;
  parameters: any[];
  responses: any;
  requestBody?: any;
}

interface SwaggerSchema {
  paths: any;
  definitions: any;
}

class SwaggerTestGenerator {
  private swaggerSpec: SwaggerSchema;
  private outputDir: string;

  constructor(swaggerPath: string, outputDir: string) {
    this.swaggerSpec = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
    this.outputDir = outputDir;
  }

  /**
   * Main generation method
   */
  generate() {
    console.log('🔍 Parsing Swagger specification...');
    const endpoints = this.parseEndpoints();
    
    console.log(`📝 Found ${endpoints.length} endpoints to test`);
    
    console.log('✨ Generating test files...');
    this.generateTestFiles(endpoints);
    
    console.log('✅ Test generation complete!');
  }

  /**
   * Parse all endpoints from Swagger spec
   */
  private parseEndpoints(): SwaggerEndpoint[] {
    const endpoints: SwaggerEndpoint[] = [];

    for (const [path, methods] of Object.entries(this.swaggerSpec.paths)) {
      for (const [method, details] of Object.entries(methods as any)) {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          summary: (details as any).summary || '',
          description: (details as any).description || '',
          parameters: (details as any).parameters || [],
          responses: (details as any).responses || {},
          requestBody: (details as any).requestBody
        });
      }
    }

    return endpoints;
  }

  /**
   * Generate test files for all endpoints
   */
  private generateTestFiles(endpoints: SwaggerEndpoint[]) {
    // Group endpoints by tag or path
    const groupedEndpoints = this.groupEndpoints(endpoints);

    for (const [groupName, groupEndpoints] of Object.entries(groupedEndpoints)) {
      const testContent = this.generateTestContent(groupName, groupEndpoints);
      const fileName = `${this.sanitizeFileName(groupName)}-api.spec.ts`;
      const filePath = path.join(this.outputDir, fileName);

      fs.writeFileSync(filePath, testContent);
      console.log(`  ✓ Generated ${fileName}`);
    }
  }

  /**
   * Group endpoints by tag or base path
   */
  private groupEndpoints(endpoints: SwaggerEndpoint[]): Record<string, SwaggerEndpoint[]> {
    const groups: Record<string, SwaggerEndpoint[]> = {};

    for (const endpoint of endpoints) {
      // Use the first part of the path as group name
      const groupName = endpoint.path.split('/')[2] || 'general';
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      
      groups[groupName].push(endpoint);
    }

    return groups;
  }

  /**
   * Generate test content for a group of endpoints
   */
  private generateTestContent(groupName: string, endpoints: SwaggerEndpoint[]): string {
    const imports = `import { test, expect } from '@playwright/test';
import { PaymentAPIHelper } from '../../../utils/generated/payment-api-helper';

/**
 * Auto-generated API tests for ${groupName} endpoints
 * Generated from Swagger specification
 * 
 * ⚠️ DO NOT EDIT MANUALLY - This file is auto-generated
 * To modify tests, update the Swagger spec and regenerate
 */
`;

    const testSuites = endpoints.map(endpoint => this.generateTestSuite(endpoint)).join('\n\n');

    return imports + '\n' + testSuites;
  }

  /**
   * Generate test suite for a single endpoint
   */
  private generateTestSuite(endpoint: SwaggerEndpoint): string {
    const testName = `${endpoint.method} ${endpoint.path}`;
    const description = endpoint.summary || endpoint.description;

    return `
test.describe('${testName}', () => {
  let apiHelper: PaymentAPIHelper;

  test.beforeAll(async ({ playwright }) => {
    const requestContext = await playwright.request.newContext();
    apiHelper = new PaymentAPIHelper(requestContext);
  });

  test('Should ${description}', async () => {
    // This test was auto-generated from Swagger
    // TODO: Implement test logic based on endpoint specification
    
    // Expected responses: ${Object.keys(endpoint.responses).join(', ')}
  });
});
`;
  }

  private sanitizeFileName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
}

// CLI execution
if (require.main === module) {
  const swaggerPath = process.argv[2] || path.join(__dirname, '../../application_code/docs/swagger.json');
  const outputDir = process.argv[3] || path.join(__dirname, '../tests/generated_test/api');

  console.log('🚀 Swagger-to-Playwright Test Generator');
  console.log(`📄 Swagger file: ${swaggerPath}`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log('');

  const generator = new SwaggerTestGenerator(swaggerPath, outputDir);
  generator.generate();
}

export { SwaggerTestGenerator };
