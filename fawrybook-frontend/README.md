# FawryBook - Technical Blog Platform (Frontend)

A modern, responsive Angular frontend for the FawryBook blog platform. This application enables users to write, edit, and share technical blog posts, interact through likes/dislikes and comments, and view post ratings.

## 🚀 Features

### ✅ Implemented Features

- **User Authentication**
  - User registration with form validation
  - Login/logout functionality
  - JWT token-based authentication
  - Protected routes with auth guards
  - Persistent login across page refreshes

- **Blog Post Management**
  - Browse all posts in a responsive card grid
  - View full post details with author info
  - Create new blog posts with title, content, and tags
  - Edit existing posts (owner only)
  - Delete posts with confirmation (owner only)
  - Tag-based categorization
  - Pagination support for post lists

- **Social Interactions**
  - Like/dislike posts with real-time count updates
  - Add comments to posts
  - View all comments with pagination
  - Rating system (like percentage)
  - Comment count display

- **User Profile**
  - View profile information (name, email, country)
  - Account creation date and member duration
  - Activity statistics placeholder
  - Quick actions (create post, navigate home)

- **Responsive Design**
  - Mobile-first approach
  - Bootstrap 5.3.8 styling
  - Responsive navbar with hamburger menu
  - Adaptive card layouts (1/2/3 columns)
  - Touch-friendly interface

### 🔜 TODO: API Integration

All service methods are marked with `// TODO: Implement API call` comments. The application currently uses mock data for UI testing. To connect to the backend:

1. **Authentication Service** (`src/app/core/services/auth.service.ts`)
   - [ ] `login()` - POST /api/auth/login
   - [ ] `register()` - POST /api/auth/register
   - Backend already implemented ✅

2. **Post Service** (`src/app/core/services/post.service.ts`)
   - [ ] `getAllPosts()` - GET /api/posts?page=0&size=10
   - [ ] `getPostById()` - GET /api/posts/{id}
   - [ ] `createPost()` - POST /api/posts
   - [ ] `updatePost()` - PUT /api/posts/{id}
   - [ ] `deletePost()` - DELETE /api/posts/{id}
   - [ ] `getPostsByAuthor()` - GET /api/posts/author/{authorId}
   - Backend already implemented ✅

3. **Comment Service** (`src/app/core/services/comment.service.ts`)
   - [ ] `addComment()` - POST /api/posts/{postId}/comments
   - [ ] `getCommentsByPostId()` - GET /api/posts/{postId}/comments?page=0&size=10
   - Backend already implemented ✅

4. **Reaction Service** (`src/app/core/services/reaction.service.ts`)
   - [ ] `reactToPost()` - POST /api/posts/{postId}/reactions
   - Backend already implemented ✅

5. **User Profile** (Future)
   - [ ] Create UserService
   - [ ] `getUserById()` - GET /api/users/{id}
   - [ ] `updateUser()` - PUT /api/users/{id}

## 🛠️ Tech Stack

- **Framework**: Angular 21.2.10 (Standalone Components)
- **UI Library**: Bootstrap 5.3.8
- **Icons**: Bootstrap Icons 1.11.0
- **Language**: TypeScript 5.7
- **Build Tool**: Angular CLI with Vite
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **Forms**: Reactive Forms
- **State Management**: Services + RxJS BehaviorSubject

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm**: v9.x or higher (comes with Node.js)
- **Angular CLI**: v21.x or higher

```bash
# Check versions
node --version
npm --version
ng version
```

## 🔧 Installation

1. **Clone the repository** (if applicable)
   ```bash
   cd d:\Task\fawrybook-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   # Check for errors
   npm list
   ```

## 🚀 Running the Application

### Development Server

Start the development server:

```bash
ng serve
```

Or specify a port:

```bash
ng serve --port 4200
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload when you make changes to source files.

### Production Build

Build the application for production:

```bash
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

## 📁 Project Structure

```
fawrybook-frontend/
├── src/
│   ├── app/
│   │   ├── core/                          # Singleton services, guards, interceptors
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts         # Route protection (canActivate, canActivatePublicOnly)
│   │   │   ├── interceptors/
│   │   │   │   └── jwt.interceptor.ts    # Attach JWT to HTTP requests
│   │   │   ├── models/
│   │   │   │   └── index.ts              # TypeScript interfaces (DTOs, enums)
│   │   │   └── services/
│   │   │       ├── auth.service.ts       # Authentication & JWT management
│   │   │       ├── post.service.ts       # Blog post CRUD operations
│   │   │       ├── comment.service.ts    # Comment operations
│   │   │       └── reaction.service.ts   # Like/dislike operations
│   │   │
│   │   ├── features/                      # Feature modules (standalone components)
│   │   │   ├── auth/
│   │   │   │   ├── login/                # Login page
│   │   │   │   └── register/             # Registration page
│   │   │   ├── posts/
│   │   │   │   ├── post-list/            # Home feed (all posts)
│   │   │   │   ├── post-detail/          # Single post view
│   │   │   │   └── post-form/            # Create/edit post form
│   │   │   └── profile/
│   │   │       └── user-profile/         # User profile page
│   │   │
│   │   ├── shared/                        # Reusable components
│   │   │   └── components/
│   │   │       ├── navbar/               # Global navigation
│   │   │       ├── loading-spinner/      # Loading indicator
│   │   │       ├── error-message/        # Error alert
│   │   │       ├── comment-list/         # Reusable comment list
│   │   │       └── add-comment/          # Reusable comment form
│   │   │
│   │   ├── app.component.ts              # Root component
│   │   ├── app.config.ts                 # App configuration (providers, interceptors)
│   │   └── app.routes.ts                 # Routing configuration
│   │
│   ├── environments/
│   │   ├── environment.ts                # Development config (apiUrl: http://localhost:8080/api)
│   │   └── environment.prod.ts           # Production config
│   │
│   ├── index.html                         # Entry HTML (Bootstrap Icons CDN)
│   └── styles.css                         # Global styles (Bootstrap import)
│
├── angular.json                           # Angular CLI configuration
├── package.json                           # Dependencies
├── tsconfig.json                          # TypeScript configuration
└── README.md                              # This file
```

## 🔑 Key Design Decisions

### Architecture Patterns

- **Standalone Components**: No NgModule, cleaner and more modern
- **Feature-based Structure**: Organized by feature, not by file type
- **Reactive Forms**: Better validation and type safety than template-driven
- **BehaviorSubject for Auth State**: Observable pattern for auth state management
- **Reusable Components**: Comment list and add-comment are extracted for reusability

### Styling Strategy

- **Bootstrap 5**: Quick, professional UI without custom CSS complexity
- **Utility Classes**: Leveraging Bootstrap utilities for spacing, layout, etc.
- **Custom CSS**: Minimal, only for component-specific styling
- **Responsive First**: Mobile-first approach with responsive breakpoints

### State Management

- **No NgRx**: Simple service-based state for this scope
- **Services as Singletons**: `providedIn: 'root'` for shared state
- **Local Component State**: Component properties for UI state

## 🧪 Testing the Application (Without Backend)

The application includes mock data for all features. You can test the complete UI flow:

1. **Start the app**: `ng serve`
2. **Navigate to** `http://localhost:4200/`
3. **Test Authentication**:
   - Click "Register" → Fill form → Submit (mock success)
   - Click "Login" → Enter any credentials → Submit (mock success)
4. **Test Post Features**:
   - View post feed on home page (3 mock posts)
   - Click on a post to view details
   - Click "Create Post" → Fill form → Submit (mock success)
   - On post detail, try like/dislike buttons
5. **Test Comments**:
   - On post detail, add a comment (appears instantly with mock)
   - View comment list with mock comments
6. **Test Profile**:
   - Click "Profile" in navbar → View mock profile data

### Mock Data Locations

- **Posts**: `post-list.component.ts` (lines 147-195)
- **Post Detail**: `post-detail.component.ts` (lines 130-165)
- **Comments**: `post-detail.component.ts` (lines 230-250)
- **User Profile**: `user-profile.component.ts` (lines 120-135)

## 🌐 Environment Configuration

### Development

File: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### Production

File: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'  // TODO: Update with production URL
};
```

## 🔐 Authentication Flow

1. User submits login form
2. `AuthService.login()` sends credentials to backend (TODO)
3. Backend returns JWT token + user info
4. Token stored in localStorage (browser only, SSR-safe)
5. `JwtInterceptor` attaches token to all `/api/*` requests
6. `AuthGuard` protects routes requiring authentication
7. On logout, token removed from localStorage

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 991px (2 columns)
- **Desktop**: ≥ 992px (3 columns)
- **Navbar**: Collapses at < 992px

## 🚧 Known Limitations

1. **No Backend Integration**: All API calls return mock data
2. **No User Statistics**: Profile statistics are placeholders
3. **No Profile Editing**: View-only profile (edit feature prepared)
4. **No Image Upload**: Post content is text-only
5. **No Search/Filter**: Post search not implemented
6. **No Admin Features**: No admin panel or moderation

## 🔮 Future Enhancements

1. **Profile Editing**: Allow users to update firstName, lastName, country
2. **Password Change**: Separate form for password updates
3. **Avatar Upload**: Profile picture upload with cropping
4. **Post Search**: Search posts by title, content, or tags
5. **Filter by Tags**: Click tag to filter posts
6. **User Posts Page**: View all posts by a specific author
7. **Notifications**: Real-time notifications for comments/reactions
8. **Markdown Support**: Rich text editor for post content
9. **Image Uploads**: Attach images to posts
10. **Dark Mode**: Theme toggle for dark/light mode

## 📖 Component Documentation

Each component includes detailed inline comments explaining:
- **Why**: Architectural decisions and design rationale
- **What**: Component purpose and features
- **How**: Implementation details and data flow

Example locations:
- Auth flow: `src/app/core/guards/auth.guard.ts`
- JWT handling: `src/app/core/interceptors/jwt.interceptor.ts`
- Form validation: `src/app/features/auth/login/login.component.ts`

## 🐛 Troubleshooting

### Common Issues

**Issue**: `localStorage is not defined` error during SSR
- **Solution**: Already fixed with platform detection (`isPlatformBrowser`)

**Issue**: `Argument of type '"LIKE"' is not assignable to parameter of type 'ReactionType'`
- **Solution**: Already fixed by exposing enum to template (`readonly ReactionType = ReactionType`)

**Issue**: Module not found errors
- **Solution**: Run `npm install` to install dependencies

**Issue**: Port 4200 already in use
- **Solution**: Use `ng serve --port 4201` or kill the existing process

## 📝 Development Guidelines

### Adding a New Component

```bash
ng generate component features/feature-name/component-name --standalone
```

### Adding a New Service

```bash
ng generate service core/services/service-name
```

### Code Style

- Use **Reactive Forms** for all user input
- Add **detailed comments** explaining "why", not just "what"
- Mark API integration points with **`// TODO:`** comments
- Use **Bootstrap utilities** before writing custom CSS
- Keep components **focused** (single responsibility)
- Extract **reusable logic** into services

## 🤝 Backend Integration Checklist

When connecting to the Spring Boot backend:

1. ✅ Backend API running at `http://localhost:8080`
2. ✅ CORS configured to allow `http://localhost:4200`
3. ✅ All backend endpoints match frontend DTOs
4. ⏳ Uncomment API calls in service files
5. ⏳ Comment out or remove mock data
6. ⏳ Test each endpoint individually
7. ⏳ Handle backend error responses
8. ⏳ Update pagination logic if needed
9. ⏳ Test authentication flow end-to-end
10. ⏳ Verify JWT token expiration handling

## 📄 License

This project is part of the FawryBook technical blog platform.

## 👨‍💻 Author

Built with Angular 21, Bootstrap 5, and detailed inline documentation for easy handoff and maintenance.

---

**Note**: This frontend is designed to work with the FawryBook Spring Boot backend. All API endpoints are ready for integration - just uncomment the service methods and remove the mock data!


```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
