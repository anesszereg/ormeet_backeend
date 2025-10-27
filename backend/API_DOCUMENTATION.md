# API Documentation Guide

## Swagger Documentation

### Accessing Swagger UI

Once the application is running, you can access the interactive Swagger documentation at:

```
http://localhost:3000/api/docs
```

### Features

- **Interactive API Testing**: Test all endpoints directly from the browser
- **Authentication**: Use the "Authorize" button to add your JWT token
- **Request/Response Examples**: See example payloads for all endpoints
- **Schema Documentation**: View all DTOs and entity structures
- **Try It Out**: Execute API calls and see real responses

### Using Swagger UI

1. **Start the Application**
   ```bash
   npm run start:dev
   ```

2. **Open Swagger UI**
   - Navigate to `http://localhost:3000/api/docs`

3. **Authenticate**
   - First, register or login using the Authentication endpoints
   - Copy the JWT token from the response
   - Click the "Authorize" button at the top right
   - Paste the token in the format: `Bearer your-token-here`
   - Click "Authorize" and then "Close"

4. **Test Endpoints**
   - Expand any endpoint
   - Click "Try it out"
   - Fill in the required parameters
   - Click "Execute"
   - View the response below

### Swagger Configuration

The Swagger setup includes:
- Bearer authentication (JWT)
- Organized by tags (Authentication, Events, etc.)
- Detailed request/response schemas
- Example values for all fields
- HTTP status code documentation

## Postman Collection

### Importing the Collection

1. **Open Postman**

2. **Import Collection**
   - Click "Import" button
   - Select the file: `postman/Event-Organization-Platform.postman_collection.json`
   - Click "Import"

3. **Import Environment**
   - Click "Import" button
   - Select the file: `postman/Event-Organization-Platform.postman_environment.json`
   - Click "Import"

4. **Select Environment**
   - In the top-right corner, select "Event Organization Platform - Development"

### Using the Postman Collection

#### 1. Authentication Flow

**Register a User:**
```
POST /auth/register
```
- The JWT token will be automatically saved to the environment variable
- No manual token copying needed!

**Login:**
```
POST /auth/login
```
- The JWT token will be automatically saved
- User ID will also be saved for future requests

#### 2. Create an Event

Before creating an event, you need an organization ID:
- Either create an organization first (when that module is implemented)
- Or manually set the `organization_id` environment variable

**Create Event:**
```
POST /events
```
- Requires authentication (token is automatically added)
- Event ID will be saved to environment variables

#### 3. Test Other Endpoints

All endpoints are pre-configured with:
- Automatic JWT token injection
- Environment variables for IDs
- Example request bodies
- Proper headers

### Environment Variables

The collection uses these variables:
- `base_url`: API base URL (default: http://localhost:3000)
- `jwt_token`: JWT authentication token (auto-saved after login)
- `user_id`: Current user ID (auto-saved after login)
- `event_id`: Last created event ID (auto-saved)
- `organization_id`: Organization ID (manual or auto-saved)
- `venue_id`: Venue ID (for future use)
- `ticket_type_id`: Ticket type ID (for future use)
- `order_id`: Order ID (for future use)
- `ticket_id`: Ticket ID (for future use)

### Postman Scripts

The collection includes automatic scripts:

**After Registration/Login:**
```javascript
// Automatically saves JWT token and user ID
if (pm.response.code === 201 || pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('jwt_token', response.token);
    pm.collectionVariables.set('user_id', response.user.id);
}
```

**After Creating an Event:**
```javascript
// Automatically saves event ID
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set('event_id', response.id);
}
```

## API Endpoints Overview

### Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login with credentials |

### Events

| Method | Endpoint | Auth Required | Roles | Description |
|--------|----------|---------------|-------|-------------|
| POST | `/events` | Yes | Organizer, Admin | Create new event |
| GET | `/events` | No | - | Get all events |
| GET | `/events/:id` | No | - | Get event by ID |
| PATCH | `/events/:id` | Yes | Organizer, Admin | Update event |
| DELETE | `/events/:id` | Yes | Organizer, Admin | Delete event |
| POST | `/events/:id/publish` | Yes | Organizer, Admin | Publish event |
| POST | `/events/:id/cancel` | Yes | Organizer, Admin | Cancel event |
| POST | `/events/:id/view` | No | - | Increment view count |
| POST | `/events/:id/favorite` | Yes | Any | Add to favorites |

### Query Parameters

**Get Events:**
- `status`: Filter by event status (draft, published, cancelled)
- `category`: Filter by category
- `organizerId`: Filter by organizer

## Example Requests

### 1. Register a User

**Request:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "roles": ["organizer"]
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["organizer"],
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

**Request:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Create an Event

**Request:**
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Tech Conference 2025",
    "shortDescription": "Annual technology conference",
    "organizerId": "org-uuid",
    "startAt": "2025-06-15T09:00:00Z",
    "endAt": "2025-06-15T18:00:00Z",
    "capacity": 500
  }'
```

### 4. Get All Events

**Request:**
```bash
curl http://localhost:3000/events
```

### 5. Filter Events by Status

**Request:**
```bash
curl "http://localhost:3000/events?status=published"
```

### 6. Publish an Event

**Request:**
```bash
curl -X POST http://localhost:3000/events/{event-id}/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Authentication

### JWT Token Format

The API uses Bearer token authentication:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "roles": ["organizer"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Token Expiration

- Default: 7 days
- Configurable via `JWT_EXPIRATION` environment variable

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Event with ID {id} not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email already exists"
}
```

## Best Practices

### 1. Always Use HTTPS in Production
```
https://api.yourdomain.com
```

### 2. Store Tokens Securely
- Never commit tokens to version control
- Use environment variables
- Implement token refresh mechanism

### 3. Handle Errors Gracefully
```javascript
try {
  const response = await fetch('/api/events');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  console.error('Error fetching events:', error);
}
```

### 4. Validate Input
- All DTOs have validation decorators
- Use the validation pipe globally
- Check Swagger for required fields

### 5. Rate Limiting
- Implement rate limiting in production
- Use Redis for distributed rate limiting
- Set appropriate limits per endpoint

## Testing with Different Tools

### cURL
```bash
# Set token as variable
TOKEN="your-jwt-token"

# Make authenticated request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/events
```

### HTTPie
```bash
# Install: brew install httpie

# Register
http POST localhost:3000/auth/register \
  name="John Doe" \
  email="john@example.com" \
  password="password123"

# Login
http POST localhost:3000/auth/login \
  email="john@example.com" \
  password="password123"

# Get events
http GET localhost:3000/events
```

### JavaScript/Fetch
```javascript
// Register
const response = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});
const { token } = await response.json();

// Get events with auth
const events = await fetch('http://localhost:3000/events', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Swagger Export

You can export the Swagger documentation:

1. **JSON Format**
   ```
   http://localhost:3000/api/docs-json
   ```

2. **YAML Format**
   ```
   http://localhost:3000/api/docs-yaml
   ```

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [Postman Learning Center](https://learning.postman.com/)
- [JWT.io](https://jwt.io/)

## Support

For issues or questions:
1. Check the Swagger documentation
2. Review the Postman collection examples
3. Check the project README.md
4. Review the QUICK_START.md guide
