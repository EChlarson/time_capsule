# time_capsule
Team Assignment for CSE341

## API Documentation
- **GET /**: Returns "Time Capsule API".
- **GET /api/auth/login**: Starts Google OAuth login.
- **GET /api/auth/callback**: Handles OAuth callback, redirects to /api/capsules or /api/auth/login.
- **GET /api/auth/logout**: Logs out, redirects to /.
- **GET /api/capsules**: Returns user capsules (TBD by [Capsules Teammate Name]).
- See `swagger.json` or https://editor.swagger.io/ for details.