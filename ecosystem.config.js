const { join } = require('path')

module.exports = {
  apps: [{
    name: 'editor',
    cwd: __dirname,
    script: 'node_modules/nuxt/bin/nuxt.js',
    args: `-c ${join(__dirname, 'nuxt.config.js')} start`,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '350M',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}
