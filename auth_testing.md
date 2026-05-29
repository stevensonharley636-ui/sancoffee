# Auth Testing Playbook — Green-Haus Editor CMS

Auth: custom JWT email/password (Bearer token in localStorage `gh_token`).

## Credentials
- Editor email: nsabemungu@gmail.com
- Editor password: ksDR1afJNKHSHI

## API Testing (use REACT_APP_BACKEND_URL)
```
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
TOKEN=$(curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"nsabemungu@gmail.com","password":"ksDR1afJNKHSHI"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s "$API/api/auth/me" -H "Authorization: Bearer $TOKEN"
curl -s "$API/api/admin/products" -H "Authorization: Bearer $TOKEN"
# unauthorized should be 401:
curl -s -o /dev/null -w "%{http_code}\n" "$API/api/admin/products"
```

## Expected
- Login returns `{token, user}` with user.role == "editor".
- Wrong password -> 401 "Invalid email or password".
- Admin endpoints without Bearer -> 401.
- Public `/api/content` and `/api/products` work without auth.

## Frontend flow
- `/login` -> sign in -> redirect to `/dashboard`.
- `/dashboard` has two tabs: "Site Content" and "Products".
- Visiting `/dashboard` without a token redirects to `/login`.
