const COOKIE_PREFIX = "centcapio";
export const COOKIE_NAME = {
  API_LOCALE: `${COOKIE_PREFIX}_locale`,
  APP_LOCALE: `${COOKIE_PREFIX}_app-locale`,
  AUTH_SESSION: `${COOKIE_PREFIX}_auth-session`,
  GOOGLE_OAUTH_STATE: `${COOKIE_PREFIX}_google-oauth-state`,
} as const;
