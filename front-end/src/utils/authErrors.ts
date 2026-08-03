import type { TFunction } from 'i18next';

/**
 * Traduction des erreurs d'authentification renvoyées par l'API.
 *
 * Trois niveaux, du plus fiable au moins fiable :
 *  1. le code structuré renvoyé par le back (`code`) ;
 *  2. la correspondance sur le message anglais, pour les exceptions qui n'ont
 *     pas encore de code ;
 *  3. un repli générique traduit.
 *
 * Le niveau 2 est une solution d'attente : il dépend du libellé exact côté
 * back et cassera silencieusement si celui-ci change (on retombera alors sur
 * le repli). La correction durable est que le back attache un `code` à chaque
 * exception, comme il le fait déjà pour MULTIPLE_ACCOUNTS.
 */

/** Messages anglais actuellement renvoyés par backend/src/auth, par clé i18n. */
const MESSAGE_KEYS: Record<string, string> = {
  'invalid credentials': 'invalidCredentials',
  'user not found': 'userNotFound',
  'email or phone number is required': 'emailOrPhoneRequired',
  'email already verified': 'emailAlreadyVerified',
  'invalid or expired verification token': 'invalidVerificationToken',
  'invalid or expired reset token': 'invalidResetToken',
  'invalid verification code': 'invalidVerificationCode',
  'verification code has expired': 'verificationCodeExpired',
  'maximum verification attempts exceeded': 'tooManyAttempts',
  'email is required from oauth provider': 'oauthEmailRequired'
};

interface ApiErrorShape {
  response?: {
    data?: {
      code?: unknown;
      message?: unknown;
    };
  };
  message?: unknown;
}

/** Extrait le message brut, que le back l'envoie à plat ou imbriqué. */
function rawMessageOf(error: ApiErrorShape): string | undefined {
  const payload = error?.response?.data?.message;
  if (typeof payload === 'string') return payload;
  if (payload && typeof payload === 'object') {
    const nested = (payload as { message?: unknown }).message;
    if (typeof nested === 'string') return nested;
  }
  if (typeof error?.message === 'string') return error.message;
  return undefined;
}

/**
 * Message d'erreur prêt à afficher, dans la langue de l'interface.
 *
 * @param fallbackKey clé i18n (namespace `auth`) utilisée quand l'erreur n'est
 *                    pas reconnue — par exemple `errors.loginFailed`.
 */
export function getAuthErrorMessage(
  error: unknown,
  t: TFunction,
  fallbackKey: string
): string {
  const err = (error ?? {}) as ApiErrorShape;

  const code = err?.response?.data?.code;
  if (typeof code === 'string' && code) {
    const translated = t(`errors.codes.${code}`, { defaultValue: '' });
    if (translated) return translated;
  }

  const raw = rawMessageOf(err);
  if (raw) {
    const key = MESSAGE_KEYS[raw.trim().toLowerCase()];
    if (key) {
      const translated = t(`errors.messages.${key}`, { defaultValue: '' });
      if (translated) return translated;
    }
  }

  return t(fallbackKey);
}
