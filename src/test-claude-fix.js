/**
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
};