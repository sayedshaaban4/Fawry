import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

/**
 * App Component - Root component of the application
 * 
 * Why this is the root:
 * - First component loaded when app starts
 * - Wraps entire application
 * - Always visible (never destroyed)
 * - Contains global UI elements (navbar)
 * 
 * Components included:
 * - NavbarComponent: navigation bar (always visible)
 * - RouterOutlet: placeholder for route components (changes based on URL)
 * 
 * How routing works:
 * 1. User navigates to /login
 * 2. Router finds matching route in app.routes.ts
 * 3. Loads LoginComponent into <router-outlet>
 * 4. Navbar stays visible (it's outside router-outlet)
 * 
 * Why standalone:
 * - Angular 15+ standard
 * - No app.module.ts needed
 * - Cleaner, simpler setup
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'FawryBook';
}
