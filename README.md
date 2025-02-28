# PromptPlace3

This repository demonstrates automated error detection and fixing in JavaScript code using GitHub Actions.

## Features

- **GitHub Pages** - The site is accessible at [https://mnaei.github.io/PromptPlace3/](https://mnaei.github.io/PromptPlace3/)
- **Automated Error Fixing** - The repository includes a system that automatically detects errors in JavaScript code and attempts to fix them

## How the Auto-Fix System Works

1. **Error Detection**: When tests run in GitHub Actions, any error output is captured to a file
2. **Error Parsing**: A JavaScript script parses the error output and identifies common error patterns
3. **Auto-Fix Logic**: For each detected error, the system applies appropriate fixes based on the error type
4. **Commit Changes**: If fixes were made, GitHub Actions automatically commits the changes

### Supported Error Types

- **Syntax Errors**: Missing semicolons, unclosed parentheses/brackets
- **Reference Errors**: Undefined variables
- **Type Errors**: Null/undefined object access

## Testing the System Locally

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Generate errors by running the buggy code:
   ```
   npm run create-error
   ```
4. Fix the errors automatically:
   ```
   npm run fix-errors
   ```
5. Run the tests:
   ```
   npm test
   ```

## GitHub Actions Integration

The system is integrated with GitHub Actions, which will automatically run tests on every push or pull request to the master branch. If errors are detected, it will attempt to fix them and commit the changes back to the repository.

## Contributing

Feel free to contribute to this project by:
1. Adding more error patterns to detect
2. Improving the auto-fix logic
3. Adding support for other programming languages