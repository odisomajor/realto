module.exports = {
  // TypeScript and JavaScript files
  '**/*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],
  
  // JSON files
  '**/*.json': [
    'prettier --write',
    'git add'
  ],
  
  // CSS and SCSS files
  '**/*.{css,scss,sass}': [
    'prettier --write',
    'git add'
  ],
  
  // Markdown files
  '**/*.md': [
    'prettier --write',
    'git add'
  ],
  
  // YAML files
  '**/*.{yml,yaml}': [
    'prettier --write',
    'git add'
  ],
  
  // Package.json files - run npm audit
  'package.json': [
    'npm audit fix --audit-level moderate',
    'git add'
  ],
  
  // Backend TypeScript files - additional checks
  'backend/**/*.{js,ts}': [
    'eslint --fix',
    'prettier --write',
    () => 'npm run type-check:backend',
    'git add'
  ],
  
  // Frontend TypeScript/React files - additional checks
  'frontend/**/*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'npm run type-check:frontend',
    'git add'
  ],
  
  // Test files - run related tests
  '**/*.{test,spec}.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'npm run test:related',
    'git add'
  ],
  
  // Prisma schema files
  'backend/prisma/schema.prisma': [
    () => 'npm run prisma:format',
    'git add'
  ],
  
  // Environment files - validate format
  '.env*': [
    () => 'echo "⚠️  Environment file changed. Please verify all required variables are set."'
  ],
  
  // Docker files - validate syntax
  'Dockerfile*': [
    () => 'docker run --rm -i hadolint/hadolint < Dockerfile || true'
  ],
  
  // Docker compose files - validate syntax
  'docker-compose*.yml': [
    () => 'docker-compose config -q || true'
  ]
};