module.exports = {
  apps: [
    {
      name: 'xillix-backend',
      script: './backend/dist/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5001,
      },
      // Logging
      log_file: './logs/backend/combined.log',
      out_file: './logs/backend/out.log',
      error_file: './logs/backend/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      watch: false,
      
      // Memory management
      max_memory_restart: '1G',
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Advanced features
      source_map_support: true,
      instance_var: 'INSTANCE_ID',
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Environment variables
      env_file: '.env.production',
      
      // Cron restart (daily at 2 AM)
      cron_restart: '0 2 * * *',
      
      // Merge logs
      merge_logs: true,
      
      // Time zone
      time: true,
    },
    
    {
      name: 'xillix-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
      },
      
      // Logging
      log_file: './logs/frontend/combined.log',
      out_file: './logs/frontend/out.log',
      error_file: './logs/frontend/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      watch: false,
      
      // Memory management
      max_memory_restart: '2G',
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Environment variables
      env_file: '.env.production',
      
      // Cron restart (daily at 2 AM)
      cron_restart: '0 2 * * *',
      
      // Merge logs
      merge_logs: true,
      
      // Time zone
      time: true,
    },
    
    {
      name: 'xillix-worker',
      script: './backend/dist/worker.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'general',
      },
      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'general',
      },
      
      // Logging
      log_file: './logs/worker/combined.log',
      out_file: './logs/worker/out.log',
      error_file: './logs/worker/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      watch: false,
      
      // Memory management
      max_memory_restart: '512M',
      
      // Graceful shutdown
      kill_timeout: 10000,
      
      // Environment variables
      env_file: '.env.production',
      
      // Merge logs
      merge_logs: true,
      
      // Time zone
      time: true,
    },
    
    {
      name: 'xillix-scheduler',
      script: './backend/dist/scheduler.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        SCHEDULER_TYPE: 'cron',
      },
      env_production: {
        NODE_ENV: 'production',
        SCHEDULER_TYPE: 'cron',
      },
      
      // Logging
      log_file: './logs/scheduler/combined.log',
      out_file: './logs/scheduler/out.log',
      error_file: './logs/scheduler/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      min_uptime: '10s',
      max_restarts: 5,
      autorestart: true,
      watch: false,
      
      // Memory management
      max_memory_restart: '256M',
      
      // Graceful shutdown
      kill_timeout: 15000,
      
      // Environment variables
      env_file: '.env.production',
      
      // Merge logs
      merge_logs: true,
      
      // Time zone
      time: true,
    }
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: ['xillix.co.ke'],
      ref: 'origin/main',
      repo: 'https://github.com/your-username/xillix-realestate.git',
      path: '/var/www/xillix',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    
    staging: {
      user: 'deploy',
      host: ['staging.xillix.co.ke'],
      ref: 'origin/develop',
      repo: 'https://github.com/your-username/xillix-realestate.git',
      path: '/var/www/xillix-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    }
  }
};