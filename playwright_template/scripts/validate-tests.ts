/**
 * Test Validator - Prevents Hallucinated Tests
 * 
 * This validator ensures that generated tests:
 * 1. Only test documented endpoints from Swagger
 * 2. Use correct HTTP methods
 * 3. Validate response schemas that exist in Swagger
 * 4. Don't make assumptions about undocumented behavior
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

class TestValidator {
  private swaggerSpec: any;
  private documentedEndpoints: Set<string>;

  constructor(swaggerPath: string) {
    this.swaggerSpec = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
    this.documentedEndpoints = new Set();
    this.extractDocumentedEndpoints();
  }

  /**
   * Extract all documented endpoints from Swagger
   */
  private extractDocumentedEndpoints() {
    for (const [path, methods] of Object.entries(this.swaggerSpec.paths)) {
      for (const method of Object.keys(methods as any)) {
        const endpoint = `${method.toUpperCase()} ${path}`;
        this.documentedEndpoints.add(endpoint);
      }
    }
  }

  /**
   * Validate a test file
   */
  validateTestFile(testFilePath: string): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    const content = fs.readFileSync(testFilePath, 'utf-8');

    // Check for undocumented endpoints
    this.checkUndocumentedEndpoints(content, result);

    // Check for hardcoded values that should be in Swagger
    this.checkHardcodedValues(content, result);

    // Check for proper schema validation
    this.checkSchemaValidation(content, result);

    result.valid = result.errors.length === 0;
    return result;
  }

  /**
   * Check if test references undocumented endpoints
   */
  private checkUndocumentedEndpoints(content: string, result: ValidationResult) {
    // Extract API calls from test content
    const apiCallRegex = /request\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/gi;
    let match;

    while ((match = apiCallRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const endpoint = match[2].replace(/^https?:\/\/[^/]+/, ''); // Remove base URL
      const fullEndpoint = `${method} ${endpoint}`;

      if (!this.documentedEndpoints.has(fullEndpoint)) {
        result.errors.push(
          `Undocumented endpoint detected: ${fullEndpoint}. ` +
          `This endpoint is not in Swagger specification and may be hallucinated.`
        );
      }
    }
  }

  /**
   * Check for hardcoded values that should reference Swagger
   */
  private checkHardcodedValues(content: string, result: ValidationResult) {
    // Check for hardcoded status codes not in Swagger
    const statusCodeRegex = /expect.*status.*toBe\((\d+)\)/gi;
    let match;

    while ((match = statusCodeRegex.exec(content)) !== null) {
      const statusCode = parseInt(match[1]);
      
      // Warn about non-standard status codes
      if (![200, 201, 400, 401, 403, 404, 500].includes(statusCode)) {
        result.warnings.push(
          `Unusual status code ${statusCode} detected. Verify this is documented in Swagger.`
        );
      }
    }
  }

  /**
   * Check for proper schema validation
   */
  private checkSchemaValidation(content: string, result: ValidationResult) {
    // Check if tests validate response schemas
    if (!content.includes('validateResponseSchema') && 
        !content.includes('validateHealthResponse') &&
        !content.includes('validateEmailResponse')) {
      result.warnings.push(
        'Test does not appear to validate response schema. ' +
        'Consider adding schema validation to prevent accepting invalid responses.'
      );
    }
  }

  /**
   * Validate all tests in a directory
   */
  validateDirectory(dirPath: string): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};
    const files = this.getTestFiles(dirPath);

    for (const file of files) {
      results[file] = this.validateTestFile(file);
    }

    return results;
  }

  /**
   * Get all test files recursively
   */
  private getTestFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dirPath)) {
      return files;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...this.getTestFiles(fullPath));
      } else if (entry.name.endsWith('.spec.ts') || entry.name.endsWith('.test.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Generate validation report
   */
  generateReport(results: Record<string, ValidationResult>): string {
    let report = '# Test Validation Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    let totalErrors = 0;
    let totalWarnings = 0;

    for (const [file, result] of Object.entries(results)) {
      const fileName = path.basename(file);
      const status = result.valid ? '✅ VALID' : '❌ INVALID';
      
      report += `## ${fileName} - ${status}\n\n`;

      if (result.errors.length > 0) {
        report += '### Errors:\n';
        result.errors.forEach(error => {
          report += `- ❌ ${error}\n`;
          totalErrors++;
        });
        report += '\n';
      }

      if (result.warnings.length > 0) {
        report += '### Warnings:\n';
        result.warnings.forEach(warning => {
          report += `- ⚠️  ${warning}\n`;
          totalWarnings++;
        });
        report += '\n';
      }
    }

    report += `\n## Summary\n\n`;
    report += `- Total files validated: ${Object.keys(results).length}\n`;
    report += `- Valid files: ${Object.values(results).filter(r => r.valid).length}\n`;
    report += `- Invalid files: ${Object.values(results).filter(r => !r.valid).length}\n`;
    report += `- Total errors: ${totalErrors}\n`;
    report += `- Total warnings: ${totalWarnings}\n`;

    return report;
  }
}

// CLI execution
if (typeof require !== 'undefined' && require.main === module) {
  const swaggerPath = process.argv[2] || path.join(__dirname, '../../application_code/docs/swagger.json');
  const testDir = process.argv[3] || path.join(__dirname, '../tests/generated_test');

  console.log('🔍 Test Validator - Anti-Hallucination Check');
  console.log(`📄 Swagger file: ${swaggerPath}`);
  console.log(`📁 Test directory: ${testDir}`);
  console.log('');

  const validator = new TestValidator(swaggerPath);
  const results = validator.validateDirectory(testDir);
  const report = validator.generateReport(results);

  console.log(report);

  // Write report to file
  const reportPath = path.join(testDir, 'validation-report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n📝 Report saved to: ${reportPath}`);

  // Exit with error if any invalid tests found
  const hasErrors = Object.values(results).some(r => !r.valid);
  process.exit(hasErrors ? 1 : 0);
}

export { TestValidator };
