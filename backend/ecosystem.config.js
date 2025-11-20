// Configuration PM2 pour Groupauto ERP
module.exports = {
  apps: [{
    name: 'groupauto-erp',
    script: './src/server.js',
    cwd: '/var/www/site2/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 4001
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=512'
  }]
};


