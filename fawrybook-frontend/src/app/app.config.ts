import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { authErrorInterceptor } from './core/interceptors/auth-error.interceptor';

/**
 * Application configuration - sets up all global providers
 * 
 * Why configure here:
 * - Angular 15+ uses standalone API (no app.module.ts)
 * - All services, interceptors, and configs registered in one place
 * - Cleaner than NgModule approach
 * 
 * Providers explained:
 * - provideRouter: enables routing in the app
 * - provideHttpClient: enables HttpClient for API calls
 * - withInterceptors: registers JWT interceptor to run on all requests
 * - provideClientHydration: enables server-side rendering (SSR)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    
    /**
     * provideHttpClient - enables HTTP requests throughout the app
     * 
     * Interceptors (run in order):
     * 1. jwtInterceptor - attaches JWT token to API requests
     * 2. authErrorInterceptor - catches 401/403 errors and redirects to login
     * 
     * withFetch() - uses native fetch API instead of XMLHttpRequest
     * 
     * Why withFetch():
     * - Better performance and compatibility with SSR
     * - Recommended by Angular for Server-Side Rendering
     * - Uses modern browser Fetch API
     * 
     * Without this: HttpClient won't work, http.get() will throw errors
     * Without interceptors: manual token handling and error redirects needed
     */
    provideHttpClient(
      withInterceptors([jwtInterceptor, authErrorInterceptor]),
      withFetch()
    ),
    
    // Temporarily disabled SSR to debug loading issues
    // provideClientHydration(withEventReplay())
  ]
};
