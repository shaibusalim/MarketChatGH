// Centralized admin route prefix.
// Changing this one value will NOT update every reference automatically —
// remember to also update:
//   - proxy.ts (matcher pattern + redirect path strings)
//   - folder rename: src/app/admin -> src/app/{prefix}
//   - auth.config.ts pages.signIn + redirect callback string startsWith
//   - any hard-coded /admin* strings in server route handlers that can't import here (API routes)
export const ADMIN_PREFIX = '/mcgh-admin-control'

// Helpers to avoid repeating concatenation patterns
export const ADMIN_SIGNIN = `${ADMIN_PREFIX}/signin`
export const ADMIN_HOME = `${ADMIN_PREFIX}`
export const ADMIN_SELLERS = `${ADMIN_PREFIX}/sellers`
export const ADMIN_PRODUCTS = `${ADMIN_PREFIX}/products`
export const ADMIN_BLOG = `${ADMIN_PREFIX}/blog`

export function adminPath(suffix: string): string {
  if (!suffix) return ADMIN_PREFIX
  const s = suffix.startsWith('/') ? suffix : `/${suffix}`
  return `${ADMIN_PREFIX}${s}`
}
