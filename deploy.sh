#!/bin/bash

# Deployment script for Monaghan's Bar & Grill
# Usage: ./deploy.sh [coming-soon|full]

set -e

DEPLOYMENT_TYPE=${1:-"coming-soon"}

echo "🚀 Deploying Monaghan's Bar & Grill - $DEPLOYMENT_TYPE mode"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

if [ "$DEPLOYMENT_TYPE" = "coming-soon" ]; then
    echo "🌅 Deploying coming soon page..."
    
    # Create a simple index.html that redirects to coming-soon
    cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monaghan's Bar & Grill - Coming Soon</title>
    <meta http-equiv="refresh" content="0; url=/coming-soon">
    <style>
        body { margin: 0; padding: 0; background: #1a1a2e; }
        .loading { 
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            color: white; 
            font-family: Arial, sans-serif; 
        }
    </style>
</head>
<body>
    <div class="loading">Redirecting...</div>
</body>
</html>
EOF
    
    echo "✅ Coming soon page ready for deployment"
    echo "📝 To deploy:"
    echo "   1. Run: vercel --prod"
    echo "   2. Or deploy to your preferred platform"
    
elif [ "$DEPLOYMENT_TYPE" = "full" ]; then
    echo "🏗️ Deploying full CMS..."
    
    # Remove the coming soon redirect
    rm -f public/index.html
    
    echo "✅ Full CMS ready for deployment"
    echo "📝 To deploy:"
    echo "   1. Run: vercel --prod"
    echo "   2. Make sure to set up your database and environment variables"
    echo "   3. Run the seed script: npm run db:seed"
    
else
    echo "❌ Error: Invalid deployment type. Use 'coming-soon' or 'full'"
    exit 1
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo "💡 Tip: Use 'npm run dev' to test locally before deploying"
