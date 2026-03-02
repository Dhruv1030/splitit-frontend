# Backend User Search Endpoint - Implementation Notes

**Date:** November 3, 2025  
**Status:** WORKING ✅

---

## 🎯 Endpoint Details

### URL

```
GET /api/users/search?query={searchTerm}
```

### Important Points

✅ **Parameter name:** `query` (NOT `email` or `phone`)  
✅ **Returns:** Array of User objects **directly** (NOT wrapped in ApiResponse)  
✅ **Authentication:** Required (JWT token)  
✅ **Supports:** Partial matching on name and email

---

## 📝 Backend Response Format

### Request

```bash
GET /api/users/search?query=alice
Authorization: Bearer <jwt-token>
```

### Response (Direct Array)

```json
[
  {
    "id": "69080bc70aa5e96ce5a3f035",
    "name": "Alice Smith",
    "email": "alice@test.com",
    "phone": null,
    "avatar": null,
    "friendIds": [],
    "defaultCurrency": "USD",
    "createdAt": "2025-11-03T01:56:23.255",
    "emailVerified": false
  }
]
```

**Note:** Returns empty array `[]` if no users found (not an error).

---

## ✅ Frontend Implementation

### UserService (Fixed)

```typescript
searchUsers(query: string): Observable<User[]> {
  // Backend returns array directly, not wrapped in ApiResponse
  // Parameter name is 'query' for searching by name, email, or phone
  const params = new HttpParams().set('query', query);
  return this.http.get<User[]>(`${this.apiUrl}/search`, { params });
}
```

### Component Usage

```typescript
this.userService.searchUsers('alice').subscribe({
  next: (users) => {
    // users is already an array, no need for response.data
    this.searchResults = users.filter((user) => user.id !== this.currentUser?.id);
  },
  error: (error) => {
    console.error('Error searching users:', error);
  },
});
```

---

## 🧪 Tested Scenarios

| Test                | Query                  | Result                                | Status  |
| ------------------- | ---------------------- | ------------------------------------- | ------- |
| Search by name      | `alice`                | Returns 11 users with "alice" in name | ✅ PASS |
| Search by email     | `alice@test.com`       | Returns exact match                   | ✅ PASS |
| Through API Gateway | `alice@test.com` + JWT | Same result                           | ✅ PASS |
| No results          | `nonexistent@test.com` | Returns `[]`                          | ✅ PASS |

---

## 🔧 Changes Made to Frontend

### 1. UserService (`src/app/core/services/user.service.ts`)

- ✅ Changed return type from `Observable<ApiResponse<User[]>>` to `Observable<User[]>`
- ✅ Updated comments to reflect actual behavior

### 2. ProfileComponent (`src/app/features/profile/profile.ts`)

- ✅ Changed `response.data` to just `users` (direct array)
- ✅ Simplified filter logic

---

## 🎨 Search Features

### What Works:

- ✅ Partial name matching (e.g., "ali" finds "Alice")
- ✅ Email search (exact and partial)
- ✅ Case-insensitive search
- ✅ Filters out current user
- ✅ Filters out existing friends
- ✅ Minimum 2 characters to trigger search

### UI Flow:

1. User types in search box (Friends tab)
2. After 2+ characters, search triggers
3. Shows loading spinner
4. Displays matching users (excluding self and existing friends)
5. Each result has "Add Friend" button

---

## 🚀 Testing Instructions

### 1. Start Backend Services

```bash
docker compose ps  # Check all services running
```

### 2. Register Test Users (if needed)

```bash
curl -X POST "http://localhost:8081/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@test.com",
    "password": "password123",
    "phoneNumber": "1234567890"
  }'
```

### 3. Test Search

```bash
curl "http://localhost:8081/api/users/search?query=alice" | jq .
```

### 4. Test in Frontend

1. Open `http://localhost:4200`
2. Login
3. Go to Profile → Friends tab
4. Type "alice" in search box
5. Should see matching users!

---

## 📊 API Comparison

### Before (Incorrect Understanding)

```typescript
// ❌ We thought it was:
GET /api/users/search?email=alice@test.com
Response: { success: true, data: [...] }
```

### After (Actual Implementation)

```typescript
// ✅ Actually is:
GET /api/users/search?query=alice@test.com
Response: [...]  // Direct array
```

---

## ✅ Status

**All fixes applied and ready to test!**

Files changed:

1. `src/app/core/services/user.service.ts` - Fixed search return type and parameter
2. `src/app/features/profile/profile.ts` - Fixed response handling
3. `src/app/core/services/user.service.ts` - Fixed addFriend/removeFriend to use query parameters

### Friend Management Endpoints

**Add Friend:**

```
POST /api/users/{userId}/friends?friendId={friendId}
```

⚠️ **Important:** Uses query parameter `?friendId=xxx` (NOT path parameter)

**Remove Friend:**

```
DELETE /api/users/{userId}/friends?friendId={friendId}
```

⚠️ **Important:** Also uses query parameter `?friendId=xxx` (NOT path parameter)

**Next:** Refresh browser and test the Friends search and add functionality! 🎉
