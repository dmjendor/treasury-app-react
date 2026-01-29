/**
 * Auth provider configuration helpers.
 */
import "server-only";
import Facebook from "@auth/core/providers/facebook";
import Google from "@auth/core/providers/google";
import Twitch from "@auth/core/providers/twitch";

const providerDefinitions = [
  {
    id: "google",
    name: "Google",
    icon: "https://authjs.dev/img/providers/google.svg",
    envId: "AUTH_GOOGLE_ID",
    envSecret: "AUTH_GOOGLE_SECRET",
    factory: Google,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "https://authjs.dev/img/providers/facebook.svg",
    envId: "AUTH_FACEBOOK_ID",
    envSecret: "AUTH_FACEBOOK_SECRET",
    factory: Facebook,
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: "https://authjs.dev/img/providers/twitch.svg",
    envId: "AUTH_TWITCH_ID",
    envSecret: "AUTH_TWITCH_SECRET",
    factory: Twitch,
  },
];

const hasProviderEnv = (provider) =>
  Boolean(process.env[provider.envId] && process.env[provider.envSecret]);

/**
 * Get enabled auth providers for server-side UI.
 * @returns {Array<{id: string, name: string, icon: string}>}
 */
export function getEnabledAuthProviders() {
  return providerDefinitions
    .filter(hasProviderEnv)
    .map(({ factory, envId, envSecret, ...meta }) => meta);
}

/**
 * Get NextAuth provider configs based on available env vars.
 * @returns {Array<unknown>}
 */
export function getAuthProviderConfigs() {
  return providerDefinitions.filter(hasProviderEnv).map((provider) =>
    provider.factory({
      clientId: process.env[provider.envId],
      clientSecret: process.env[provider.envSecret],
    }),
  );
}
