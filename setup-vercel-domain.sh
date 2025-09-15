#!/bin/bash

echo "Setting up Vercel domain automation..."

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Link project to Vercel
echo "Linking project to Vercel..."
vercel link --yes

# Add domain to Vercel project
echo "Adding wagyudust.com to Vercel..."
vercel domains add wagyudust.com

echo "✅ Vercel setup complete!"
echo ""
echo "Next steps (manual in Cloudflare DNS):"
echo "1. Go to Cloudflare Dashboard → DNS"
echo "2. Add CNAME: wagyudust.com → cname.vercel-dns.com"
echo "3. Add CNAME: www → cname.vercel-dns.com"
echo "4. Remove any existing A records for the domain"
echo ""
echo "Then push to main branch to trigger deployment!"