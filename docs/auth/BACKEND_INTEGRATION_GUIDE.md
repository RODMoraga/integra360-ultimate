# 🔗 Login Module - Backend Integration Guide

**Module:** Authentication System  
**Frontend Service:** `src/services/auth.service.ts`  
**Backend Expected Endpoints:** `/api/auth/login` and `/api/auth/register`

---

## 📡 API Contract Specification

### Login Endpoint

**Endpoint:** `POST /api/auth/login`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "companyId": 1
}
```

**Request Parameters (in Service):**
```typescript
interface LoginRequest {
  email: string;           // User email address
  password: string;        // Plain text password (hash on server)
  companyId?: number;      // Company ID (defaults to 1)
}
```

**Expected Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Juan Pérez"
  }
}
```

**Response Interface:**
```typescript
interface LoginResponse {
  accessToken: string;     // JWT token for Authorization header
  tokenType: string;       // Should be "Bearer"
  expiresIn?: number;      // Token expiration in seconds (optional)
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Credenciales inválidas",
  "error": "INVALID_CREDENTIALS"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Usuario no encontrado",
  "error": "USER_NOT_FOUND"
}
```

---

### Register Endpoint

**Endpoint:** `POST /api/auth/register`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Juan Pérez García",
  "email": "juan.perez@example.com",
  "password": "SecurePassword123!",
  "companyId": 1
}
```

**Request Parameters (in Service):**
```typescript
interface RegisterRequest {
  fullName: string;        // User's full name
  email: string;           // Unique email address
  password: string;        // Plain text (hash on server)
  companyId?: number;      // Company ID (defaults to 1)
}
```

**Expected Response (201 Created):**
```json
{
  "id": 42,
  "email": "juan.perez@example.com",
  "fullName": "Juan Pérez García",
  "companyId": 1,
  "createdAt": "2026-04-27T10:30:00Z"
}
```

**Error Response (409 Conflict - Email Already Exists):**
```json
{
  "message": "El correo electrónico ya está registrado",
  "error": "EMAIL_ALREADY_EXISTS"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Email inválido",
  "error": "INVALID_EMAIL",
  "field": "email"
}
```

---

## 🔄 Frontend Service Implementation

### How auth.service.ts Calls the API

**File Location:** `frontend/src/services/auth.service.ts`

**Login Flow:**
```typescript
// User calls from LoginView.vue
const response = await authService.login({
  email: "user@example.com",
  password: "password123",
  companyId: 1
});

// Service does:
// 1. POST to /api/auth/login with credentials
// 2. Receives LoginResponse
// 3. Extracts accessToken
// 4. Stores token in localStorage
// 5. Adds to API default headers: Authorization: Bearer {token}
// 6. Returns response to component
// 7. Component redirects to /dashboard

// Error handling:
// If response.status !== 200:
//   - Throws error with message from response
//   - Component displays in error box
//   - User can retry
```

**Register Flow:**
```typescript
// User calls from RegisterView.vue
const response = await authService.register({
  fullName: "Juan Pérez",
  email: "juan@example.com",
  password: "password123",
  companyId: 1
});

// Service does:
// 1. POST to /api/auth/register with user data
// 2. Receives RegisterResponse (user data, NO token)
// 3. Redirects to /login route
// 4. User logs in manually
// 5. Upon login, token is stored and used
```

---

## 🔐 Token Management

### Authorization Header

Once user logs in, all subsequent API requests include:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Automatic Token Injection

The auth service automatically adds the token to all API requests:

```typescript
// In auth.service.ts after login:
api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Now all requests via api.post(), api.get(), etc. include token
// Example:
const response = await api.get("/api/products");
// Automatically includes: Authorization: Bearer {token}
```

### Token Storage

```typescript
// localStorage keys:
localStorage.getItem("auth_token")    // JWT token
localStorage.getItem("auth_user")     // User object JSON

// Token persists across page refreshes
// Logged-in users stay logged in after refresh
```

### Logout

```typescript
authService.logout();
// Removes token from localStorage
// Removes Authorization header from API
// User redirected to /login
```

---

## 📋 Example Backend Implementation (Node.js/Express)

```javascript
// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password, companyId = 1 } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      message: "Email y contraseña requeridos",
      error: "MISSING_FIELDS"
    });
  }

  try {
    // Find user in database
    const user = await User.findOne({
      where: {
        email: email,
        company_id: companyId
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        error: "USER_NOT_FOUND"
      });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Credenciales inválidas",
        error: "INVALID_CREDENTIALS"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: Number(user.id), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return token
    res.json({
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: 86400, // 24 hours in seconds
      user: {
        id: Number(user.id),
        email: user.email,
        fullName: user.full_name
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en servidor",
      error: "SERVER_ERROR"
    });
  }
});

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const { fullName, email, password, companyId = 1 } = req.body;

  // Validate input
  if (!fullName || !email || !password) {
    return res.status(400).json({
      message: "Todos los campos son requeridos",
      error: "MISSING_FIELDS"
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Email inválido",
      error: "INVALID_EMAIL"
    });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        email: email,
        company_id: companyId
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "El correo electrónico ya está registrado",
        error: "EMAIL_ALREADY_EXISTS"
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      full_name: fullName,
      email: email,
      password_hash: passwordHash,
      company_id: companyId,
      is_active: true
    });

    // Return user data (no token - let them login)
    res.status(201).json({
      id: Number(user.id),
      email: user.email,
      fullName: user.full_name,
      companyId: user.company_id,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error al crear la cuenta",
      error: "SERVER_ERROR"
    });
  }
});
```

---

## 🧪 Testing the Integration

### Using cURL

```bash
# Test Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "companyId": 1
  }'

# Expected response:
# {
#   "accessToken": "eyJhbGc...",
#   "tokenType": "Bearer",
#   "expiresIn": 3600
# }

# Test with token
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer eyJhbGc..."
```

### Using Postman

1. Create POST request to `localhost:3000/api/auth/login`
2. Body (JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "companyId": 1
   }
   ```
3. Send and check response
4. Copy token from response
5. Go to Authorization tab → Type: Bearer Token
6. Paste token
7. All subsequent requests in Postman will use token

---

## 🚨 Common Issues & Solutions

### Issue 1: "No response from server"
**Cause:** Backend endpoint not implemented  
**Fix:** Implement /api/auth/login and /api/auth/register endpoints

### Issue 2: "CORS error"
**Cause:** Backend not allowing requests from frontend  
**Fix:** Add CORS headers:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue 3: "Invalid token in Authorization header"
**Cause:** Token format wrong (missing "Bearer " prefix)  
**Fix:** Backend should expect `Authorization: Bearer {token}`  
Frontend already formats correctly in auth.service.ts

### Issue 4: "Email already exists" on new user
**Cause:** Database not clearing, or unique constraint issue  
**Fix:** Check database for existing user, or reset test database

### Issue 5: "Password mismatch" immediately
**Cause:** Hash algorithm mismatch  
**Fix:** Use bcryptjs consistently between frontend and backend

---

## 📊 API Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Login successful | Store token, redirect to dashboard |
| 201 | Registration successful | Redirect to login |
| 400 | Bad request (invalid data) | Show specific error message |
| 401 | Unauthorized (wrong password) | Show "Credenciales inválidas" |
| 404 | Not found (user doesn't exist) | Show "Usuario no encontrado" |
| 409 | Conflict (email exists) | Show "El correo ya está registrado" |
| 500 | Server error | Show "Error en servidor" |

---

## 🔗 Integration Checklist

- [ ] Backend has `/api/auth/login` endpoint
- [ ] Backend has `/api/auth/register` endpoint
- [ ] Both endpoints return correct response format
- [ ] CORS is configured
- [ ] Password hashing with bcryptjs
- [ ] JWT token generation works
- [ ] Email uniqueness per company enforced
- [ ] Database schema matches (users table)
- [ ] Error messages are meaningful
- [ ] Rate limiting implemented (security)
- [ ] Frontend `npm run dev` connects to backend
- [ ] Login flow: Form → API → Token stored → Dashboard
- [ ] Register flow: Form → API → Redirect login → Login flow

---

## 🎯 Next Phase

Once integration is complete:

1. **Protected Routes:**
   - Create router guard for /dashboard
   - Redirect unauthenticated users to /login

2. **User State Management:**
   - Create Pinia store for user
   - Keep user data synced across app

3. **Session Management:**
   - Token refresh before expiration
   - Auto-logout on expiration
   - Remember user preference

4. **Password Reset:**
   - Implement /forgot-password endpoint
   - Email verification flow
   - Reset token generation

---

## 📞 Support

If backend integration issues arise, check:
- Frontend console errors (F12 → Console)
- Network tab (F12 → Network → login request)
- Backend logs
- CORS headers
- Response format matches interface

All expected to be resolved by this documented API contract.

**Ready for integration!** 🚀
