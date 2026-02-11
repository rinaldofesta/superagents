/**
 * Goal-based presets for agents and skills
 *
 * Priority mapping: priority * 10 = base score
 * Core agents: 9-10 (score 80-100, auto-selected as defaults)
 * Supplementary: 3-6 (score 30-60, shown but not pre-selected)
 */
export const GOAL_PRESETS = {
    'saas-dashboard': {
        recommendedAgents: [
            { name: 'frontend-specialist', priority: 10, reason: 'Dashboard UI development' },
            { name: 'backend-engineer', priority: 9, reason: 'API and data layer' },
            { name: 'api-designer', priority: 6, reason: 'RESTful API design' },
            { name: 'designer', priority: 6, reason: 'UI/UX design and consistency' },
            { name: 'architect', priority: 4, reason: 'System architecture' },
            { name: 'code-reviewer', priority: 3, reason: 'Code quality assurance' },
            { name: 'debugger', priority: 3, reason: 'Troubleshooting' },
            { name: 'product-manager', priority: 3, reason: 'Requirements and prioritization' },
            { name: 'accessibility-specialist', priority: 3, reason: 'Inclusive UI' }
        ],
        recommendedSkills: [
            { name: 'react', priority: 10, reason: 'UI framework' },
            { name: 'nextjs', priority: 10, reason: 'Full-stack framework' },
            { name: 'typescript', priority: 9, reason: 'Type safety' },
            { name: 'tailwind', priority: 9, reason: 'Styling' },
            { name: 'prisma', priority: 8, reason: 'Database ORM' },
            { name: 'playwright', priority: 5, reason: 'E2E testing' }
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
            { name: 'frontend-specialist', priority: 10, reason: 'Product pages and checkout UI' },
            { name: 'backend-engineer', priority: 10, reason: 'Order processing and inventory' },
            { name: 'copywriter', priority: 6, reason: 'Product descriptions and CTAs' },
            { name: 'designer', priority: 6, reason: 'Shopping experience and visual design' },
            { name: 'security-analyst', priority: 6, reason: 'Payment security' },
            { name: 'api-designer', priority: 4, reason: 'Cart and checkout APIs' },
            { name: 'code-reviewer', priority: 3, reason: 'Code quality' },
            { name: 'performance-optimizer', priority: 4, reason: 'Page load optimization' }
        ],
        recommendedSkills: [
            { name: 'nextjs', priority: 10, reason: 'E-commerce framework' },
            { name: 'react', priority: 9, reason: 'UI components' },
            { name: 'typescript', priority: 9, reason: 'Type safety for transactions' },
            { name: 'stripe', priority: 9, reason: 'Payment processing' },
            { name: 'prisma', priority: 8, reason: 'Database ORM' },
            { name: 'tailwind', priority: 8, reason: 'Styling' }
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
            { name: 'frontend-specialist', priority: 10, reason: 'Content display and layouts' },
            { name: 'backend-engineer', priority: 7, reason: 'Content API and CMS' },
            { name: 'docs-writer', priority: 6, reason: 'Documentation and content guidelines' },
            { name: 'copywriter', priority: 6, reason: 'Editorial guidelines and microcopy' },
            { name: 'designer', priority: 6, reason: 'Reading experience and typography' },
            { name: 'performance-optimizer', priority: 4, reason: 'Content delivery optimization' },
            { name: 'code-reviewer', priority: 3, reason: 'Code quality' }
        ],
        recommendedSkills: [
            { name: 'nextjs', priority: 10, reason: 'SSG/SSR for content' },
            { name: 'react', priority: 9, reason: 'UI components' },
            { name: 'typescript', priority: 8, reason: 'Type safety' },
            { name: 'tailwind', priority: 8, reason: 'Styling' }
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
            { name: 'api-designer', priority: 9, reason: 'API design and documentation' },
            { name: 'architect', priority: 6, reason: 'System architecture' },
            { name: 'database-specialist', priority: 6, reason: 'Data modeling' },
            { name: 'security-analyst', priority: 6, reason: 'API security' },
            { name: 'testing-specialist', priority: 5, reason: 'API testing' },
            { name: 'sre-engineer', priority: 4, reason: 'API reliability and monitoring' },
            { name: 'docs-writer', priority: 4, reason: 'API documentation' },
            { name: 'code-reviewer', priority: 3, reason: 'Code quality' }
        ],
        recommendedSkills: [
            { name: 'nodejs', priority: 10, reason: 'Runtime' },
            { name: 'typescript', priority: 9, reason: 'Type safety' },
            { name: 'express', priority: 8, reason: 'API framework' },
            { name: 'prisma', priority: 8, reason: 'Database ORM' }
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
            { name: 'mobile-specialist', priority: 10, reason: 'Cross-platform mobile development' },
            { name: 'frontend-specialist', priority: 9, reason: 'Mobile UI development' },
            { name: 'backend-engineer', priority: 7, reason: 'API for mobile app' },
            { name: 'designer', priority: 6, reason: 'Mobile UI/UX design' },
            { name: 'api-designer', priority: 4, reason: 'Mobile API design' },
            { name: 'testing-specialist', priority: 4, reason: 'Mobile testing' },
            { name: 'code-reviewer', priority: 3, reason: 'Code quality' },
            { name: 'accessibility-specialist', priority: 3, reason: 'Mobile accessibility' }
        ],
        recommendedSkills: [
            { name: 'react', priority: 10, reason: 'React Native base' },
            { name: 'typescript', priority: 9, reason: 'Type safety' },
            { name: 'nodejs', priority: 7, reason: 'Backend runtime' }
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
            { name: 'testing-specialist', priority: 8, reason: 'CLI testing' },
            { name: 'copywriter', priority: 6, reason: 'Help text and error messages' },
            { name: 'docs-writer', priority: 5, reason: 'CLI documentation' },
            { name: 'code-reviewer', priority: 3, reason: 'Code quality' }
        ],
        recommendedSkills: [
            { name: 'nodejs', priority: 10, reason: 'Runtime' },
            { name: 'typescript', priority: 9, reason: 'Type safety' }
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
            { name: 'data-engineer', priority: 10, reason: 'Data pipeline design and implementation' },
            { name: 'database-specialist', priority: 10, reason: 'Data modeling and queries' },
            { name: 'backend-engineer', priority: 9, reason: 'Data processing logic' },
            { name: 'architect', priority: 6, reason: 'Pipeline architecture' },
            { name: 'devops-specialist', priority: 6, reason: 'Pipeline deployment' },
            { name: 'sre-engineer', priority: 4, reason: 'Pipeline reliability and monitoring' },
            { name: 'code-reviewer', priority: 3, reason: 'Code quality' }
        ],
        recommendedSkills: [
            { name: 'python', priority: 10, reason: 'Data processing language' },
            { name: 'fastapi', priority: 8, reason: 'API framework' }
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
            { name: 'security-analyst', priority: 10, reason: 'Security best practices' },
            { name: 'api-designer', priority: 6, reason: 'Auth API design' },
            { name: 'architect', priority: 6, reason: 'Auth architecture' },
            { name: 'testing-specialist', priority: 5, reason: 'Security testing' },
            { name: 'code-reviewer', priority: 3, reason: 'Code quality' }
        ],
        recommendedSkills: [
            { name: 'nodejs', priority: 10, reason: 'Runtime' },
            { name: 'typescript', priority: 9, reason: 'Type safety' },
            { name: 'prisma', priority: 8, reason: 'Database ORM' }
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
    'business-plan': {
        recommendedAgents: [
            { name: 'cfo', priority: 10, reason: 'Financial strategy and projections' },
            { name: 'product-manager', priority: 10, reason: 'Strategy and market analysis' },
            { name: 'copywriter', priority: 7, reason: 'Compelling narratives and pitches' },
            { name: 'architect', priority: 5, reason: 'Business model structure' },
            { name: 'docs-writer', priority: 4, reason: 'Clear documentation and specs' },
            { name: 'designer', priority: 4, reason: 'Pitch deck visuals' }
        ],
        recommendedSkills: [
            { name: 'financial-planning', priority: 10, reason: 'Financial models and projections' },
            { name: 'fundraising', priority: 9, reason: 'Pitch decks and investor materials' }
        ],
        technicalRequirements: []
    },
    'marketing-campaign': {
        recommendedAgents: [
            { name: 'copywriter', priority: 10, reason: 'Campaign copy and messaging' },
            { name: 'product-manager', priority: 9, reason: 'Campaign strategy and targeting' },
            { name: 'designer', priority: 6, reason: 'Creative assets and visuals' },
            { name: 'cfo', priority: 5, reason: 'Marketing budget and ROI analysis' },
            { name: 'docs-writer', priority: 4, reason: 'Campaign briefs and guidelines' },
            { name: 'performance-optimizer', priority: 3, reason: 'Conversion optimization' }
        ],
        recommendedSkills: [
            { name: 'financial-planning', priority: 6, reason: 'Campaign ROI modeling' }
        ],
        technicalRequirements: []
    },
    'content-creation': {
        recommendedAgents: [
            { name: 'copywriter', priority: 10, reason: 'Writing and content strategy' },
            { name: 'docs-writer', priority: 6, reason: 'Structured content and guides' },
            { name: 'designer', priority: 4, reason: 'Visual content and layouts' },
            { name: 'product-manager', priority: 3, reason: 'Content planning and calendars' }
        ],
        recommendedSkills: [],
        technicalRequirements: []
    },
    'research-analysis': {
        recommendedAgents: [
            { name: 'architect', priority: 9, reason: 'Analytical frameworks' },
            { name: 'docs-writer', priority: 6, reason: 'Research reports and findings' },
            { name: 'product-manager', priority: 6, reason: 'Research planning and synthesis' },
            { name: 'database-specialist', priority: 4, reason: 'Data analysis patterns' },
            { name: 'copywriter', priority: 3, reason: 'Clear communication of insights' }
        ],
        recommendedSkills: [],
        technicalRequirements: []
    },
    'project-docs': {
        recommendedAgents: [
            { name: 'docs-writer', priority: 10, reason: 'Documentation best practices' },
            { name: 'architect', priority: 9, reason: 'System and process design' },
            { name: 'product-manager', priority: 6, reason: 'Requirements and specs' },
            { name: 'copywriter', priority: 4, reason: 'Clear and engaging writing' },
            { name: 'code-reviewer', priority: 3, reason: 'Technical accuracy' }
        ],
        recommendedSkills: [],
        technicalRequirements: []
    },
    'custom': {
        recommendedAgents: [
            { name: 'code-reviewer', priority: 4, reason: 'Quality assurance' },
            { name: 'debugger', priority: 4, reason: 'Problem solving' },
            { name: 'docs-writer', priority: 3, reason: 'Documentation' },
            { name: 'architect', priority: 3, reason: 'System design' },
            { name: 'product-manager', priority: 3, reason: 'Requirements definition' }
        ],
        recommendedSkills: [],
        technicalRequirements: []
    }
};
//# sourceMappingURL=presets.js.map