type Environment = "development" | "production" | "staging" | "test";

interface EnvironmentConfig {
  database: {
    idleTimeout: number;
    maxConnections: number;
    ssl: boolean;
  };
}

const configurations: Record<Environment, EnvironmentConfig> = {
  development: {
    database: {
      idleTimeout: 30,
      maxConnections: 10,
      ssl: false,
    },
  },
  production: {
    database: {
      idleTimeout: 120,
      maxConnections: 50,
      ssl: false,
    },
  },
  staging: {
    database: {
      idleTimeout: 60,
      maxConnections: 20,
      ssl: false,
    },
  },
  test: {
    database: {
      idleTimeout: 10,
      maxConnections: 5,
      ssl: false,
    },
  },
};

export function getConfig(): EnvironmentConfig {
  const env = (process.env.NODE_ENV ?? "development") as Environment;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return configurations[env] || configurations.development;
}
