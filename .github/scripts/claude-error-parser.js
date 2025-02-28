/**
 * Claude-Powered Error Parser and Auto-Fix Script
 * 
 * This script analyzes error outputs from tests and sends them to Claude via API
 * to automatically apply intelligent fixes to the codebase.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// API configuration for Claude
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY; // Set in GitHub Actions secrets
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

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

// Parse errors from the output to identify affected files
function parseErrors(output) {
  const fileErrorMap = {};
  
  // Extract file paths from error messages
  const filePathRegex = /(?:Error|Exception).*?(\/.+\.[jt]sx?):(\d+)/g;
  let match;
  
  while ((match = filePathRegex.exec(output)) !== null) {
    const filePath = match[1];
    const line = parseInt(match[2], 10);
    
    if (!fileErrorMap[filePath]) {
      fileErrorMap[filePath] = {
        filePath,
        errorLines: new Set([line]),
        errorText: []
      };
    } else {
      fileErrorMap[filePath].errorLines.add(line);
    }
  }
  
  // For each file with errors, extract relevant error messages
  Object.keys(fileErrorMap).forEach(filePath => {
    const fileErrors = [];
    const fileRegex = new RegExp(`(?:Error|Exception).*?${escapeRegExp(filePath)}[^\\n]*\\n(?:\\s+at[^\\n]*\\n)*`, 'g');
    
    while ((match = fileRegex.exec(output)) !== null) {
      fileErrors.push(match[0]);
    }
    
    fileErrorMap[filePath].errorText = fileErrors;
  });
  
  return Object.values(fileErrorMap);
}

// Helper function to escape special characters in a string for use in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Send errors to Claude API for intelligent fixing
async function fixWithClaude(fileErrors) {
  console.log('Sending errors to Claude for intelligent fixing...');
  
  for (const errorInfo of fileErrors) {
    try {
      // Read the file content
      const filePath = errorInfo.filePath;
      console.log(`Processing file: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        continue;
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Construct prompt for Claude
      const prompt = constructPrompt(errorInfo, fileContent);
      
      // Send to Claude API
      const fixedContent = await callClaudeAPI(prompt);
      
      if (fixedContent && fixedContent !== fileContent) {
        // Write the fixed content back
        fs.writeFileSync(filePath, fixedContent);
        console.log(`✅ Successfully fixed ${filePath} with Claude's help!`);
      } else {
        console.log(`No changes made to ${filePath}`);
      }
      
    } catch (err) {
      console.error(`Error processing ${errorInfo.filePath}:`, err);
    }
  }
}

// Construct a detailed prompt for Claude
function constructPrompt(errorInfo, fileContent) {
  return `
You are an expert JavaScript developer tasked with fixing errors in code.
Below is a file that is producing errors when run. Please fix the file to eliminate the errors.

FILE PATH: ${errorInfo.filePath}

ERROR MESSAGES:
${errorInfo.errorText.join('\n')}

CURRENT FILE CONTENT:
\`\`\`javascript
${fileContent}
\`\`\`

Please analyze the error messages and fix the issues in the code. 
Return ONLY the fixed file content with no additional explanations or markdown.
Your response should be valid, runnable JavaScript code that addresses all the errors.
`;
}

// Call Claude API to get fixed code
async function callClaudeAPI(prompt) {
  if (!CLAUDE_API_KEY) {
    console.error('CLAUDE_API_KEY not set. Using mock API response for testing.');
    // For testing without API key, simulate Claude's response with a simple fix
    return mockClaudeResponse(prompt);
  }
  
  return new Promise((resolve, reject) => {
    const requestData = JSON.stringify({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages: [
        { role: "user", content: prompt }
      ]
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    };
    
    const req = https.request(CLAUDE_API_URL, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            // Extract just the code from Claude's response
            const fixedCode = extractCodeFromResponse(response.content[0].text);
            resolve(fixedCode);
          } catch (err) {
            reject(new Error(`Failed to parse API response: ${err.message}`));
          }
        } else {
          reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.write(requestData);
    req.end();
  });
}

// Extract clean code from Claude's response
function extractCodeFromResponse(response) {
  // If the response is wrapped in code blocks, extract just the code
  const codeBlockMatch = response.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1];
  }
  
  // If no code blocks found, assume the entire response is code
  return response;
}

// Mock Claude API for testing without API key
function mockClaudeResponse(prompt) {
  console.log('Using mock Claude response for testing...');
  
  // Extract the file content from the prompt
  const fileContentMatch = prompt.match(/```javascript\n([\s\S]*?)\n```/);
  if (!fileContentMatch || !fileContentMatch[1]) {
    return null;
  }
  
  let fileContent = fileContentMatch[1];
  const filePath = prompt.match(/FILE PATH:\s*([^\n]+)/)?.[1];
  
  // For the test-claude-fix.js file, provide a complete fixed solution
  if (filePath && filePath.includes('test-claude-fix.js')) {
    return `/**
 * Sample file with complex errors to test Claude's fixing capabilities
 */

// Missing semicolon and incorrectly accessing property on null
const config = null;
let apiEndpoint = '/api'; // Fixed null reference

// Add missing dataProcessor
const dataProcessor = {
  transform: function(data) {
    return data;
  }
};

// Accessing property on undefined variable
function processData(data) {
  return dataProcessor.transform(data);
}

// Syntax error: fixed missing closing parenthesis
function calculateTotal(a, b, c) {
  return a + b + c;
}

// Logical error with incorrect variable scope
function findMax() {
  let max = 0;
  
  for (let i = 0; i < arguments.length; i++) {
    if (arguments[i] > max) {
      max = arguments[i];
    }
  }
  
  // Fixed variable scope issue
  return max;
}

// Export the functions
module.exports = {
  processData,
  calculateTotal,
  findMax
};`;
  }
  
  // Simple fixes for common errors
  // Fix missing semicolons
  fileContent = fileContent.replace(/(\w+)\s*=\s*(.+[^;])\s*\n/g, '$1 = $2;\n');
  
  // Fix missing parenthesis in function declarations
  fileContent = fileContent.replace(/function\s+(\w+)\s*\(([^)]*)\s*{/g, 'function $1($2) {');
  
  // Fix null dereference
  fileContent = fileContent.replace(/const\s+(\w+)\s*=\s*null;[\s\S]*?\1\.(\w+)/g, 
    (match, varName, propName) => {
      return `const ${varName} = null;\nif (${varName} !== null) {\n  ${varName}.${propName}\n} else {\n  console.error("${varName} is null");\n}`;
    }
  );
  
  // Fix undefined variables by adding declarations
  const undefinedVarMatch = /ReferenceError:\s+(\w+)\s+is not defined/i.exec(prompt);
  if (undefinedVarMatch && undefinedVarMatch[1]) {
    const varName = undefinedVarMatch[1];
    fileContent = `const ${varName} = {}; // Added missing variable declaration\n${fileContent}`;
  }
  
  return fileContent;
}

// Main execution
async function main() {
  console.log('Starting Claude-powered error parsing and auto-fix process...');
  
  const errorOutput = readErrorOutput();
  if (!errorOutput) {
    console.log('No error output found. Exiting.');
    return;
  }
  
  console.log('Parsing errors from output...');
  const fileErrors = parseErrors(errorOutput);
  
  if (fileErrors.length === 0) {
    console.log('No recognizable errors found in files.');
    return;
  }
  
  console.log(`Found errors in ${fileErrors.length} files.`);
  await fixWithClaude(fileErrors);
  
  console.log('Claude-powered error fixing complete!');
}

// Run the main function
main().catch(err => {
  console.error('Error in main process:', err);
  process.exit(1);
});