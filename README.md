# HD Notes Frontend

A React-based frontend for the HD Notes application with Redux state management and OTP-based authentication.

## Features

- ✅ OTP-based authentication (signup/login)
- ✅ Protected routes with automatic redirects
- ✅ Redux state management with RTK Query
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript support
- ✅ Error handling and loading states
- ✅ Token-based authentication with localStorage
- ✅ User dashboard with profile information

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Make sure your backend server is running on `http://localhost:5000`

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Custom button component
│   ├── Input.tsx       # Custom input component
│   └── ProtectedRoute.tsx # Route protection component
├── pages/              # Page components
│   ├── Login.tsx       # Login page with OTP
│   ├── Signup.tsx      # Signup page with OTP
│   └── Dashboard.tsx   # User dashboard
├── redux/              # Redux store and slices
│   ├── store.ts        # Redux store configuration
│   ├── authSlice.ts    # Authentication state management
│   └── noteSlice.ts    # Notes state management (future)
├── services/           # API services
│   └── api.ts          # Axios configuration and API calls
└── App.tsx             # Main application component
```

## Authentication Flow

1. **Signup Process:**
   - User enters name, email, and date of birth
   - Clicks "Get OTP" to receive verification code
   - Enters OTP and clicks "Sign up"
   - Upon success, redirected to dashboard

2. **Login Process:**
   - User enters email
   - Clicks "Get OTP" to receive verification code
   - Enters OTP and clicks "Sign in"
   - Upon success, redirected to dashboard

3. **Protected Routes:**
   - Dashboard is protected and requires authentication
   - Unauthenticated users are automatically redirected to login
   - Token is stored in localStorage for persistence

## API Integration

The frontend communicates with the backend through the following endpoints:

- `POST /api/auth/send-signup-otp` - Send OTP for signup
- `POST /api/auth/signup` - Complete signup with OTP
- `POST /api/auth/send-login-otp` - Send OTP for login
- `POST /api/auth/login` - Complete login with OTP
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/logout` - Logout user

## State Management

The application uses Redux Toolkit for state management:

- **Auth State:** User information, authentication status, OTP state
- **Notes State:** Notes data (prepared for future implementation)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Environment Variables

The frontend automatically connects to the backend on `http://localhost:5000`. If you need to change this, update the `API_BASE_URL` in `src/services/api.ts`.

## Troubleshooting

1. **CORS Issues:** Make sure your backend has CORS configured to allow requests from `http://localhost:5173`

2. **API Connection Issues:** Verify that your backend server is running on port 5000

3. **OTP Not Received:** Check your email spam folder or verify the email configuration in your backend

4. **Authentication Issues:** Clear localStorage and try logging in again


