module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'working-server.cjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        MONGODB_URI: process.env.MONGODB_URI,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        BASE_URL: process.env.BASE_URL || 'http://localhost:3001'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};