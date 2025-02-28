#!/bin/bash

echo "GitHub Credential Setup Script"
echo "============================="
echo

read -p "Enter your GitHub username: " username
read -s -p "Enter your GitHub personal access token: " token
echo

# Configure Git to use the credentials
git config --global credential.helper store

# Store the credentials
echo "https://$username:$token@github.com" > ~/.git-credentials

# Make sure the file has restricted permissions
chmod 600 ~/.git-credentials

# Set global Git config
git config --global user.name "$username"
read -p "Enter your email for Git commits: " email
git config --global user.email "$email"

echo
echo "✅ GitHub credentials successfully configured!"
echo "To push to GitHub, use:"
echo "  git remote add origin https://github.com/$username/PromptPlace3.git"
echo "  git push -u origin master"