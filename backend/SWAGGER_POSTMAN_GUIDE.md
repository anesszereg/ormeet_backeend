# Swagger & Postman Setup Guide

## 🚀 Quick Start

### Option 1: Swagger UI (Recommended for Quick Testing)

1. **Start the server:**
   ```bash
   npm run start:dev
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:3000/api/docs
   ```

3. **Test the API:**
   - Register a user via `/auth/register`
   - Copy the JWT token from the response
   - Click "Authorize" button (top right)
   - Paste token and click "Authorize"
   - Now you can test all authenticated endpoints!

### Option 2: Postman (Recommended for Development)

1. **Import Collection:**
   - Open Postman
   - Click "Import"
   - Select `postman/Event-Organization-Platform.postman_collection.json`

2. **Import Environment:**
   - Click "Import"
   - Select `postman/Event-Organization-Platform.postman_environment.json`

3. **Select Environment:**
   - Top-right dropdown → Select "Event Organization Platform - Development"

4. **Start Testing:**
   - Run "Register User" or "Login" first
   - JWT token is automatically saved!
   - All other requests will use the token automatically

## 📚 Swagger Documentation Features

### What's Included

✅ **Interactive API Testing**
- Test all endpoints directly in the browser
- No need for external tools
- Real-time request/response

✅ **Authentication**
- Bearer token authentication
- Persistent authorization across requests
- Easy token management

✅ **Comprehensive Documentation**
- Request/response schemas
- Example values
- Field descriptions
- Validation rules

✅ **Organized by Tags**
- Authentication
- Events
- Organizations (future)
- Venues (future)
- Tickets (future)
- Orders (future)

### Swagger Endpoints

- **UI**: `http://localhost:3000/api/docs`
- **JSON**: `http://localhost:3000/api/docs-json`
- **YAML**: `http://localhost:3000/api/docs-yaml`

### Swagger Configuration

Located in `src/main.ts`:
```typescript
const config = new DocumentBuilder()
  .setTitle('Event Organization Platform API')
  .setDescription('Comprehensive API for managing events...')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
```

## 📮 Postman Collection Features

### What's Included

✅ **Pre-configured Requests**
- All endpoints ready to use
- Proper headers set
- Example request bodies

✅ **Automatic Token Management**
- JWT token auto-saved after login/register
- Automatically added to authenticated requests
- No manual token copying!

✅ **Environment Variables**
- `base_url`: API base URL
- `jwt_token`: Authentication token (auto-saved)
- `user_id`: Current user ID (auto-saved)
- `event_id`: Last created event (auto-saved)
- `organization_id`: Organization ID

✅ **Smart Scripts**
- Auto-save tokens after authentication
- Auto-save IDs after creation
- Console logging for debugging

### Collection Structure

```
Event Organization Platform API
├── Authentication
│   ├── Register User (auto-saves token & user_id)
│   └── Login (auto-saves token & user_id)
└── Events
    ├── Create Event (auto-saves event_id)
    ├── Get All Events
    ├── Get Events by Status
    ├── Get Events by Category
    ├── Get Event by ID
    ├── Update Event
    ├── Publish Event
    ├── Cancel Event
    ├── Increment View Count
    ├── Add to Favorites
    └── Delete Event
```

## 🔐 Authentication Flow

### Using Swagger

1. **Register/Login:**
   - Expand `/auth/register` or `/auth/login`
   - Click "Try it out"
   - Fill in the request body
   - Click "Execute"
   - Copy the `token` from the response

2. **Authorize:**
   - Click "Authorize" button (🔒 icon)
   - Enter: `Bearer your-token-here`
   - Click "Authorize"
   - Click "Close"

3. **Make Authenticated Requests:**
   - All protected endpoints now work
   - Token is automatically included

### Using Postman

1. **Register/Login:**
   - Run "Register User" or "Login" request
   - Token is automatically saved! ✨

2. **Make Authenticated Requests:**
   - Just run any other request
   - Token is automatically included
   - No manual work needed!

## 📝 Example Workflows

### Workflow 1: Create and Publish an Event

**Swagger:**
1. Register/Login → Get token
2. Authorize with token
3. POST `/events` → Create event
4. Copy event ID from response
5. POST `/events/{id}/publish` → Publish event

**Postman:**
1. Run "Register User" (token auto-saved)
2. Edit "Create Event" request body
3. Run "Create Event" (event_id auto-saved)
4. Run "Publish Event" (uses saved event_id)

### Workflow 2: Browse and Filter Events

**Swagger:**
1. GET `/events` → See all events
2. GET `/events?status=published` → Filter by status
3. GET `/events/{id}` → Get specific event

**Postman:**
1. Run "Get All Events"
2. Run "Get Events by Status"
3. Run "Get Event by ID"

### Workflow 3: Update Event Details

**Swagger:**
1. Ensure you're authenticated
2. PATCH `/events/{id}` → Update event
3. Provide event ID and update fields

**Postman:**
1. Run "Update Event"
2. Modify request body as needed
3. Uses saved event_id automatically

## 🎯 Testing Tips

### Swagger Tips

1. **Use the "Try it out" button** for instant testing
2. **Check response schemas** to understand data structure
3. **Use example values** as templates
4. **Export OpenAPI spec** for other tools
5. **Persistent authorization** - token stays active during session

### Postman Tips

1. **Use environments** for different setups (dev, staging, prod)
2. **Check console** for auto-saved variables
3. **Use variables** in URLs: `{{base_url}}/events/{{event_id}}`
4. **Run collections** for automated testing
5. **Share collections** with your team

## 🔧 Customization

### Adding New Endpoints to Swagger

1. **Add decorators to controller:**
```typescript
@ApiTags('YourModule')
@Controller('your-module')
export class YourController {
  @Post()
  @ApiOperation({ summary: 'Create item' })
  @ApiResponse({ status: 201, description: 'Created' })
  create(@Body() dto: CreateDto) {
    // ...
  }
}
```

2. **Add decorators to DTOs:**
```typescript
export class CreateDto {
  @ApiProperty({ example: 'Example value' })
  @IsString()
  field: string;
}
```

### Adding Endpoints to Postman

1. **Duplicate existing request**
2. **Update URL and method**
3. **Modify request body**
4. **Add test scripts if needed:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set('item_id', response.id);
}
```

## 📊 Comparison

| Feature | Swagger UI | Postman |
|---------|-----------|---------|
| **Setup** | Zero setup | Import files |
| **Testing** | Browser-based | Desktop app |
| **Auth** | Manual token entry | Auto-saved |
| **Variables** | No | Yes |
| **Sharing** | URL only | Export/Import |
| **Automation** | No | Yes (Collections) |
| **Documentation** | Excellent | Good |
| **Best For** | Quick testing, Documentation | Development, Team work |

## 🚨 Common Issues

### Swagger Issues

**Issue: "Authorize" button not working**
- Make sure to include "Bearer " before the token
- Check token hasn't expired (default: 7 days)

**Issue: 401 Unauthorized**
- Click "Authorize" button first
- Verify token is correct
- Re-login if token expired

### Postman Issues

**Issue: Token not auto-saving**
- Check the "Tests" tab in the request
- Verify environment is selected
- Check console for errors

**Issue: Variables not working**
- Ensure environment is selected (top-right)
- Check variable names match: `{{jwt_token}}`
- Verify variables are set in environment

**Issue: 401 Unauthorized**
- Run "Login" request first
- Check token is saved: View → Show Postman Console
- Verify "Authorization" header is set to "Inherit from parent"

## 📖 Additional Resources

- **Swagger/OpenAPI**: https://swagger.io/docs/
- **NestJS Swagger**: https://docs.nestjs.com/openapi/introduction
- **Postman Docs**: https://learning.postman.com/
- **JWT.io**: https://jwt.io/ (decode tokens)

## 🎓 Next Steps

1. ✅ Test all authentication endpoints
2. ✅ Create and manage events
3. ⏭️ Add more modules (Organizations, Venues, etc.)
4. ⏭️ Update Postman collection with new endpoints
5. ⏭️ Share collection with team
6. ⏭️ Set up automated tests in Postman

---

**Happy Testing! 🚀**
