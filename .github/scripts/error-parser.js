/**
 * Error Parser and Auto-Fix Script
 * 
 * This script analyzes error outputs from tests and automatically 
 * applies fixes to the codebase.
 */

const fs = require('fs');
const path = require('path');

// Read error output from the file
function readErrorOutput() {
  try {
    const errorOutput = fs.readFileSync('error_output.txt', 'utf8');
    return errorOutput;
  } catch (error) {
    console.error('Error reading error output file:', error);
    return '';
  }
}

// Parse errors from the output
function parseErrors(output) {
  const errors = [];
  
  // Common error patterns with regex
  const errorPatterns = [
    // Syntax error pattern
    {
      regex: /SyntaxError: (.+) in (.+) line (\d+)/g,
      parse: (match) => ({
        type: 'syntax',
        message: match[1],
        file: match[2],
        line: parseInt(match[3], 10)
      })
    },
    // Reference error pattern
    {
      regex: /ReferenceError: (.+) is not defined.*?(\/.+\.js):(\d+):(\d+)/g,
      parse: (match) => ({
        type: 'reference',
        variable: match[1],
        file: match[2],
        line: parseInt(match[3], 10),
        column: parseInt(match[4], 10)
      })
    },
    // Type error pattern
    {
      regex: /TypeError: (.+).*?(\/.+\.js):(\d+):(\d+)/g,
      parse: (match) => ({
        type: 'type',
        message: match[1],
        file: match[2],
        line: parseInt(match[3], 10),
        column: parseInt(match[4], 10)
      })
    }
  ];
  
  // Apply all error patterns
  for (const pattern of errorPatterns) {
    let match;
    const regex = new RegExp(pattern.regex);
    
    while ((match = regex.exec(output)) !== null) {
      errors.push(pattern.parse(match));
    }
  }
  
  return errors;
}

// Apply fixes based on the error type
function applyFixes(errors) {
  for (const error of errors) {
    try {
      console.log(`Attempting to fix error in ${error.file}`);
      
      // Check if file exists
      if (!fs.existsSync(error.file)) {
        console.error(`File not found: ${error.file}`);
        continue;
      }
      
      // Read file content
      const fileContent = fs.readFileSync(error.file, 'utf8');
      const lines = fileContent.split('\n');
      
      let fixedContent = fileContent;
      
      // Apply fixes based on error type
      switch (error.type) {
        case 'syntax':
          fixedContent = fixSyntaxError(fileContent, error);
          break;
        case 'reference':
          fixedContent = fixReferenceError(fileContent, error);
          break;
        case 'type':
          fixedContent = fixTypeError(fileContent, error);
          break;
      }
      
      // Write fixed content back to file if changed
      if (fixedContent !== fileContent) {
        fs.writeFileSync(error.file, fixedContent);
        console.log(`Fixed error in ${error.file}`);
      } else {
        console.log(`No automatic fix available for error in ${error.file}`);
      }
    } catch (err) {
      console.error(`Error while fixing ${error.file}:`, err);
    }
  }
}

// Fix syntax errors like missing brackets, semicolons, etc.
function fixSyntaxError(content, error) {
  const lines = content.split('\n');
  const errorLine = lines[error.line - 1];
  
  // Common syntax fixes
  if (error.message.includes('missing semicolon')) {
    lines[error.line - 1] = errorLine + ';';
  } else if (error.message.includes('missing closing parenthesis')) {
    lines[error.line - 1] = errorLine + ')';
  } else if (error.message.includes('missing closing brace')) {
    lines[error.line - 1] = errorLine + '}';
  }
  
  return lines.join('\n');
}

// Fix reference errors (undefined variables)
function fixReferenceError(content, error) {
  const lines = content.split('\n');
  
  // For undefined variables, try to find imports or declarations
  if (content.includes(`import { ${error.variable} }`)) {
    // Variable is imported but might be unused or misspelled
    return content;
  } else {
    // Add variable declaration with reasonable default
    const lineWithError = lines[error.line - 1];
    const indent = lineWithError.match(/^\s*/)[0];
    lines.splice(error.line - 1, 0, `${indent}const ${error.variable} = null; // Auto-added by error fixer`);
  }
  
  return lines.join('\n');
}

// Fix type errors
function fixTypeError(content, error) {
  const lines = content.split('\n');
  
  // Add null checks for common type errors
  if (error.message.includes('cannot read property') || 
      error.message.includes('is undefined')) {
    
    const lineWithError = lines[error.line - 1];
    const matches = lineWithError.match(/(\w+)\.(\w+)/g);
    
    if (matches && matches.length > 0) {
      // Add null check for the object being accessed
      const objectAccess = matches[0];
      const [obj, prop] = objectAccess.split('.');
      
      const indent = lineWithError.match(/^\s*/)[0];
      lines.splice(error.line - 1, 0, 
        `${indent}if (${obj} === undefined || ${obj} === null) {`,
        `${indent}  console.error('${obj} is undefined/null');`,
        `${indent}  return;`,
        `${indent}}`
      );
    }
  }
  
  return lines.join('\n');
}

// Main execution
(function main() {
  console.log('Starting error parsing and auto-fix process...');
  
  const errorOutput = readErrorOutput();
  if (!errorOutput) {
    console.log('No error output found. Exiting.');
    return;
  }
  
  console.log('Parsing errors from output...');
  const errors = parseErrors(errorOutput);
  
  if (errors.length === 0) {
    console.log('No recognizable errors found.');
    return;
  }
  
  console.log(`Found ${errors.length} errors to fix.`);
  applyFixes(errors);
  
  console.log('Error parsing and fixing complete.');
})();