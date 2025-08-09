module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum - allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system or external dependencies
        'ci',       // CI/CD changes
        'chore',    // Other changes that don't modify src or test files
        'revert',   // Revert a previous commit
        'security', // Security fixes
        'deps',     // Dependency updates
        'config',   // Configuration changes
        'release'   // Release commits
      ]
    ],
    
    // Subject case - enforce lowercase
    'subject-case': [2, 'always', 'lower-case'],
    
    // Subject length - max 100 characters
    'subject-max-length': [2, 'always', 100],
    
    // Subject min length - at least 10 characters
    'subject-min-length': [2, 'always', 10],
    
    // Subject empty - subject is required
    'subject-empty': [2, 'never'],
    
    // Subject full stop - no period at the end
    'subject-full-stop': [2, 'never', '.'],
    
    // Type case - enforce lowercase
    'type-case': [2, 'always', 'lower-case'],
    
    // Type empty - type is required
    'type-empty': [2, 'never'],
    
    // Scope case - enforce lowercase
    'scope-case': [2, 'always', 'lower-case'],
    
    // Body leading blank - require blank line before body
    'body-leading-blank': [2, 'always'],
    
    // Body max line length
    'body-max-line-length': [2, 'always', 100],
    
    // Footer leading blank - require blank line before footer
    'footer-leading-blank': [2, 'always'],
    
    // Footer max line length
    'footer-max-line-length': [2, 'always', 100],
    
    // Header max length
    'header-max-length': [2, 'always', 100]
  },
  
  // Custom scope enum for this project
  'scope-enum': [
    2,
    'always',
    [
      // Frontend scopes
      'frontend',
      'ui',
      'components',
      'pages',
      'hooks',
      'styles',
      'seo',
      'mobile',
      
      // Backend scopes
      'backend',
      'api',
      'auth',
      'database',
      'models',
      'services',
      'middleware',
      'controllers',
      'routes',
      'validation',
      
      // Infrastructure scopes
      'docker',
      'nginx',
      'redis',
      'elasticsearch',
      'monitoring',
      'deployment',
      'ci',
      'security',
      
      // Development scopes
      'tests',
      'docs',
      'config',
      'scripts',
      'deps',
      'tools',
      
      // Feature scopes
      'properties',
      'users',
      'search',
      'notifications',
      'payments',
      'analytics',
      'chat',
      'maps',
      'images',
      'email',
      'sms',
      
      // General
      'core',
      'utils',
      'types',
      'shared'
    ]
  ],
  
  // Custom prompt for interactive commits
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨'
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛'
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚'
          },
          style: {
            description: 'Changes that do not affect the meaning of the code',
            title: 'Styles',
            emoji: '💎'
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦'
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀'
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨'
          },
          build: {
            description: 'Changes that affect the build system or external dependencies',
            title: 'Builds',
            emoji: '🛠'
          },
          ci: {
            description: 'Changes to our CI configuration files and scripts',
            title: 'Continuous Integrations',
            emoji: '⚙️'
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '♻️'
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑'
          },
          security: {
            description: 'Security improvements',
            title: 'Security',
            emoji: '🔒'
          }
        }
      },
      scope: {
        description: 'What is the scope of this change (e.g. component or file name)'
      },
      subject: {
        description: 'Write a short, imperative tense description of the change'
      },
      body: {
        description: 'Provide a longer description of the change'
      },
      isBreaking: {
        description: 'Are there any breaking changes?'
      },
      breakingBody: {
        description: 'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself'
      },
      breaking: {
        description: 'Describe the breaking changes'
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?'
      },
      issuesBody: {
        description: 'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself'
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)'
      }
    }
  }
};