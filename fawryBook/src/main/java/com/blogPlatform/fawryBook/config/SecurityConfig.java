package com.blogPlatform.fawryBook.config;

import com.blogPlatform.fawryBook.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Why @EnableWebSecurity:
 * - Activates Spring Security's web security features
 * - Without this, none of the filter chain config takes effect
 *
 * Why SecurityFilterChain bean (not extending WebSecurityConfigurerAdapter):
 * - WebSecurityConfigurerAdapter was DEPRECATED in Spring Security 5.7+
 * - Bean-based config is the modern, recommended approach
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    /**
     * Configures which endpoints are public vs. protected, and how requests are authenticated.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Why disable CSRF: this is a stateless REST API using JWT tokens (not cookies).
            // CSRF protection is for browser-based cookie/session apps — not needed here.
            .csrf(csrf -> csrf.disable())

            // Enable CORS for Angular frontend
            // Why needed: browser blocks cross-origin requests by default
            // Angular (localhost:4200) → Spring Boot (localhost:8080) = different origins
            .cors(cors -> cors.configure(http))

            // Define endpoint access rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints: registration, login, and Swagger docs
                // Why public: users can't authenticate before they register/login
                .requestMatchers("/api/auth/**").permitAll()
                
                // Public read-only endpoints: anyone can view posts and comments
                // Why public: blog posts should be viewable without login -> guest mode
                .requestMatchers("GET", "/api/posts", "/api/posts/**").permitAll()
                
                // Swagger/OpenAPI endpoints — public so developers can explore the API
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                
                // Everything else requires a valid JWT token
                // (POST/PUT/DELETE on posts, reactions, user profile, etc.)
                .anyRequest().authenticated()
            )

            // Why STATELESS session policy:
            // - Tells Spring Security NOT to create HTTP sessions
            // - Each request must carry its own JWT token — no server-side session storage
            // - Better for scalability (no sticky sessions needed in a load balancer)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Wire in the authentication provider (BCrypt password verification + UserDetailsService)
            .authenticationProvider(authenticationProvider())

            // Why addFilterBefore: our JWT filter must run BEFORE Spring's default
            // UsernamePasswordAuthenticationFilter — by the time Spring's filter runs,
            // the SecurityContext should already have the authentication set (or not).
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Why DaoAuthenticationProvider:
     * - Connects Spring Security's authentication flow to our DB
     * - Uses UserDetailsService to load the user, and PasswordEncoder to verify the password
     * - "Dao" stands for Data Access Object — it's a DB-backed auth provider
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(passwordEncoder());
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    /**
     * Why AuthenticationManager bean:
     * - Needed by the login endpoint to programmatically authenticate (email + password)
     * - Spring Boot auto-configures it, but we need to expose it as a bean for injection
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Why BCrypt:
     * - Industry-standard password hashing algorithm
     * - Intentionally slow (configurable work factor) — makes brute-force attacks impractical
     * - Automatically salts each password — two identical passwords produce different hashes
     * - Preferred over MD5/SHA (too fast, no salt) and PBKDF2 (less widely adopted in Spring)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS Configuration for Angular Frontend
     * 
     * Why needed:
     * - Browser blocks cross-origin requests by default (Same-Origin Policy)
     * - Angular dev server (localhost:4200) and Spring Boot (localhost:8080) are different origins
     * - Without CORS headers, browser rejects all requests from Angular
     * 
     * What this allows:
     * - Origin: http://localhost:4200 (Angular dev server)
     * - Methods: GET, POST, PUT, DELETE, OPTIONS (all HTTP methods we use)
     * - Headers: Authorization, Content-Type (JWT token and JSON data)
     * - Credentials: false (we use Authorization header, not cookies)
     * 
     * Security note:
     * - Only localhost:4200 is allowed (not "*" wildcard)
     * - In production, change to actual frontend domain
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow requests from Angular dev server
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        
        // Allow all HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Allow headers: Authorization (JWT token), Content-Type (JSON), etc.
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Don't need credentials (cookies) - we use JWT in Authorization header
        configuration.setAllowCredentials(false);
        
        // Cache preflight response for 1 hour (reduces OPTIONS requests)
        configuration.setMaxAge(3600L);
        
        // Apply CORS config to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}

