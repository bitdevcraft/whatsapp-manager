const DEFAULT_TEAM_METADATA = JSON.stringify({ personal: false });

export interface BootstrapSeedEnv {
  adAccountId?: string;
  databaseUrl: string;
  encryptionKey: string;
  postgresUserRole: string;
  teamMetadata: string;
  teamName: string;
  teamSlug: string;
  teamWhatsAppLimit?: number;
  userEmail: string;
  userName: string;
  userPassword: string;
  whatsappApiAccessToken: string;
  whatsappApiVersion: string;
  whatsappBusinessAccountId: string;
  whatsappPhoneNumberId: string;
}

export function getOptionalEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

export function getRequiredEnv(key: string): string {
  const value = getOptionalEnv(key);

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function loadBootstrapSeedEnv(): BootstrapSeedEnv {
  return {
    adAccountId: getOptionalEnv("DB_SEED_AD_ACCOUNT_ID"),
    databaseUrl: getRequiredEnv("DATABASE_URL"),
    encryptionKey: getRequiredEnv("ENCRYPTION_KEY"),
    postgresUserRole: getRequiredEnv("POSTGRES_USER_ROLE"),
    teamMetadata: parseMetadata(
      getOptionalEnv("DB_SEED_TEAM_METADATA") ?? DEFAULT_TEAM_METADATA
    ),
    teamName: getRequiredEnv("DB_SEED_TEAM_NAME"),
    teamSlug: getRequiredEnv("DB_SEED_TEAM_SLUG"),
    teamWhatsAppLimit: parseOptionalIntegerEnv("DB_SEED_TEAM_WHATSAPP_LIMIT"),
    userEmail: getRequiredEnv("DB_SEED_USER_EMAIL").toLowerCase(),
    userName: getRequiredEnv("DB_SEED_USER_NAME"),
    userPassword: getRequiredEnv("DB_SEED_USER_PASSWORD"),
    whatsappApiAccessToken: getRequiredEnv("WHATSAPP_API_ACCESS_TOKEN"),
    whatsappApiVersion: getRequiredEnv("WHATSAPP_API_VERSION"),
    whatsappBusinessAccountId: getRequiredEnv("WHATSAPP_BUSINESS_ACCOUNT_ID"),
    whatsappPhoneNumberId: getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID"),
  };
}

function parseMetadata(rawMetadata: string): string {
  try {
    const parsed = JSON.parse(rawMetadata) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("DB_SEED_TEAM_METADATA must be a JSON object");
    }

    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error(
      `Invalid DB_SEED_TEAM_METADATA: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

function parseOptionalIntegerEnv(key: string): number | undefined {
  const rawValue = getOptionalEnv(key);

  if (!rawValue) {
    return undefined;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Environment variable ${key} must be an integer`);
  }

  return parsedValue;
}
