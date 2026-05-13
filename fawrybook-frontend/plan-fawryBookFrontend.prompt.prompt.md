# Plan: Simple Angular Frontend for FawryBook Blog Platform

Build a minimal Angular frontend that connects to the existing Spring Boot backend. All API integration points will be marked as TODO for later backend integration.

**Steps**

**Phase 1: Project Setup**
1. Create new Angular 16+ project with routing and standalone components using Angular CLI
2. Install dependencies: Bootstrap for styling
3. Configure environment files with backend API URL placeholder (`http://localhost:8080/api`)

**Phase 2: Core Infrastructure** (*parallel with Phase 3*)
4. Create auth service with JWT token storage (localStorage) and TODO methods: `login()`, `register()`, `logout()`, `isAuthenticated()`
5. Create auth guard to protect routes requiring authentication
6. Create HTTP interceptor to attach JWT token to outgoing requests

**Phase 3: Shared Components & Models** (*parallel with Phase 2*)
7. Define TypeScript interfaces matching backend DTOs: `User`, `Post`, `Comment`, `Reaction`, `AuthResponse`, etc.
8. Create reusable components: navbar with login/logout, loading spinner, error message display

**Phase 4: Authentication Pages**
9. Create login component with reactive form (email, password) and TODO submit handler
10. Create register component with reactive form (firstName, lastName, email, password, country) and TODO submit handler

**Phase 5: Blog Post Features**
11. Create post-list component (home feed) with TODO method to fetch all posts
12. Create post-detail component showing full post, reactions, comments, with TODO methods to fetch post and comments
13. Create post-form component (reused for create/edit) with TODO methods: `createPost()`, `updatePost()`
14. Add delete confirmation dialog and TODO `deletePost()` method

**Phase 6: Social Interaction Features**
15. Create comment-list component with TODO `fetchComments()` and pagination support
16. Create add-comment form with TODO `addComment()` method
17. Add like/dislike buttons to post cards with TODO `reactToPost()` method
18. Display reaction counts (likes, dislikes) and rating on each post

**Phase 7: User Profile**
19. Create user-profile component showing user info with TODO `getUserProfile()` method
20. Add edit profile form with TODO `updateProfile()` method *(optional, can skip for simplicity)*

**Phase 8: Routing & Navigation**
21. Configure routes: `/login`, `/register`, `/` (home), `/posts/:id`, `/create-post`, `/edit-post/:id`, `/profile`
22. Add navigation guards to protect authenticated routes (create-post, edit-post, profile)
23. Implement routing navigation in navbar and components

**Phase 9: Polish & Documentation**
24. Add basic responsive CSS styling using Bootstrap classes
25. Create README with setup instructions and TODO list for API integration
26. Test navigation flow and UI components (without backend)

**Relevant Files**

Angular Project Structure (26 files):
- core/services/auth.service.ts — login, register, logout with TODO placeholders
- core/services/post.service.ts — CRUD operations with TODO placeholders
- core/services/comment.service.ts — add, fetch comments with TODO
- core/services/reaction.service.ts — like/dislike with TODO
- core/guards/auth.guard.ts — protect authenticated routes
- core/interceptors/jwt.interceptor.ts — attach JWT to requests
- core/models/index.ts — TypeScript interfaces matching backend DTOs
- features/auth/login/login.component.ts — login form with validation
- features/auth/register/register.component.ts — registration form
- features/posts/post-list/post-list.component.ts — home feed display
- features/posts/post-detail/post-detail.component.ts — single post view
- features/posts/post-form/post-form.component.ts — create/edit post
- shared/components/navbar/navbar.component.ts — navigation with auth status
- app.routes.ts — routing configuration
- environments/environment.ts — API URL configuration
- README.md — setup instructions and TODO checklist

**Verification**

1. Run `ng serve` and navigate to `http://localhost:4200` successfully
2. Click through all routes (login, register, home, create post, profile) without errors
3. Verify forms have proper validation (required fields, email format)
4. Check that auth guard redirects unauthenticated users from protected routes to login
5. Inspect browser console for TODO comments in service methods
6. Test responsive design on mobile viewport (320px width)
7. Confirm TypeScript interfaces match backend DTO structure (LoginRequest, RegisterRequest, PostRequest, etc.)

**Decisions**

- **Standalone components**: Using Angular 16+ standalone components (no NgModule) for simplicity
- **Styling**: Bootstrap CSS classes for quick, clean UI without complex custom styling
- **State management**: No NgRx/state library — services and component state only
- **API calls**: All HTTP methods marked with `// TODO: Implement API call to POST /api/auth/login` style comments
- **Reactive forms**: Using reactive forms for better validation and type safety
- **Mock data**: Services return empty/null with console logs showing TODO instead of hardcoded mock data
- **Excluded scope**: Twitter sharing, advanced profile editing, admin features

**Further Considerations**

1. **Mock data strategy**: Should services return minimal hardcoded data to test the UI rendering, or just return empty arrays/null? *Recommend minimal mock data (2-3 sample posts) to verify UI components display correctly*
2. **Error handling**: Should we add error message components now or mark as TODO? *Recommend basic error div that displays service error messages for better UX*
3. **Profile features**: Include full profile edit or just view-only profile page? *Recommend view-only for simplicity unless user needs edit*
