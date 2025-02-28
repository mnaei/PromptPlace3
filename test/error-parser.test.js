/**
 * Tests for the error parser and auto-fix functionality
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create temp directory for tests
const TEST_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR);
}

// Helper to create test files
function createTestFile(filename, content) {
  const filePath = path.join(TEST_DIR, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
}

// Helper to get the error parser script path
const ERROR_PARSER_PATH = path.join(__dirname, '..', '.github', 'scripts', 'error-parser.js');

describe('Error Parser and Auto-Fix', function() {
  beforeEach(function() {
    // Clear test directory
    const files = fs.readdirSync(TEST_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(TEST_DIR, file));
    }
    
    // Create error output file in test directory
    process.chdir(TEST_DIR);
  });
  
  afterEach(function() {
    // Change back to root directory
    process.chdir(path.join(__dirname, '..'));
  });
  
  it('should fix syntax errors - missing semicolon', function() {
    // Create a test file with a syntax error
    const testFilePath = createTestFile('syntax-error.js', 'const x = 5\nconsole.log(x)');
    
    // Create error output file
    fs.writeFileSync('error_output.txt', 
      `SyntaxError: missing semicolon in ${testFilePath} line 1`
    );
    
    // Run the error parser
    execSync(`node ${ERROR_PARSER_PATH}`);
    
    // Check if the file was fixed
    const fixedContent = fs.readFileSync(testFilePath, 'utf8');
    assert.strictEqual(fixedContent, 'const x = 5;\nconsole.log(x)');
  });
  
  it('should fix reference errors - undefined variable', function() {
    // Create a test file with a reference error
    const testFilePath = createTestFile('reference-error.js', 'console.log(undefinedVar);');
    
    // Create error output file
    fs.writeFileSync('error_output.txt', 
      `ReferenceError: undefinedVar is not defined at Object.<anonymous> (${testFilePath}:1:13)`
    );
    
    // Run the error parser
    execSync(`node ${ERROR_PARSER_PATH}`);
    
    // Check if the file was fixed
    const fixedContent = fs.readFileSync(testFilePath, 'utf8');
    assert.strictEqual(fixedContent, 'const undefinedVar = null; // Auto-added by error fixer\nconsole.log(undefinedVar);');
  });
  
  it('should fix type errors - null object access', function() {
    // Create a test file with a type error
    const testFilePath = createTestFile('type-error.js', 'const obj = null;\nconsole.log(obj.property);');
    
    // Create error output file
    fs.writeFileSync('error_output.txt', 
      `TypeError: Cannot read property 'property' of null at Object.<anonymous> (${testFilePath}:2:13)`
    );
    
    // Run the error parser
    execSync(`node ${ERROR_PARSER_PATH}`);
    
    // Check if the file was fixed
    const fixedContent = fs.readFileSync(testFilePath, 'utf8');
    assert.strictEqual(fixedContent, 
      'const obj = null;\nif (obj === undefined || obj === null) {\n  console.error(\'obj is undefined/null\');\n  return;\n}\nconsole.log(obj.property);'
    );
  });
  
  it('should handle multiple errors in the output', function() {
    // Create test files with multiple errors
    const syntaxFile = createTestFile('multiple-syntax.js', 'const x = 5\nconsole.log(x)');
    const referenceFile = createTestFile('multiple-reference.js', 'console.log(y);');
    
    // Create error output file with multiple errors
    fs.writeFileSync('error_output.txt', 
      `SyntaxError: missing semicolon in ${syntaxFile} line 1\n` +
      `ReferenceError: y is not defined at Object.<anonymous> (${referenceFile}:1:13)`
    );
    
    // Run the error parser
    execSync(`node ${ERROR_PARSER_PATH}`);
    
    // Check if files were fixed
    const fixedSyntax = fs.readFileSync(syntaxFile, 'utf8');
    const fixedReference = fs.readFileSync(referenceFile, 'utf8');
    
    assert.strictEqual(fixedSyntax, 'const x = 5;\nconsole.log(x)');
    assert.strictEqual(fixedReference, 'const y = null; // Auto-added by error fixer\nconsole.log(y);');
  });
});