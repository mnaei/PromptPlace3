# PromptPlace3

This repository demonstrates AI-powered error detection and fixing in JavaScript code using GitHub Actions and Claude.

## Features

- **GitHub Pages** - The site is accessible at [https://mnaei.github.io/PromptPlace3/](https://mnaei.github.io/PromptPlace3/)
- **Claude-Powered Error Fixing** - The repository includes a system that automatically detects errors in JavaScript code and uses Claude AI to intelligently fix them

## How the Claude-Powered Auto-Fix System Works

1. **Error Detection**: When tests run in GitHub Actions, any error output is captured to a file
2. **Error Parsing**: A JavaScript script parses the error output to identify affected files and error details
3. **AI-Powered Auto-Fix**: Errors are sent to Claude via API, which analyzes the code context and error messages to generate intelligent fixes
4. **Commit Changes**: If fixes were made, GitHub Actions automatically commits the changes back to the repository

### Advantages of Claude-Powered Fixes

- **Contextual Understanding**: Claude analyzes the entire file and error context, not just predefined patterns
- **Intelligent Solutions**: Claude can generate sophisticated fixes for complex errors beyond simple pattern matching
- **Continuous Learning**: The system becomes more effective over time as Claude's capabilities improve
- **Handles Unknown Errors**: Can attempt fixes for error types it hasn't seen before

## Testing the System Locally

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set your Claude API key as an environment variable:
   ```
   export CLAUDE_API_KEY="your-api-key"
   ```
4. Generate errors by running the buggy code:
   ```
   npm run create-error
   ```
5. Fix the errors using Claude:
   ```
   npm run fix-errors-claude
   ```
6. Run the tests:
   ```
   npm test
   ```

## GitHub Actions Integration

The system is integrated with GitHub Actions, which automatically runs tests on every push or pull request to the master branch. If errors are detected, it sends them to Claude for analysis and intelligent fixes, then commits the changes back to the repository.

To use this in your own GitHub repository:
1. Add the workflow file and Claude error parser script
2. Add your Claude API key as a GitHub secret named `CLAUDE_API_KEY`
3. For commit access, create a Personal Access Token (PAT) with `repo` scope:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Create a new token with the "repo" scope
   - Add this token as a GitHub secret named `GH_PAT`

## Contributing

Feel free to contribute to this project by:
1. Improving the error detection and parsing
2. Enhancing the Claude prompt for better results
3. Extending support to other programming languages
4. Adding more sophisticated test cases and error scenarios