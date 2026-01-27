/**
 * Goal-based presets for agents and skills
 */
export const GOAL_PRESETS = {
    'saas-dashboard': {
        recommendedAgents: [
            { name: 'frontend-engineer', priority: 10, reason: 'Dashboard UI development' },
            { name: 'backend-engineer', priority: 9, reason: 'API and data layer' },
            { name: 'api-engineer', priority: 8, reason: 'RESTful API design' },
            { name: 'reviewer', priority: 7, reason: 'Code quality assurance' },
            { name: 'debugger', priority: 6, reason: 'Troubleshooting' }
        ],
        recommendedSkills: [
            { name: 'react', priority: 10, reason: 'UI framework' },
            { name: 'nextjs', priority: 10, reason: 'Full-stack framework' },
            { name: 'typescript', priority: 9, reason: 'Type safety' },
            { name: 'tailwind', priority: 9, reason: 'Styling' },
            { name: 'api-design', priority: 8, reason: 'REST API patterns' }
        ],
        technicalRequirements: [
            {
                category: 'frontend',
                description: 'Interactive dashboard UI with real-time updates',
                priority: 'required',
                suggestedTechnologies: ['React', 'Next.js', 'Tailwind CSS', 'Recharts']
            },
            {
                category: 'backend',
                description: 'RESTful API for data access',
                priority: 'required',
                suggestedTechnologies: ['Next.js API Routes', 'Node.js', 'Express']
            },
            {
                category: 'database',
                description: 'Time-series data storage',
                priority: 'required',
                suggestedTechnologies: ['PostgreSQL', 'Supabase', 'TimescaleDB']
            },
            {
                category: 'auth',
                description: 'User authentication and multi-tenancy',
                priority: 'required',
                suggestedTechnologies: ['NextAuth', 'Supabase Auth', 'Clerk']
            }
        ]
    },
    'ecommerce': {
        recommendedAgents: [
            { name: 'frontend-engineer', priority: 10, reason: 'Product pages and checkout UI' },
            { name: 'backend-engineer', priority: 10, reason: 'Order processing and inventory' },
            { name: 'api-engineer', priority: 8, reason: 'Cart and checkout APIs' },
            { name: 'reviewer', priority: 7, reason: 'Code quality' }
        ],
        recommendedSkills: [
            { name: 'nextjs', priority: 10, reason: 'E-commerce framework' },
            { name: 'stripe', priority: 10, reason: 'Payment processing' },
            { name: 'react', priority: 9, reason: 'UI components' },
            { name: 'typescript', priority: 9, reason: 'Type safety for transactions' },
            { name: 'api-design', priority: 8, reason: 'Cart and checkout APIs' }
        ],
        technicalRequirements: [
            {
                category: 'frontend',
                description: 'Product catalog, cart, and checkout flow',
                priority: 'required',
                suggestedTechnologies: ['Next.js', 'React', 'Tailwind CSS']
            },
            {
                category: 'payments',
                description: 'Secure payment processing',
                priority: 'required',
                suggestedTechnologies: ['Stripe', 'PayPal']
            },
            {
                category: 'database',
                description: 'Products, orders, and inventory management',
                priority: 'required',
                suggestedTechnologies: ['PostgreSQL', 'Prisma']
            }
        ]
    },
    'content-platform': {
        recommendedAgents: [
            { name: 'frontend-engineer', priority: 10, reason: 'Content display and layouts' },
            { name: 'backend-engineer', priority: 8, reason: 'Content API and CMS' },
            { name: 'docs-writer', priority: 8, reason: 'Documentation and content guidelines' },
            { name: 'reviewer', priority: 6, reason: 'Code quality' }
        ],
        recommendedSkills: [
            { name: 'nextjs', priority: 10, reason: 'SSG/SSR for content' },
            { name: 'react', priority: 9, reason: 'UI components' },
            { name: 'markdown', priority: 8, reason: 'Content formatting' },
            { name: 'cms', priority: 7, reason: 'Content management' }
        ],
        technicalRequirements: [
            {
                category: 'frontend',
                description: 'Article display, search, and navigation',
                priority: 'required',
                suggestedTechnologies: ['Next.js', 'MDX', 'Tailwind CSS']
            },
            {
                category: 'backend',
                description: 'Content API and publishing workflow',
                priority: 'required',
                suggestedTechnologies: ['Sanity', 'Contentful', 'Strapi']
            }
        ]
    },
    'api-service': {
        recommendedAgents: [
            { name: 'backend-engineer', priority: 10, reason: 'API implementation' },
            { name: 'api-engineer', priority: 10, reason: 'API design and documentation' },
            { name: 'reviewer', priority: 7, reason: 'Code quality' },
            { name: 'docs-writer', priority: 7, reason: 'API documentation' }
        ],
        recommendedSkills: [
            { name: 'api-design', priority: 10, reason: 'REST/GraphQL patterns' },
            { name: 'nodejs', priority: 9, reason: 'Runtime' },
            { name: 'typescript', priority: 9, reason: 'Type safety' },
            { name: 'openapi', priority: 8, reason: 'API documentation' }
        ],
        technicalRequirements: [
            {
                category: 'backend',
                description: 'RESTful or GraphQL API',
                priority: 'required',
                suggestedTechnologies: ['Express', 'Fastify', 'NestJS', 'GraphQL']
            },
            {
                category: 'database',
                description: 'Data persistence',
                priority: 'required',
                suggestedTechnologies: ['PostgreSQL', 'MongoDB', 'Redis']
            }
        ]
    },
    'mobile-app': {
        recommendedAgents: [
            { name: 'frontend-engineer', priority: 10, reason: 'Mobile UI development' },
            { name: 'backend-engineer', priority: 8, reason: 'API for mobile app' },
            { name: 'reviewer', priority: 7, reason: 'Code quality' }
        ],
        recommendedSkills: [
            { name: 'react-native', priority: 10, reason: 'Mobile framework' },
            { name: 'typescript', priority: 9, reason: 'Type safety' },
            { name: 'mobile-ui', priority: 8, reason: 'Mobile patterns' }
        ],
        technicalRequirements: [
            {
                category: 'frontend',
                description: 'Cross-platform mobile UI',
                priority: 'required',
                suggestedTechnologies: ['React Native', 'Expo', 'Flutter']
            },
            {
                category: 'backend',
                description: 'Mobile API',
                priority: 'required',
                suggestedTechnologies: ['Node.js', 'Firebase', 'Supabase']
            }
        ]
    },
    'cli-tool': {
        recommendedAgents: [
            { name: 'backend-engineer', priority: 10, reason: 'CLI implementation' },
            { name: 'docs-writer', priority: 8, reason: 'CLI documentation' },
            { name: 'reviewer', priority: 6, reason: 'Code quality' }
        ],
        recommendedSkills: [
            { name: 'nodejs', priority: 10, reason: 'Runtime' },
            { name: 'typescript', priority: 9, reason: 'Type safety' },
            { name: 'cli-design', priority: 9, reason: 'CLI patterns' }
        ],
        technicalRequirements: [
            {
                category: 'backend',
                description: 'Command-line interface',
                priority: 'required',
                suggestedTechnologies: ['Commander.js', 'Oclif', 'Ink']
            }
        ]
    },
    'data-pipeline': {
        recommendedAgents: [
            { name: 'data-engineer', priority: 10, reason: 'Data pipeline development' },
            { name: 'backend-engineer', priority: 8, reason: 'Data processing logic' },
            { name: 'reviewer', priority: 6, reason: 'Code quality' }
        ],
        recommendedSkills: [
            { name: 'python', priority: 10, reason: 'Data processing language' },
            { name: 'sql', priority: 9, reason: 'Data queries' },
            { name: 'data-processing', priority: 9, reason: 'ETL patterns' }
        ],
        technicalRequirements: [
            {
                category: 'backend',
                description: 'Data extraction, transformation, and loading',
                priority: 'required',
                suggestedTechnologies: ['Apache Airflow', 'Pandas', 'Spark']
            },
            {
                category: 'database',
                description: 'Data warehouse',
                priority: 'required',
                suggestedTechnologies: ['Snowflake', 'BigQuery', 'Redshift']
            }
        ]
    },
    'auth-service': {
        recommendedAgents: [
            { name: 'backend-engineer', priority: 10, reason: 'Auth implementation' },
            { name: 'security-engineer', priority: 9, reason: 'Security best practices' },
            { name: 'reviewer', priority: 7, reason: 'Code quality' }
        ],
        recommendedSkills: [
            { name: 'auth', priority: 10, reason: 'Authentication patterns' },
            { name: 'security', priority: 9, reason: 'Security best practices' },
            { name: 'nodejs', priority: 8, reason: 'Runtime' }
        ],
        technicalRequirements: [
            {
                category: 'auth',
                description: 'User authentication and authorization',
                priority: 'required',
                suggestedTechnologies: ['OAuth 2.0', 'JWT', 'Passport.js']
            },
            {
                category: 'database',
                description: 'User data storage',
                priority: 'required',
                suggestedTechnologies: ['PostgreSQL', 'Redis']
            }
        ]
    },
    'custom': {
        recommendedAgents: [
            { name: 'reviewer', priority: 8, reason: 'Code quality assurance' },
            { name: 'debugger', priority: 7, reason: 'Troubleshooting' },
            { name: 'docs-writer', priority: 6, reason: 'Documentation' }
        ],
        recommendedSkills: [],
        technicalRequirements: []
    }
};
//# sourceMappingURL=presets.js.map