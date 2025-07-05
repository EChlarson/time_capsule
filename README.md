# TimeCapsule
Team Assignment for CSE341

## API Documentation
The TimeCapsule API allows users to create, manage, and share time capsules, with Google OAuth for authentication. All endpoints are documented in the Swagger UI, accessible at `/api-docs` (e.g., http://localhost:3000/api-docs or https://time-capsule-3kgt.onrender.com/api-docs).

### Authentication Endpoints - temporarily disabled
- **GET /**: Returns a welcome message: "Time Capsule API".
- **GET /api/auth/login**: Initiates Google OAuth login, redirecting to Google’s authentication page.
- **GET /api/auth/callback**: Handles Google OAuth callback, redirecting to `/api/capsules` on success or `/api/auth/login` on failure.
- **GET /api/auth/logout**: Logs out the user and redirects to `/`.

### Capsule Endpoints
- **GET /api/capsules**: Returns all capsules created by the authenticated user. Requires authentication.
- **GET /api/capsules/:id**: Retrieves a specific capsule by ID if owned by the user or if its reveal date has passed. Requires authentication.
- **POST /api/capsules**: Creates a new capsule for the authenticated user. Requires fields: `title`, `message`, `revealDate`. Optional fields: `imageUrl`, `isPrivate` (defaults to `true`). Includes data validation.
- **PUT /api/capsules/:id**: Updates a capsule by ID if owned by the authenticated user. All fields (`title`, `message`, `revealDate`, `imageUrl`, `isPrivate`) are optional. Includes data validation.
- **DELETE /api/capsules/:id**: Deletes a capsule by ID if owned by the authenticated user. Requires authentication.

### Planned Endpoints
- **Comments**: Endpoints for managing comments on capsules (GET, POST, PUT, DELETE) are planned but not yet implemented.
- **Media**: Endpoints for managing media associated with capsules (GET, POST, PUT, DELETE) are planned but not yet implemented.

### API Documentation
For detailed endpoint specifications, including request/response formats and error codes, see the Swagger documentation at `/api-docs` or import `docs/swaggerConfig.js` into https://editor.swagger.io/.

### Deployment
The API is deployed on Render at https://time-capsule-3kgt.onrender.com. Local development runs on http://localhost:3000.

### Project Structure
- **Authentication**: Uses Google OAuth 2.0 via Passport.js.
- **Database**: MongoDB with Mongoose, including `Capsule` and `User` models (additional models for comments and media planned).
- **Validation**: Uses `express-validator` for data validation on capsule endpoints.
- **Testing**: Jest and `supertest` configured for unit tests (in progress).

### Team
- Elizabeth Chlarson
- Yvette Johnson
- Kimberly Miner