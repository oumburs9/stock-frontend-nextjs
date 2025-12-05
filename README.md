# ERP Frontend Architecture

Production-grade ERP system built with Next.js, React Query, and TypeScript.

## Features

- JWT authentication with automatic refresh token handling
- Role-based access control (RBAC)
- User, Role, and Permission management
- Collapsible sidebar with permission-based navigation
- Light/Dark mode toggle
- Responsive design
- Production-ready API client with axios interceptors
- Secure token storage (no localStorage)

## Getting Started

### Development Mode (Mock API)

The app currently runs with mock services for development:

\`\`\`bash
npm install
npm run dev
\`\`\`

Login credentials:
- Admin: `admin@erp.com` / `admin123`
- Manager: `manager@erp.com` / `manager123`

### Production Mode (Real API with JWT)

To switch to production API:

1. Set your API URL in `.env.local`:
\`\`\`
NEXT_PUBLIC_API_URL=https://your-api.com/api
\`\`\`

2. In each service file (`lib/services/*.service.ts`):
   - Comment out the MOCK METHODS section
   - Uncomment the PRODUCTION API METHODS section
   - Ensure imports are present (axiosInstance, API_ENDPOINTS)

3. Backend API Requirements:

**Authentication Endpoints:**

- `POST /auth/login` - Returns `{ accessToken: string, refreshToken?: string }`
- `POST /auth/logout` - Invalidates tokens
- `POST /auth/refresh` - Requires `Authorization: Bearer {refreshToken}`, returns new tokens
- `GET /me` - Returns current user info (requires access token)
- `POST /auth/change-password` - Updates user password

**Token Format:**
- JWT tokens returned in response body (not cookies)
- Access token typically expires in 15 minutes
- Refresh token typically expires in 7 days

## Authentication Flow (Production)

### Login Flow
1. User submits credentials
2. API returns `{ accessToken, refreshToken }` in response body
3. Frontend stores tokens using TokenManager
4. Tokens are stored in httpOnly cookies via Next.js API route
5. All subsequent requests include `Authorization: Bearer {accessToken}` header

### Automatic Token Refresh
1. API request receives 401 Unauthorized
2. Axios interceptor catches the error
3. Refresh token is used to get new access token
4. Failed requests are queued
5. After refresh succeeds, all queued requests retry
6. If refresh fails, user is redirected to login

### Token Storage Security
- Tokens stored in memory (TokenManager singleton)
- Also stored in httpOnly cookies via Next.js API routes
- No localStorage usage (prevents XSS attacks)
- Tokens automatically sent with requests via Authorization header

## Project Structure

\`\`\`
lib/
├── api/
│   ├── axios-instance.ts      # Axios with JWT interceptor & auto-refresh
│   └── token-manager.ts       # Secure JWT token management
├── config/
│   └── api.config.ts          # API configuration and endpoints
├── services/                   # API services (mock + production)
│   ├── auth.service.ts        # Authentication
│   ├── user.service.ts        # User management
│   ├── role.service.ts        # Role management
│   └── permission.service.ts  # Permission management
├── hooks/                      # React Query hooks
├── types/                      # TypeScript types
components/
├── layout/                     # Layout components
├── users/                      # User management
├── roles/                      # Role management
└── permissions/                # Permission management
app/
└── api/
    └── auth/                   # Next.js API routes for token cookies
\`\`\`

## Technology Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- TanStack React Query (server state management)
- Tailwind CSS v4
- shadcn/ui
- Axios

## Security Features

- JWT tokens with automatic refresh
- No localStorage (production-ready security)
- HttpOnly cookies for additional security layer
- Automatic token expiry handling
- Request queuing during token refresh
- Authorization headers with Bearer tokens
- Permission-based UI rendering
- Secure API route handlers

## Switching from Mock to Production

Example for `auth.service.ts`:

\`\`\`typescript
// 1. Comment out mock methods
/*
async login(credentials: LoginRequest): Promise<LoginResponse> {
  // ... mock implementation
}
*/

// 2. Uncomment production methods
async login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await axiosInstance.post<LoginResponse>(
    API_ENDPOINTS.auth.login,
    credentials
  )
  
  if (response.data.accessToken) {
    tokenManager.setTokens(
      response.data.accessToken,
      response.data.refreshToken
    )
  }
  
  return response.data
}
\`\`\`

Repeat this process for all service files.
