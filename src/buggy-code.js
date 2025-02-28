/**
 * Sample buggy code to test our error parser and auto-fix functionality
 */

// Missing semicolon error
const greeting = "Hello"
console.log(greeting)

// Reference error
console.log(undefinedVariable);

// Type error
const user = null;
const displayName = user.name;

// Unclosed parenthesis
function add(a, b
  return a + b;
}