Write-Host "🚀 Deploying Agents Page Fix to Production" -ForegroundColor Green
Write-Host "Server: 146.190.121.74" -ForegroundColor Cyan
Write-Host ("=" * 50)

# Check if SSH key exists
$sshKeyPath = ".\key"
if (-not (Test-Path $sshKeyPath)) {
    Write-Host "❌ SSH key not found at: $sshKeyPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SSH key found: $sshKeyPath" -ForegroundColor Green

# Set correct permissions for SSH key
try {
    icacls $sshKeyPath /inheritance:r /grant:r "$env:USERNAME:(R)" | Out-Null
    Write-Host "✅ SSH key permissions set correctly" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not set SSH key permissions" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔐 Connecting to server and deploying agents page..." -ForegroundColor Blue

try {
    # First, create the agents directory and page on the server
    $createAgentsScript = @'
# Navigate to frontend app directory
cd /var/www/xillix/frontend/src/app

# Create agents directory if it doesn't exist
mkdir -p agents

# Create the agents page
cat > agents/page.tsx << 'EOF'
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Real Estate Agent
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with experienced real estate professionals who know the Kenyan market inside out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Agent Cards */}
          {[1, 2, 3, 4, 5, 6].map((agent) => (
            <Card key={agent} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">A{agent}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Agent {agent}</CardTitle>
                    <p className="text-gray-600">Real Estate Professional</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Experienced agent specializing in residential and commercial properties in Kenya.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">5+ years experience</span>
                  <Button size="sm">Contact Agent</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Become an Agent
              </h2>
              <p className="text-gray-600 mb-6">
                Join our network of professional real estate agents and grow your business with Xillix.
              </p>
              <Button size="lg">Join as an Agent</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
EOF

echo "✅ Agents page created successfully"

# Rebuild the frontend
cd /var/www/xillix/frontend
echo "🔨 Building frontend..."
npm run build

# Restart the frontend application
echo "🔄 Restarting frontend application..."
pm2 restart real-estate-frontend

echo "✅ Agents page deployment completed!"
'@

    $sshCommand = "ssh -i $sshKeyPath -o StrictHostKeyChecking=no root@146.190.121.74 '$createAgentsScript'"
    
    Invoke-Expression $sshCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Agents page deployed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Test the agents page at:" -ForegroundColor Cyan
        Write-Host "   https://xillix.co.ke/agents" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Deployment failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ SSH connection failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Agents page fix deployment completed!" -ForegroundColor Green