module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/webapp',
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        BASE_URL: process.env.BASE_URL || 'http://localhost:3000'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};