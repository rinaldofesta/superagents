/**
 * Proposer — generates config change proposals from detected deltas
 *
 * Rules-based (no AI calls): maps dependency changes to skill/agent suggestions
 */
// Known dependency → skill template mappings
const DEP_TO_SKILL = {
    'prisma': 'prisma',
    '@prisma/client': 'prisma',
    'drizzle-orm': 'drizzle',
    'vitest': 'vitest',
    'tailwindcss': 'tailwind',
    '@tailwindcss/vite': 'tailwind',
    'next': 'nextjs',
    'react': 'react',
    'vue': 'vue',
    'svelte': 'svelte',
    'express': 'express',
    'fastify': 'fastify',
    '@nestjs/core': 'nestjs',
    'typescript': 'typescript',
    'zod': 'zod',
    'trpc': 'trpc',
    '@trpc/server': 'trpc',
    'stripe': 'stripe',
    'next-auth': 'auth',
    '@auth/core': 'auth',
    'supabase': 'supabase',
    '@supabase/supabase-js': 'supabase',
};
// Pattern → agent mappings
const PATTERN_TO_AGENT = {
    'api-routes': 'backend-engineer',
    'tests': 'testing-specialist',
    'components': 'frontend-engineer',
    'middleware': 'backend-engineer',
    'models': 'backend-engineer',
};
export function proposeChanges(deltas, _currentAnalysis, existingAgents, existingSkills) {
    const proposals = [];
    for (const delta of deltas) {
        // New dependency → suggest skill
        if (delta.field === 'dependencies' || delta.field === 'devDependencies') {
            if (delta.after !== '(none)') {
                const addedDeps = delta.after.split(', ');
                for (const dep of addedDeps) {
                    const skillName = DEP_TO_SKILL[dep];
                    if (skillName && !existingSkills.includes(skillName)) {
                        proposals.push({
                            type: 'add-skill',
                            name: skillName,
                            reason: `New dependency "${dep}" detected`,
                        });
                    }
                }
            }
            // Removed dependency → suggest skill removal
            if (delta.before !== '(none)') {
                const removedDeps = delta.before.split(', ');
                for (const dep of removedDeps) {
                    const skillName = DEP_TO_SKILL[dep];
                    if (skillName && existingSkills.includes(skillName)) {
                        proposals.push({
                            type: 'remove-skill',
                            name: skillName,
                            reason: `Dependency "${dep}" was removed`,
                        });
                    }
                }
            }
        }
        // New pattern → suggest agent
        if (delta.field === 'detectedPatterns' && delta.after !== '(none)') {
            const newPatterns = delta.after.split(', ');
            for (const pattern of newPatterns) {
                const agentName = PATTERN_TO_AGENT[pattern];
                if (agentName && !existingAgents.includes(agentName)) {
                    proposals.push({
                        type: 'add-agent',
                        name: agentName,
                        reason: `New "${pattern}" pattern detected in codebase`,
                    });
                }
            }
        }
        // Framework change → update CLAUDE.md
        if (delta.field === 'framework') {
            proposals.push({
                type: 'update-claude-md',
                name: 'CLAUDE.md',
                reason: `Framework changed from ${delta.before} to ${delta.after}`,
            });
        }
        // Command change → update CLAUDE.md
        if (delta.field.endsWith('Command')) {
            proposals.push({
                type: 'update-claude-md',
                name: 'CLAUDE.md',
                reason: `${delta.label} changed`,
            });
        }
    }
    // Deduplicate update-claude-md proposals
    const seen = new Set();
    return proposals.filter(p => {
        const key = `${p.type}:${p.name}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
//# sourceMappingURL=proposer.js.map