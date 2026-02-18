/**
 * Static blueprint definitions — curated project templates with phased roadmaps
 */

import type { BlueprintDefinition } from '../types/blueprint.js';

export const BLUEPRINTS: BlueprintDefinition[] = [
  {
    id: 'saas-dashboard',
    name: 'SaaS Dashboard',
    description: 'Full-stack web app with auth, dashboard UI, and data management',
    categories: ['saas-dashboard', 'content-platform'],
    keywords: ['dashboard', 'saas', 'admin', 'analytics', 'metrics', 'panel', 'web app', 'fullstack'],
    requiredStack: ['nextjs', 'react-node', 'vue-node'],
    phases: [
      {
        name: 'Foundation',
        description: 'Project setup, authentication, and base layout',
        tasks: [
          { title: 'Initialize project with framework and dependencies', description: 'Set up the project structure, install core packages, configure TypeScript and linting' },
          { title: 'Implement authentication flow', description: 'Add signup, login, logout, and session management with protected routes' },
          { title: 'Create base layout with navigation', description: 'Build the app shell: sidebar, header, responsive layout, and route structure' },
          { title: 'Set up database schema and ORM', description: 'Define core data models, configure database connection, and run initial migrations' }
        ]
      },
      {
        name: 'Core Features',
        description: 'Main application functionality and data views',
        tasks: [
          { title: 'Build the primary data views', description: 'Create list, detail, and table views for the main entities' },
          { title: 'Add create/edit forms with validation', description: 'Build forms for data entry with client and server-side validation' },
          { title: 'Implement API endpoints for CRUD operations', description: 'Create RESTful endpoints with proper error handling and auth middleware' },
          { title: 'Add search and filtering', description: 'Implement search across entities with filter controls and URL state' },
          { title: 'Build dashboard overview with charts', description: 'Create a summary dashboard with key metrics and data visualizations' }
        ]
      },
      {
        name: 'Polish',
        description: 'UX improvements, error handling, and performance',
        tasks: [
          { title: 'Add loading states and error boundaries', description: 'Handle loading, empty, and error states across all views' },
          { title: 'Implement role-based access control', description: 'Add user roles and permissions to restrict features by role' },
          { title: 'Optimize performance and bundle size', description: 'Add code splitting, optimize queries, and reduce bundle size' },
          { title: 'Write tests for critical paths', description: 'Add unit tests for business logic and integration tests for auth and CRUD flows' }
        ]
      },
      {
        name: 'Launch',
        description: 'Deployment, monitoring, and go-live checklist',
        tasks: [
          { title: 'Configure production deployment', description: 'Set up hosting, environment variables, database, and CI/CD pipeline' },
          { title: 'Add error tracking and monitoring', description: 'Integrate error reporting and basic application monitoring' },
          { title: 'Security audit and hardening', description: 'Review auth, input validation, CORS, rate limiting, and dependency vulnerabilities' }
        ]
      }
    ]
  },

  {
    id: 'landing-waitlist',
    name: 'Landing Page + Waitlist',
    description: 'Marketing landing page with email capture and waitlist management',
    categories: ['content-platform', 'marketing-campaign'],
    keywords: ['landing', 'waitlist', 'launch', 'coming soon', 'signup', 'email', 'marketing', 'homepage'],
    requiredStack: ['nextjs', 'react-node', 'vue-node', 'other'],
    phases: [
      {
        name: 'Design & Structure',
        description: 'Page layout, content sections, and visual design',
        tasks: [
          { title: 'Set up project with styling framework', description: 'Initialize project, configure Tailwind or chosen CSS framework, set up fonts and colors' },
          { title: 'Build hero section with value proposition', description: 'Create the above-fold section: headline, subheadline, CTA, and hero visual' },
          { title: 'Add feature sections and social proof', description: 'Build feature highlights, testimonials or logos, and how-it-works sections' },
          { title: 'Create responsive footer and navigation', description: 'Add footer with links, mobile-friendly nav, and smooth scroll to sections' }
        ]
      },
      {
        name: 'Waitlist',
        description: 'Email capture, storage, and confirmation flow',
        tasks: [
          { title: 'Build email signup form with validation', description: 'Create the waitlist form with email validation and submit handling' },
          { title: 'Set up email storage backend', description: 'Configure database or third-party service to store waitlist signups' },
          { title: 'Add confirmation and thank-you flow', description: 'Show success state after signup, optionally send confirmation email' },
          { title: 'Implement referral or share mechanics', description: 'Add share buttons or referral links to help signups spread the word' }
        ]
      },
      {
        name: 'Polish & Launch',
        description: 'SEO, analytics, and production readiness',
        tasks: [
          { title: 'Optimize for SEO and social sharing', description: 'Add meta tags, Open Graph images, structured data, and sitemap' },
          { title: 'Add analytics tracking', description: 'Integrate analytics for page views, signup conversions, and traffic sources' },
          { title: 'Performance and accessibility audit', description: 'Run Lighthouse, fix performance issues, ensure WCAG compliance' },
          { title: 'Deploy and configure custom domain', description: 'Deploy to production, set up custom domain, SSL, and CDN' }
        ]
      }
    ]
  },

  {
    id: 'api-backend',
    name: 'API Backend',
    description: 'RESTful or GraphQL API service with auth, validation, and documentation',
    categories: ['api-service', 'auth-service'],
    keywords: ['api', 'rest', 'graphql', 'backend', 'service', 'microservice', 'server', 'endpoints'],
    requiredStack: ['react-node', 'python-fastapi', 'other'],
    phases: [
      {
        name: 'Foundation',
        description: 'Project structure, database, and auth',
        tasks: [
          { title: 'Set up project with API framework', description: 'Initialize project, configure framework (Express/Fastify/FastAPI), set up TypeScript and linting' },
          { title: 'Configure database and ORM', description: 'Set up database connection, configure ORM, create initial schema and migrations' },
          { title: 'Implement authentication and API keys', description: 'Add JWT or session auth, API key management, and auth middleware' },
          { title: 'Set up request validation and error handling', description: 'Configure input validation schemas and consistent error response format' }
        ]
      },
      {
        name: 'Core Endpoints',
        description: 'Main API resources and business logic',
        tasks: [
          { title: 'Build CRUD endpoints for primary resources', description: 'Create endpoints for the main data entities with proper HTTP methods' },
          { title: 'Add pagination, filtering, and sorting', description: 'Implement query parameters for list endpoints with cursor or offset pagination' },
          { title: 'Implement business logic and data transformations', description: 'Add service layer for complex operations, calculations, and data processing' },
          { title: 'Add API documentation', description: 'Generate OpenAPI/Swagger docs from route definitions and schemas' },
          { title: 'Write integration tests for endpoints', description: 'Test each endpoint with valid/invalid inputs, auth, and edge cases' }
        ]
      },
      {
        name: 'Production',
        description: 'Security, monitoring, and deployment',
        tasks: [
          { title: 'Add rate limiting and CORS configuration', description: 'Configure rate limits per endpoint, set up CORS for allowed origins' },
          { title: 'Implement logging and health checks', description: 'Add structured logging, health check endpoint, and readiness probes' },
          { title: 'Configure deployment and CI/CD', description: 'Set up Docker, deployment pipeline, environment management, and secrets' },
          { title: 'Load testing and performance optimization', description: 'Run load tests, optimize slow queries, add caching where needed' }
        ]
      }
    ]
  },

  {
    id: 'internal-tool',
    name: 'Internal Tool',
    description: 'Admin panel or internal dashboard for team operations',
    categories: ['saas-dashboard', 'data-pipeline'],
    keywords: ['internal', 'admin', 'tool', 'backoffice', 'operations', 'management', 'team', 'workflow'],
    requiredStack: ['nextjs', 'react-node', 'vue-node'],
    phases: [
      {
        name: 'Setup',
        description: 'Project scaffolding and team auth',
        tasks: [
          { title: 'Initialize project with admin UI framework', description: 'Set up the project with a component library suitable for data-heavy admin UIs' },
          { title: 'Add team authentication with SSO', description: 'Implement login with company SSO, Google Workspace, or similar provider' },
          { title: 'Set up database and data access layer', description: 'Connect to existing data sources or set up new database with proper access patterns' }
        ]
      },
      {
        name: 'Features',
        description: 'Core tool functionality and workflows',
        tasks: [
          { title: 'Build data tables with sort, filter, and export', description: 'Create reusable data table component with column configuration and CSV export' },
          { title: 'Add forms for data management', description: 'Build create/edit forms with validation for the main entities' },
          { title: 'Implement bulk actions and batch operations', description: 'Add multi-select, bulk edit, bulk delete, and batch processing' },
          { title: 'Create activity log and audit trail', description: 'Track who changed what, when, with ability to view history' },
          { title: 'Add role-based permissions', description: 'Define roles (admin, editor, viewer) and restrict features accordingly' }
        ]
      },
      {
        name: 'Polish',
        description: 'UX refinement and operational readiness',
        tasks: [
          { title: 'Add keyboard shortcuts and power-user features', description: 'Implement common shortcuts, command palette, and quick navigation' },
          { title: 'Build notification system for important events', description: 'Add in-app notifications or email alerts for critical operations' },
          { title: 'Write documentation for team onboarding', description: 'Create user guide, document workflows, and add contextual help' },
          { title: 'Deploy internally with access controls', description: 'Deploy to internal network or VPN, configure access restrictions' }
        ]
      }
    ]
  },

  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Two-sided marketplace with listings, search, and transactions',
    categories: ['ecommerce', 'saas-dashboard'],
    keywords: ['marketplace', 'ecommerce', 'store', 'shop', 'listings', 'buyers', 'sellers', 'transactions'],
    requiredStack: ['nextjs', 'react-node', 'vue-node'],
    phases: [
      {
        name: 'Foundation',
        description: 'Core platform setup and user accounts',
        tasks: [
          { title: 'Set up project with full-stack framework', description: 'Initialize project, configure database, and set up the base architecture' },
          { title: 'Implement dual-role authentication', description: 'Add auth that supports both buyer and seller accounts with profile management' },
          { title: 'Create base layout and navigation', description: 'Build the marketplace shell: header, search bar, category nav, and footer' },
          { title: 'Design and implement database schema', description: 'Model users, listings, categories, orders, and reviews' }
        ]
      },
      {
        name: 'Marketplace',
        description: 'Listings, search, and discovery',
        tasks: [
          { title: 'Build listing creation and management', description: 'Create forms for adding listings with images, pricing, and descriptions' },
          { title: 'Implement search with filters and categories', description: 'Add full-text search, category browsing, price filters, and sort options' },
          { title: 'Create listing detail pages', description: 'Build detail views with image gallery, seller info, and similar listings' },
          { title: 'Add seller dashboard', description: 'Build dashboard for sellers to manage listings, view analytics, and track orders' }
        ]
      },
      {
        name: 'Transactions',
        description: 'Payments, orders, and reviews',
        tasks: [
          { title: 'Integrate payment processing', description: 'Set up Stripe Connect or similar for marketplace payments with platform fees' },
          { title: 'Build checkout and order flow', description: 'Create cart, checkout, order confirmation, and order tracking' },
          { title: 'Implement review and rating system', description: 'Add buyer reviews, seller ratings, and moderation tools' },
          { title: 'Add messaging between buyers and sellers', description: 'Build simple messaging system for pre-purchase questions' }
        ]
      },
      {
        name: 'Growth',
        description: 'Trust, SEO, and scaling',
        tasks: [
          { title: 'Add trust and safety features', description: 'Implement reporting, moderation queue, and content policies' },
          { title: 'Optimize for SEO and social sharing', description: 'Add meta tags, structured data for products, and social share cards' },
          { title: 'Implement notifications and email', description: 'Add order notifications, new message alerts, and marketing emails' },
          { title: 'Deploy with CDN and caching', description: 'Set up production deployment with image CDN, caching, and monitoring' }
        ]
      }
    ]
  }
];
