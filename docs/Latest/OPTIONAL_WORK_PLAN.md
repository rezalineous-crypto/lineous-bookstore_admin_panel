# Optional Work Plan — Admin Panel Refresh-Token Migration

## Phase A — Admin Profile UI
1. `lib/hooks/use-users.ts` — add `useMe()` (getMe) and `useUpdateMe()` (updateMe) mutations.
2. `app/admin/settings/page.tsx` — new settings page: email (read-only), name, bio, password change (calls resetPassword). Reuse `custom-input.tsx` / `button.tsx`.
3. `components/layout/navbar.tsx` — replace hardcoded "Admin User"/"admin@bookstore.com" with `useAuth().user`; add dropdown (Profile, Settings, Logout) using `dropdown-menu.tsx`.
4. `config/navigation.ts` — uncomment/add "Settings" entry → `/admin/settings`.

## Phase B — Password Reset / Forgot Password Pages
1. `app/admin/auth/forgot-password/page.tsx` — email input → `authApi.forgotPassword`; generic success message.
2. `app/admin/auth/reset-password/page.tsx` — read `token` from URL; new password + confirm → `authApi.resetPassword({ token, newPassword })`; handle 400 toast.
3. `constants/route.ts` — add routes if it defines them.

## Phase C — Deferred Risk Mitigations
- Risk 2 (serialized refresh): DONE in `lib/api/axios.ts`.
- Risk 6 (logout clears server): DONE in `contexts/auth-context.tsx`.
- Risk 3 (pagination): DONE.
- Risk 4 (cancel/return): DONE.
- Risk 1 (XSS storage): DEFER — keep localStorage; add `authStorage` module later.
- Risk 5 (proactive refresh): add `setTimeout`-based refresh ~1 min before access-token expiry in `auth-context.tsx`; clear on logout.
- Risk 7 (anonymous vs admin client split): create `lib/api/public.ts` with no auth interceptor; use it in public receipt-verify screen so admin token isn't leaked.
- Risk 8 (migration ordering): OPS — run `npx prisma migrate deploy && npx prisma generate` on backend before deploying frontend.

## Phase D — Verification
- `npx tsc --noEmit` — fix remaining type errors.
- `npm run build` / `next build`.
- Smoke test: login → navbar shows real name/email → Settings saves → forgot/reset flows → pagination + search → cancel/return buttons.

## Dependency order
```
Phase A (hooks) → A (settings page + navbar) → B (password pages) → C (risks) → D (verify)