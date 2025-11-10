#!/bin/bash

echo "========================================"
echo "PLC Automation Suite - Netlify Deploy"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - PLC Automation Suite"
    echo "✓ Git repository initialized"
    echo ""
fi

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
    echo "✓ Netlify CLI installed"
    echo ""
fi

# Build the application
echo "Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ Build successful"
    echo ""
else
    echo "✗ Build failed. Please fix errors and try again."
    exit 1
fi

echo "Starting Netlify deployment..."
echo ""
echo "IMPORTANT: You will be prompted to:"
echo "1. Log in to Netlify (if not already)"
echo "2. Choose 'Create & configure a new site'"
echo "3. Enter your site name (or press Enter for random)"
echo "4. After deployment, add environment variables in Netlify dashboard:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo ""
read -p "Press Enter to continue..."

netlify deploy --prod

echo ""
echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Go to your Netlify dashboard: https://app.netlify.com"
echo "2. Find your site and go to Site Settings > Environment Variables"
echo "3. Add your Supabase credentials:"
echo "   - VITE_SUPABASE_URL=your_supabase_url"
echo "   - VITE_SUPABASE_ANON_KEY=your_anon_key"
echo "4. Trigger a new deployment from the Deploys tab"
echo ""
echo "Your site will be live at: https://YOUR-SITE-NAME.netlify.app"
echo ""
