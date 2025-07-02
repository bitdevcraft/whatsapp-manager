// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "web",
      cwd: "./apps/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      env: {
        NODE_ENV: "development",
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "whatsapp-service",
      cwd: "./apps/whatsapp-service",
      script: "node",
      args: "dist/index.js",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    }
  ],
};
