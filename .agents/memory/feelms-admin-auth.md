---
name: Feelms admin auth keys
description: Token/session key naming for the separate admin app authentication.
---

## Token storage keys

- **Admin panel** (`artifacts/admin`): `feelms_admin_token` in localStorage
- **2FA temp token** (admin): `admin_2fa_temp_token` in sessionStorage
- **2FA dev code hint** (admin): `admin_2fa_dev_code` in sessionStorage

## Why separate keys

The admin panel is a completely separate Vite app from the public site. Using a separate token key (`feelms_admin_token` vs the public site's `feelms_token`) prevents token leakage between the two apps if ever co-hosted on the same domain.

**How to apply:** Any future admin-specific storage must use the `admin_` prefix to avoid collision.

## Auth flow

1. POST `/api/auth/login` — returns `requires2FA: true` + `tempToken` → redirect to `/2fa`
2. POST `/api/auth/2fa/verify` with `Authorization: Bearer {tempToken}` → returns final `token`
3. GET `/api/auth/me` — used on mount to verify token and confirm role === "ADMIN"
4. If role is not ADMIN, token is cleared immediately
