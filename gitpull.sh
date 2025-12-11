#!/bin/bash
# Git Pull Script for Pama Lodge
# This script pulls the latest changes from the remote repository

echo "=========================================="
echo "Pulling latest changes from GitHub..."
echo "=========================================="
echo ""

# Get the current branch name
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Pull changes
git pull origin $CURRENT_BRANCH

# Check if pull was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ Successfully pulled latest changes!"
    echo "=========================================="
    
    # Show recent commits
    echo ""
    echo "Recent commits:"
    git log --oneline -5
    
    # Check if there are any uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo ""
        echo "⚠ Warning: You have uncommitted changes:"
        git status --short
    fi
else
    echo ""
    echo "=========================================="
    echo "✗ Error pulling changes"
    echo "=========================================="
    exit 1
fi

