# API Integration Checklist

This document provides a step-by-step guide for integrating the FawryBook Angular frontend with the Spring Boot backend.

## Prerequisites

- [ ] Spring Boot backend running at `http://localhost:8080`
- [ ] Backend CORS configured to allow `http://localhost:4200`
- [ ] All backend endpoints tested and working

## Integration Steps

### 1. Authentication Service

**File**: `src/app/core/services/auth.service.ts`

#### Login Method (Line ~115)
- [ ] Uncomment the actual API call
- [ ] Comment out/remove mock setTimeout() code
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Verify JWT token stored in localStorage
- [ ] Verify user redirected to home page

```typescript
// BEFORE (mock):
setTimeout(() => { ... }, 500);

// AFTER (real):
return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
  .pipe(tap(response => { ... }));
```

#### Register Method (Line ~85)
- [ ] Uncomment the actual API call
- [ ] Comment out/remove throw error line
- [ ] Test registration with valid data
- [ ] Test validation errors
- [ ] Verify user auto-logged in after registration

### 2. Post Service

**File**: `src/app/core/services/post.service.ts`

#### Get All Posts (Line ~65)
- [ ] Uncomment the actual API call
- [ ] Remove mock return statement
- [ ] Test pagination (page=0, size=10)
- [ ] Verify PaginatedResponse structure matches backend
- [ ] Test "Load More" functionality

#### Get Post By ID (Line ~100)
- [ ] Uncomment the actual API call
- [ ] Remove mock return statement
- [ ] Test with valid post ID
- [ ] Test with invalid post ID (404 handling)

#### Create Post (Line ~125)
- [ ] Uncomment the actual API call
- [ ] Remove mock return statement
- [ ] Test creating post with title, content, tags
- [ ] Verify navigation to new post detail page
- [ ] Check post appears in feed

#### Update Post (Line ~150)
- [ ] Uncomment the actual API call
- [ ] Remove mock return statement
- [ ] Test editing existing post
- [ ] Verify only owner can edit (backend validation)
- [ ] Check updated post displays correctly

#### Delete Post (Line ~175)
- [ ] Uncomment the actual API call
- [ ] Remove mock return statement
- [ ] Test deletion with confirmation
- [ ] Verify only owner can delete
- [ ] Check post removed from feed

### 3. Comment Service

**File**: `src/app/core/services/comment.service.ts`

#### Add Comment (Line ~50)
- [ ] Uncomment the actual API call
- [ ] Remove mock return statement
- [ ] Test adding comment to post
- [ ] Verify comment appears in list immediately
- [ ] Check comment count incremented

#### Get Comments By Post ID (Line ~75)
- [ ] Uncomment the actual API call
- [ ] Remove mock return statement
- [ ] Test pagination
- [ ] Verify comments sorted by date (newest first)

### 4. Reaction Service

**File**: `src/app/core/services/reaction.service.ts`

#### React To Post (Line ~50)
- [ ] Uncomment the actual API call
- [ ] Remove mock return statement
- [ ] Test liking a post
- [ ] Test disliking a post
- [ ] Test toggling reaction (like → dislike)
- [ ] Test removing reaction (same type clicked twice)
- [ ] Verify counts update correctly

### 5. Component Updates

#### Post List Component
**File**: `src/app/features/posts/post-list/post-list.component.ts`

- [ ] Remove mock data (lines 147-195)
- [ ] Uncomment actual service call (line 122)
- [ ] Test empty state (no posts)
- [ ] Test pagination
- [ ] Verify like/dislike buttons work

#### Post Detail Component
**File**: `src/app/features/posts/post-detail/post-detail.component.ts`

- [ ] Remove mock post data (lines 130-165)
- [ ] Remove mock comments data (lines 230-250)
- [ ] Remove mock comment submission (lines 300-320)
- [ ] Uncomment actual service calls
- [ ] Test full post view
- [ ] Test adding comments
- [ ] Test reactions

#### User Profile Component
**File**: `src/app/features/profile/user-profile.component.ts`

- [ ] Create UserService if not exists
- [ ] Implement getUserById() method
- [ ] Remove mock profile data (lines 120-135)
- [ ] Uncomment actual service call
- [ ] Test profile loading
- [ ] Add userId to AuthResponse (backend change may be needed)

### 6. Error Handling

- [ ] Test network errors (disconnect internet)
- [ ] Test 401 Unauthorized (expired token)
- [ ] Test 403 Forbidden (wrong permissions)
- [ ] Test 404 Not Found (invalid IDs)
- [ ] Test 500 Server Error
- [ ] Verify error messages display correctly
- [ ] Check console for unexpected errors

### 7. Authentication Flow

- [ ] Test full login flow
- [ ] Test JWT token attached to requests (check Network tab)
- [ ] Test token persistence across page refresh
- [ ] Test logout clears token
- [ ] Test auth guard redirects to login
- [ ] Test already-logged-in redirects from login page

### 8. Edge Cases

- [ ] Test with empty database (no posts, no users)
- [ ] Test creating post with very long content
- [ ] Test creating post with special characters
- [ ] Test pagination at boundaries (last page)
- [ ] Test commenting on deleted post
- [ ] Test editing post that was deleted
- [ ] Test simultaneous reactions from multiple users

### 9. Production Preparation

- [ ] Update `environment.prod.ts` with production API URL
- [ ] Test production build: `ng build --configuration production`
- [ ] Verify no console errors in production mode
- [ ] Check bundle size (should be < 1MB)
- [ ] Test on different browsers (Chrome, Firefox, Edge)
- [ ] Test on mobile devices
- [ ] Configure proper CORS on production backend

### 10. Final Verification

- [ ] All TODO comments removed or addressed
- [ ] No mock data remains in code
- [ ] All features tested end-to-end
- [ ] Error handling tested
- [ ] Loading states display correctly
- [ ] Form validations work
- [ ] Navigation works smoothly
- [ ] No console errors or warnings

## Common Integration Issues

### Issue: CORS Error
**Symptom**: `Access to XMLHttpRequest blocked by CORS policy`
**Solution**: 
```java
// In Spring Boot backend
@CrossOrigin(origins = "http://localhost:4200")
```

### Issue: 401 Unauthorized on protected endpoints
**Symptom**: Request fails even though user is logged in
**Solution**: 
- Verify JWT token in localStorage
- Check Authorization header in Network tab
- Ensure interceptor is configured in app.config.ts
- Verify backend JWT validation

### Issue: DTO Mismatch
**Symptom**: Data doesn't display correctly or TypeScript errors
**Solution**:
- Compare frontend interfaces with backend DTOs
- Check property names (camelCase vs snake_case)
- Verify date format handling

### Issue: Pagination Not Working
**Symptom**: "Load More" doesn't work or shows wrong data
**Solution**:
- Verify backend returns Spring Boot Page structure
- Check page number (0-indexed vs 1-indexed)
- Ensure `totalPages`, `last` flags are correct

## Testing Checklist

Create a test account and verify:

1. **As Anonymous User:**
   - [ ] Can view post list
   - [ ] Can view post details
   - [ ] Cannot create posts (redirected to login)
   - [ ] Cannot react to posts
   - [ ] Cannot comment on posts

2. **As Logged-In User:**
   - [ ] Can create posts
   - [ ] Can edit own posts
   - [ ] Can delete own posts
   - [ ] Cannot edit others' posts
   - [ ] Can react to any post
   - [ ] Can comment on any post
   - [ ] Can view own profile

3. **Data Persistence:**
   - [ ] Created posts appear in feed
   - [ ] Edited posts show updated content
   - [ ] Deleted posts removed from feed
   - [ ] Comments persist across page refresh
   - [ ] Reactions persist across page refresh
   - [ ] Login persists across page refresh

## Success Criteria

✅ All API calls return real data from backend
✅ No mock data or TODO comments remain
✅ All features work end-to-end
✅ Error handling works gracefully
✅ No console errors or warnings
✅ Application ready for production deployment

---

**Last Updated**: May 13, 2026
**Status**: Ready for backend integration
