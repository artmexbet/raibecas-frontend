# API Quick Reference Guide

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication Flow

### 1. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@raibecas.kz",
  "password": "SecurePassword123!",
  "deviceId": "device-12345" // optional
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@raibecas.kz",
    "username": "admin",
    "role": "super_admin",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Cookies set automatically:**
- `refresh_token` (HttpOnly)
- `token_id` (HttpOnly)
- `fingerprint` (HttpOnly)

### 2. Use Access Token
```http
GET /documents
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Refresh Token (when access token expires)
```http
POST /auth/refresh
Authorization: Bearer <expired-token>
Content-Type: application/json
Cookie: refresh_token=...; token_id=...; fingerprint=...

{
  "deviceId": "device-12345" // optional
}
```

**Response:** Same as login response with new tokens

### 4. Logout
```http
POST /auth/logout
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Logout from All Devices
```http
POST /auth/logout-all
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Documents

### List Documents
```http
GET /documents?page=1&limit=20&search=Кант&authorId=550e8400-e29b-41d4-a716-446655440000&categoryId=1&tagId=1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "documents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Критика чистого разума",
      "description": "Важнейший труд Иммануила Канта",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Иммануил Кант"
      },
      "category": {
        "id": 1,
        "title": "Метафизика"
      },
      "publicationDate": "1781-01-01T00:00:00Z",
      "tags": [
        { "id": 1, "title": "философия" },
        { "id": 2, "title": "эпистемология" }
      ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T14:30:00Z"
    }
  ],
  "total": 147,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

### Get Document by ID
```http
GET /documents/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "document": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Критика чистого разума",
    // ... full document data
  }
}
```

### Create Document
```http
POST /documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Критика чистого разума",
  "description": "Важнейший труд Иммануила Канта",
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "categoryId": 1,
  "publicationDate": "1781-01-01T00:00:00Z",
  "tagIds": [1, 2, 3]
}
```

**Response (201):**
```json
{
  "document": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    // ... full document data
  }
}
```

### Update Document (Partial)
```http
PATCH /documents/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Критика чистого разума (исправленное издание)",
  "description": "Обновленное описание"
  // All fields are optional
}
```

**Response (200):**
```json
{
  "document": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    // ... updated document data
  }
}
```

### Delete Document
```http
DELETE /documents/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response:** 204 No Content

## Users

### List Users
```http
GET /users?page=1&page_size=10&search=ivan&is_active=true
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "ivan.ivanov@example.com",
      "username": "ivan_ivanov",
      "fullName": "Иван Иванов",
      "registeredAt": "2024-01-10T12:00:00Z",
      "lastLoginAt": "2024-04-15T08:30:00Z",
      "isActive": true
    }
  ],
  "total_count": 89,
  "page": 1,
  "page_size": 10
}
```

### Get User by ID
```http
GET /users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    // ... user data
  }
}
```

### Update User (Partial)
```http
PATCH /users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "new.email@example.com",
  "username": "new_username",
  "fullName": "Новое Имя",
  "isActive": false
  // All fields are optional
}
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    // ... updated user data
  }
}
```

### Delete User
```http
DELETE /users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Registration Requests

### Create Registration Request (Public)
```http
POST /registration-requests
Content-Type: application/json

{
  "username": "new_user",
  "email": "new.user@example.com",
  "password": "SecurePassword123!",
  "metadata": {
    "reason": "Интересуюсь философией"
  }
}
```

**Response (201):**
```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Registration request created successfully"
}
```

### List Registration Requests
```http
GET /registration-requests?page=1&page_size=10&status=pending
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "requests": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "new_user",
      "email": "new.user@example.com",
      "status": "pending",
      "metadata": {
        "reason": "Интересуюсь философией"
      },
      "created_at": "2024-04-01T10:00:00Z",
      "updated_at": "2024-04-01T10:00:00Z",
      "approved_by": null,
      "approved_at": null
    }
  ],
  "total_count": 5,
  "page": 1,
  "page_size": 10
}
```

### Approve Registration Request
```http
POST /registration-requests/550e8400-e29b-41d4-a716-446655440000/approve
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Registration request approved successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    // ... new user data
  }
}
```

### Reject Registration Request
```http
POST /registration-requests/550e8400-e29b-41d4-a716-446655440000/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Недостаточно информации в заявке"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Registration request rejected successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "validation_error",
  "message": "Invalid request data",
  "details": {
    "email": "invalid email format",
    "password": "must be at least 8 characters"
  }
}
```

### Common Error Codes:
- `bad_request` - Invalid request format (400)
- `unauthorized` - Authentication required or invalid credentials (401)
- `validation_error` - Request validation failed (400)
- `not_found` - Resource not found (404)
- `internal_error` - Server error (500)

## Common HTTP Status Codes

- **200 OK** - Successful GET, PATCH, or action
- **201 Created** - Successful POST (resource created)
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required or invalid
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

## Tips

### Working with Dates
All dates are in ISO 8601 format: `2024-01-15T10:00:00Z`

### Working with UUIDs
UUIDs are in standard format: `550e8400-e29b-41d4-a716-446655440000`

### Pagination
- Documents use: `page` and `limit` (default: 1, 20)
- Users and Registration Requests use: `page` and `page_size` (default: 1, 10)

### Partial Updates
Use PATCH for partial updates. All fields are optional. Only send the fields you want to update.

### Authorization Header
Always include the Authorization header for protected endpoints:
```
Authorization: Bearer <your-access-token>
```

### Cookies
The API uses HttpOnly cookies for refresh tokens. Make sure your HTTP client supports cookies and sends them automatically with requests.
