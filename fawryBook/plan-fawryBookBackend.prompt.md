## Plan: FawryBook Spring Boot REST API Backend

Build a layered Spring Boot REST API covering user auth (JWT), blog CRUD, social interactions (like/dislike/comment), and optional Twitter sharing. The project uses **PostgreSQL** (production-grade, rich SQL features for ratings/aggregations), **Spring Data JPA** (eliminates boilerplate DB code), **Spring Security + JJWT** (industry-standard stateless auth), **Lombok** (reduces entity/DTO boilerplate), **MapStruct** (type-safe DTO mapping), and **SpringDoc OpenAPI** (auto-generates Swagger docs useful for the Postman deliverable).

---

### Step 1 — Add dependencies in pom.xml

Add these starters/libraries and **why each is needed**:

| Dependency | Why |
|---|---|
| `spring-boot-starter-web` | Exposes REST controllers, embedded Tomcat |
| `spring-boot-starter-data-jpa` | ORM layer — maps Java entities to DB tables automatically |
| `spring-boot-starter-security` | Provides filter chain, password encoding, endpoint protection |
| `spring-boot-starter-validation` | `@Valid` / `@NotBlank` annotations to reject bad input at the controller level |
| `postgresql` (runtime) | JDBC driver for PostgreSQL — chosen over H2 because the task requires a real DB schema deliverable |
| `jjwt-api / jjwt-impl / jjwt-jackson` (io.jsonwebtoken 0.12.x) | Generate & verify JWT tokens — lightweight, widely adopted, no need for a full OAuth server |
| `lombok` | `@Data`, `@Builder`, etc. — eliminates 60%+ of entity/DTO boilerplate |
| `mapstruct` + `lombok-mapstruct-binding` | Compile-time DTO↔Entity mapping — safer & faster than manual or reflection-based mappers |
| `springdoc-openapi-starter-webmvc-ui` | Auto-generates Swagger UI at `/swagger-ui.html` — makes Postman collection export trivial |
| `spring-boot-starter-oauth2-client` *(bonus)* | Handles Twitter OAuth 2.0 PKCE flow for the share-to-Twitter feature |

---

### Step 2 — Define the package structure & entities

Create the following package layout under `com.blogPlatform.fawryBook`:

```
config/          ← Security & JWT config
controller/      ← REST endpoints
dto/             ← Request/Response DTOs (never expose entities directly — decouples API from DB schema)
entity/          ← JPA entities
enums/           ← Shared enums (e.g., ReactionType)
exception/       ← Global exception handler (@ControllerAdvice — gives consistent error JSON)
mapper/          ← MapStruct interfaces
repository/      ← Spring Data JPA interfaces
security/        ← JWT filter, provider, UserDetails impl
service/         ← Business logic
```

**Entities to create (why each exists):**

1. **`User`** — `id, firstName, lastName, email (unique), password, country, createdAt`
   *Why*: central identity; `email` is the login key, `password` stored as BCrypt hash.

2. **`Post`** — `id, title, content, tags (comma-separated or @ElementCollection), createdAt, updatedAt, author (ManyToOne → User)`
   *Why*: core content unit; `author` FK enforces ownership for edit/delete checks.

3. **`Comment`** — `id, content, createdAt, author (ManyToOne → User), post (ManyToOne → Post)`
   *Why*: separate table so comments can be paginated/queried independently.

4. **`Reaction`** — `id, type (LIKE/DISLIKE enum), user (ManyToOne), post (ManyToOne)` with a **unique constraint on (user, post)**
   *Why*: the unique constraint enforces "one action per user per post" at the DB level — no race-condition bugs. A single table with an enum is simpler than two separate Like/Dislike tables.

---

### Step 3 — Implement Security & JWT layer

Create these classes inside `security/` and `config/`:

| Class | Purpose |
|---|---|
| `JwtService` | Generate access token (sign with HS256 + secret), parse/validate, extract email & expiry. *Why HS256*: symmetric, simple for a single-server app. |
| `JwtAuthenticationFilter` (extends `OncePerRequestFilter`) | Reads `Authorization: Bearer <token>` header on every request, validates, sets `SecurityContextHolder`. *Why a filter*: stateless — no server-side session needed. |
| `CustomUserDetailsService` (implements `UserDetailsService`) | Loads `User` entity by email for Spring Security. *Why*: bridge between your DB and Spring Security's auth mechanism. |
| `SecurityConfig` (`@Configuration`) | Disables CSRF (*why*: stateless JWT API, no cookies), permits `/api/auth/**` endpoints, protects everything else, adds `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`, configures `BCryptPasswordEncoder` bean. |

---

### Step 4 — Build service & controller layers (REST endpoints)

Group endpoints under `/api` prefix. Each controller delegates to a service; services contain business logic and call repositories.

**Auth (`/api/auth`)**
| Method | Endpoint | What & Why |
|---|---|---|
| POST | `/register` | Creates user, hashes password with BCrypt, returns JWT so user is logged in immediately |
| POST | `/login` | Validates credentials, returns JWT |

**User Profile (`/api/users`)**
| Method | Endpoint | What & Why |
|---|---|---|
| GET | `/` | Returns logged-in user's profile (reads from `SecurityContextHolder` — avoids ID guessing) |
| PUT | `/` | Updates own profile (firstName, lastName, bio) |

**Posts (`/api/posts`)**
| Method | Endpoint | What & Why |
|---|---|---|
| POST | `/` | Create post (attaches current user as author) |
| GET | `/` | List all posts (paginated via `Pageable` — *why*: avoids loading thousands of rows) with like/dislike/comment counts |
| GET | `/{id}` | Single post with full details + comments |
| PUT | `/{id}` | Update post — service checks `post.author == currentUser`, else 403 |
| DELETE | `/{id}` | Delete post — same ownership check |

**Reactions (`/api/posts/{postId}/reactions`)**
| Method | Endpoint | What & Why |
|---|---|---|
| POST | `/` | Body: `{ "type": "LIKE" }` or `"DISLIKE"`. Upserts reaction (if same type exists → remove toggle, if opposite → switch). *Why upsert*: one endpoint handles add/toggle/remove cleanly. |

**Comments (`/api/posts/{postId}/comments`)**
| Method | Endpoint | What & Why |
|---|---|---|
| POST | `/` | Add comment to post |
| GET | `/` | List comments for a post (paginated) |

**Rating**: Computed on-the-fly in the Post response DTO as `likes / (likes + dislikes)` ratio — *why not a separate column*: avoids data duplication and stale values.

---

### Step 5 — Configure database & migrations

In `application.properties`:

- Set `spring.datasource.url` (e.g., `jdbc:oracle:thin:@localhost:1521:xe`), `spring.datasource.username`, `spring.datasource.password`, and `spring.datasource.driver-class-name=oracle.jdbc.OracleDriver` for Oracle Database.
- Set `spring.jpa.hibernate.ddl-auto=validate` in production, `update` during development — *why validate for prod*: prevents accidental schema changes.
- Add `jwt.secret` and `jwt.expiration` custom properties.

For the **"migration scripts" deliverable**: add a `schema.sql` file under `src/main/resources/` containing raw DDL (`CREATE TABLE …`) for all four entities plus indexes on `post.author_id` and `reaction(user_id, post_id)` — *why indexes*: ownership lookups and uniqueness checks must be fast.

---

### Step 6 *(Bonus)* — Twitter (X) share integration

Create a `TwitterService` and `/api/posts/{id}/share/twitter` endpoint:

1. Use **Spring OAuth2 Client** to handle Twitter OAuth 2.0 PKCE — *why PKCE*: Twitter's v2 API requires it for user-context actions; Spring's built-in support avoids manual token exchange.
2. Store the user's Twitter access/refresh tokens in a new `TwitterConnection` entity (linked to `User`).
3. On share: format tweet as `"{title}" — Read more: {link}` truncated to 280 chars, call Twitter v2 `POST /2/tweets`.
4. Return success/error status to the frontend.

---

### Further Considerations

1. **Database choice**: Plan assumes Oracle Database. If you prefer MySQL or H2 (simpler setup), the only changes are the JDBC driver dependency and connection URL.
2. **DTOs vs. Entity exposure**: The plan uses separate Request/Response DTOs everywhere. This adds files but prevents leaking password hashes or internal IDs — acceptable trade-off.
3. **Pagination strategy**: Plan uses Spring `Pageable` (page number + size in query params). An alternative is cursor-based pagination — overkill here unless you expect very large datasets.

