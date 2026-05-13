# High-Level Design (HLD) — FawryBook Backend

**Project:** FawryBook Technical Blogging Platform  
**Date:** May 13, 2026

---

## 1. Overview

**Purpose:** A technical blogging platform for developers to share knowledge, interact through likes/dislikes/comments, and manage their content.

**Key Features:**
- User registration & JWT authentication
- Blog post CRUD with ownership control
- Like/Dislike system with rating calculation
- Commenting on posts
- RESTful API design

---

## 2. Technology Stack

| Category | Technology |
|---|---|
| **Framework** | Spring Boot 3.5.14 + Java 17 |
| **Database** | Oracle Database 21c XE |
| **ORM** | Hibernate (Spring Data JPA) |
| **Security** | Spring Security + JWT (JJWT library) |
| **Password** | BCrypt hashing |
| **Utilities** | Lombok, MapStruct, SpringDoc OpenAPI |

---

## 3. System Architecture

```
Client (Postman/Angular)
       ↓
[Controllers] → REST endpoints
       ↓
[Security Layer] → JWT authentication
       ↓
[Services] → Business logic
       ↓
[Repositories] → Database access (Spring Data JPA)
       ↓
Oracle Database
```

---

## 4. Project Structure

```
com.blogPlatform.fawryBook/
├── config/           → SecurityConfig
├── controller/       → AuthController, UserController, PostController,
│                       CommentController, ReactionController
├── dto/
│   ├── request/      → Input DTOs (validated)
│   └── response/     → Output DTOs (no sensitive data)
├── entity/           → User, Post, Comment, Reaction
├── enums/            → ReactionType (LIKE/DISLIKE)
├── exception/        → GlobalExceptionHandler, custom exceptions
├── mapper/           → MapStruct interfaces
├── repository/       → Spring Data JPA repositories
├── security/         → JwtService, JwtAuthenticationFilter,
│                       CustomUserDetailsService
└── service/          → Business logic services
```

---

## 5. Database Design

### ERD
```
users (1) ──< (*) posts (1) ──< (*) comments
                   └──< (*) reactions
                   └──< (*) post_tags
```
---

## 6. API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/users/me` | ✅ | View profile |
| PUT | `/api/users/me` | ✅ | Update profile |
| POST | `/api/posts` | ✅ | Create post |
| GET | `/api/posts` | ❌ | List all posts |
| GET | `/api/posts/{id}` | ❌ | View post |
| PUT | `/api/posts/{id}` | ✅ (owner) | Edit post |
| DELETE | `/api/posts/{id}` | ✅ (owner) | Delete post |
| POST | `/api/posts/{id}/reactions` | ✅ | Like/Dislike |
| POST | `/api/posts/{id}/comments` | ✅ | Add comment |
| GET | `/api/posts/{id}/comments` | ❌ | List comments |

**Error Format:**
```json
{
  "timestamp": "2026-05-13T14:22:00",
  "status": 404,
  "error": "Not Found",
  "message": "Post not found with id: 999"
}
```

---

## 7. Security Flow

### Authentication
```
1. User sends email + password to /api/auth/login
2. AuthenticationManager verifies BCrypt hash
3. JwtService generates token (HS256, 24h expiry, email as subject)
4. Client receives JWT token
```

### Authorization
```
1. Client sends request with header: "Authorization: Bearer <token>"
2. JwtAuthenticationFilter extracts & validates token
3. Sets Authentication in SecurityContextHolder
4. Controller receives authenticated user's email
5. Service validates ownership (if editing/deleting)
```

---

## 8. Deployment

### Development
```
Spring Boot :8080  +  Oracle XE :1521
```

## 9. Build & Run

```bash
# Build
mvn clean package

# Run
mvn spring-boot:run

# Access Swagger
http://localhost:8080/swagger-ui.html
```

---

**End of Document**
