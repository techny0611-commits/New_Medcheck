module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'simple-server.cjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};