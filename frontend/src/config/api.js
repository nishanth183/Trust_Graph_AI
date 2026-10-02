/**
 * Centralized API configuration for TrustGraph AI.
 * 
 * In production: Set VITE_API_URL in your hosting platform (e.g., https://your-backend.onrender.com)
 * In local development: If VITE_API_URL is unset, API_BASE defaults to empty string,
 * allowing Vite's built-in dev proxy (configured in vite.config.js) to route /api requests to 127.0.0.1:8000.
 */
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
