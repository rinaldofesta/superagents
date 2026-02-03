export const AGENTS = [
  {
    name: "backend-engineer",
    expert: "Uncle Bob",
    domain: "Clean Architecture & SOLID",
    icon: "Server",
  },
  {
    name: "frontend-specialist",
    expert: "Dan Abramov",
    domain: "React Patterns",
    icon: "Layout",
  },
  {
    name: "testing-specialist",
    expert: "Kent Beck",
    domain: "Test-Driven Development",
    icon: "TestTube",
  },
  {
    name: "architect",
    expert: "Martin Fowler",
    domain: "Enterprise Patterns",
    icon: "Building2",
  },
  {
    name: "code-reviewer",
    expert: "Google Engineering",
    domain: "Code Review Practices",
    icon: "GitPullRequest",
  },
  {
    name: "debugger",
    expert: "Julia Evans",
    domain: "Systematic Debugging",
    icon: "Bug",
  },
  {
    name: "devops-specialist",
    expert: "Kelsey Hightower",
    domain: "Infrastructure Patterns",
    icon: "Cloud",
  },
  {
    name: "security-analyst",
    expert: "OWASP Foundation",
    domain: "Security Best Practices",
    icon: "Shield",
  },
  {
    name: "database-specialist",
    expert: "Martin Kleppmann",
    domain: "Data-Intensive Apps",
    icon: "Database",
  },
  {
    name: "api-designer",
    expert: "Stripe",
    domain: "API Design Principles",
    icon: "Webhook",
  },
  {
    name: "docs-writer",
    expert: "Divio",
    domain: "Documentation System",
    icon: "FileText",
  },
  {
    name: "performance-optimizer",
    expert: "Addy Osmani",
    domain: "Web Performance",
    icon: "Zap",
  },
  {
    name: "copywriter",
    expert: "Paolo Gervasi",
    domain: "Conversion Copywriting",
    icon: "PenTool",
  },
  {
    name: "designer",
    expert: "Sarah Corti",
    domain: "UI/UX Design",
    icon: "Palette",
  },
  {
    name: "product-manager",
    expert: "Marty Cagan",
    domain: "Product Discovery",
    icon: "Target",
  },
] as const;

export const SKILLS = [
  "typescript",
  "nodejs",
  "react",
  "nextjs",
  "vue",
  "tailwind",
  "prisma",
  "drizzle",
  "express",
  "supabase",
  "vitest",
  "graphql",
  "docker",
  "python",
  "fastapi",
  "mcp",
] as const;

export const FEATURES = [
  {
    title: "Expert DNA",
    description:
      "15 agents. Each one built on proven principles from industry legends. Their expertise, your code.",
    icon: "Users",
  },
  {
    title: "Reads Your Code",
    description:
      "Detects frameworks, patterns, dependencies. 20+ technologies recognized automatically.",
    icon: "Scan",
  },
  {
    title: "Goal-Driven",
    description:
      "Tell it what you're building. It recommends the right agents. No guesswork.",
    icon: "Target",
  },
  {
    title: "AI-Native",
    description:
      "Claude generates configurations tailored to your codebase. Not templates. Intelligence.",
    icon: "Sparkles",
  },
  {
    title: "Framework Skills",
    description:
      "TypeScript, React, Next.js, Node.js, Prisma. 16 skills ready to deploy.",
    icon: "Boxes",
  },
  {
    title: "Instant Results",
    description:
      "Smart caching means fast generations. Run it once, iterate quickly.",
    icon: "Zap",
  },
] as const;

export const STEPS = [
  {
    step: 1,
    title: "Run it",
    description: "One command. In your project directory.",
    code: "curl -fsSL superagents.playnew.com/install.sh | bash",
  },
  {
    step: 2,
    title: "Define your goal",
    description: "What are you building? API, frontend, full-stack?",
    code: null,
  },
  {
    step: 3,
    title: "Pick your agents",
    description: "Choose from smart recommendations. Or select your own.",
    code: null,
  },
  {
    step: 4,
    title: "Build",
    description: "Your .claude/ folder is ready. Start shipping.",
    code: null,
  },
] as const;

export const LINKS = {
  github: "https://github.com/rinaldofesta/superagents",
  issues: "https://github.com/rinaldofesta/superagents/issues",
  playnew: "https://playnew.com",
} as const;
