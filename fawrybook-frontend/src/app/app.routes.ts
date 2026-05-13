import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PostListComponent } from './features/posts/post-list/post-list.component';
import { PostDetailComponent } from './features/posts/post-detail/post-detail.component';
import { PostFormComponent } from './features/posts/post-form/post-form.component';
import { UserProfileComponent } from './features/profile/user-profile.component';
import { canActivate, canActivatePublicOnly } from './core/guards/auth.guard';

/**
 * Application Routes
 * 
 * Defines all routes in the application
 * Angular Router matches URLs to components
 * 
 * Route structure:
 * - path: URL segment (e.g., 'login' matches /login)
 * - component: component to load into <router-outlet>
 * - canActivate: guards that run before navigation
 * 
 * How routing works:
 * 1. User navigates to /login
 * 2. Router finds matching route (path: 'login')
 * 3. Runs canActivate guards (if any)
 * 4. If guards allow, loads component
 * 5. Component appears in <router-outlet>
 * 
 * Why standalone components work:
 * - No need to declare components in NgModule
 * - Just import and reference directly in routes
 * - Cleaner and simpler
 */
export const routes: Routes = [
  /**
   * Login route
   * 
   * URL: /login
   * Component: LoginComponent
   * Guard: canActivatePublicOnly
   * 
   * What happens:
   * - If user is NOT logged in: shows login page (normal behavior)
   * - If user IS logged in: guard redirects to home page
   * 
   * Why guard on login page:
   * - Logged-in users don't need to see login page
   * - Prevents confusion (why am I on login if I'm already logged in?)
   * - Better UX (auto-redirect to home)
   * 
   * Example:
   * - User is logged in
   * - Types /login in URL bar
   * - Guard catches it, redirects to /
   * - User sees home page instead of login
   */
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [canActivatePublicOnly]
  },

  /**
   * Register route
   * 
   * URL: /register
   * Component: RegisterComponent
   * Guard: canActivatePublicOnly
   * 
   * Same behavior as login:
   * - Logged-in users are redirected to home
   * - Only unauthenticated users see register page
   * 
   * Why:
   * - Can't register if already have account
   * - Prevents duplicate account creation
   * - Better UX
   */
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [canActivatePublicOnly]
  },

  /**
   * Home route - blog post feed
   * 
   * URL: /
   * Component: PostListComponent
   * 
   * This is the default landing page
   * Shows all blog posts in a feed
   * 
   * Accessible to everyone (authenticated and unauthenticated)
   */
  {
    path: '',
    component: PostListComponent
  },

  /**
   * Post detail route
   * 
   * URL: /posts/:id
   * Component: PostDetailComponent
   * 
   * Shows single post with full content, comments, and reactions
   * :id is the post ID (dynamic parameter)
   * 
   * Accessible to everyone
   * But reactions/comments require authentication
   */
  {
    path: 'posts/:id',
    component: PostDetailComponent
  },

  /**
   * Create post route
   * 
   * URL: /create-post
   * Component: PostFormComponent (in create mode)
   * Guard: canActivate (requires authentication)
   * 
   * Form for creating new blog posts
   * Only authenticated users can create posts
   * Guard redirects to login if not authenticated
   */
  {
    path: 'create-post',
    component: PostFormComponent,
    canActivate: [canActivate]
  },

  /**
   * Edit post route
   * 
   * URL: /edit-post/:id
   * Component: PostFormComponent (in edit mode)
   * Guard: canActivate (requires authentication)
   * 
   * Form for editing existing posts
   * :id is the post ID to edit
   * 
   * Only post owner can edit (backend validates this)
   * Guard ensures user is logged in
   */
  {
    path: 'edit-post/:id',
    component: PostFormComponent,
    canActivate: [canActivate]
  },

  /**
   * User profile route
   * 
   * URL: /profile
   * Component: UserProfileComponent
   * Guard: canActivate (requires authentication)
   * 
   * Shows current user's profile information
   * View-only for now (edit feature can be added later)
   * 
   * Displays:
   * - User info (name, email, country)
   * - Account statistics (posts, comments - TODO)
   * - Quick actions (create post, back to home)
   */
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [canActivate]
  },

  /**
   * Wildcard route (404)
   * 
   * path: '**' matches any URL that didn't match above routes
   * 
   * Currently redirects to login
   * Later can create a NotFoundComponent
   * 
   * Why needed:
   * - User types /invalid-url
   * - No route matches
   * - Without wildcard: blank page (bad UX)
   * - With wildcard: redirect somewhere useful
   * 
   * Must be last route:
   * - Router checks routes in order
   * - ** matches everything
   * - If placed first, no other routes would ever match
   */
  {
    path: '**',
    redirectTo: '/login'
  }
];

/**
 * All core routes are now implemented:
 * 
 * ✅ Authentication:
 * - /login - LoginComponent (public only)
 * - /register - RegisterComponent (public only)
 * 
 * ✅ Blog Post Features:
 * - / - PostListComponent (home feed, public)
 * - /posts/:id - PostDetailComponent (view post, public)
 * - /create-post - PostFormComponent (protected)
 * - /edit-post/:id - PostFormComponent (protected)
 * 
 * ✅ User Profile:
 * - /profile - UserProfileComponent (view profile, protected)
 * 
 * Future enhancements (optional):
 * - /posts/user/:userId - User's posts page
 * - /404 - NotFoundComponent (instead of redirect to login)
 * - /profile/edit - Edit profile page (separate from view)
 * 
 * Guards:
 * - canActivatePublicOnly: only for NOT logged-in users (login, register)
 * - canActivate: only for logged-in users (create-post, edit-post, profile)
 */


