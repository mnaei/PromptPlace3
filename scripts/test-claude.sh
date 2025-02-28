#!/bin/bash

echo "Testing Claude's error fixing capabilities..."
echo "Running buggy code to generate errors..."

# Run the buggy code and capture errors
node src/test-claude-fix.js > output.log 2>&1 || echo "Errors detected!"

# Copy error output to the expected file
cp output.log error_output.txt

echo "Error output saved to error_output.txt"
echo ""
echo "Error output:"
echo "============="
cat error_output.txt
echo "============="
echo ""

# Run the Claude error parser
echo "Running Claude error parser..."
node .github/scripts/claude-error-parser.js

echo ""
echo "Testing if errors were fixed..."
node src/test-claude-fix.js && echo "✅ All errors fixed successfully!" || echo "❌ Some errors still remain."