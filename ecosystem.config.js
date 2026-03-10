// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "frontend",
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
