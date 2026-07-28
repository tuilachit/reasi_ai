const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const WAITLIST_ERRORS = {
  invalidEmail: 'Enter a valid email address.',
  locationRequired: 'Tell us your weekly supermarket and suburb.',
}

/**
 * @param {unknown} count
 */
export function formatFlooredPlus(count) {
  const numericCount = Number(count)
  if (!Number.isFinite(numericCount) || numericCount < 0) {
    return '0+'
  }
  return `${Math.floor(numericCount)}+`
}

/**
 * @typedef {{
 *   email: string,
 *   weeklySupermarket: string,
 *   weeklySuburb: string,
 * }} WaitlistSignup
 */

/**
 * @param {{
 *   email: unknown,
 *   weeklySupermarket: unknown,
 *   weeklySuburb: unknown,
 * }} input
 * @returns {{ ok: true, value: WaitlistSignup } | { ok: false, error: string }}
 */
export function validateWaitlistSignup(input) {
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const weeklySupermarket =
    typeof input.weeklySupermarket === 'string' ? input.weeklySupermarket.trim() : ''
  const weeklySuburb = typeof input.weeklySuburb === 'string' ? input.weeklySuburb.trim() : ''

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, error: WAITLIST_ERRORS.invalidEmail }
  }

  if (!weeklySupermarket || !weeklySuburb) {
    return { ok: false, error: WAITLIST_ERRORS.locationRequired }
  }

  return {
    ok: true,
    value: {
      email: email.toLowerCase(),
      weeklySupermarket,
      weeklySuburb,
    },
  }
}
