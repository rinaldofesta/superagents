/**
 * Dry-run preview display
 *
 * Shows what would be generated without making API calls
 */
import pc from 'picocolors';
import { orange } from './colors.js';
import { selectModel, getSkillComplexity, getModelDisplayName, getModelTier, MODEL_COSTS } from '../utils/model-selector.js';
// Rough token estimates based on typical usage
const TOKEN_ESTIMATES = {
    agent: { input: 2000, output: 3000 },
    skill: { input: 1500, output: 2000 },
    'claude-md': { input: 3000, output: 4000 },
    hook: { input: 200, output: 300 }
};
/**
 * Display dry-run preview
 */
export function displayDryRunPreview(context) {
    // Validate context to prevent runtime errors
    if (!context.selectedAgents || !context.selectedSkills) {
        throw new Error('Invalid context: missing selectedAgents or selectedSkills');
    }
    if (!context.goal || !context.goal.description) {
        throw new Error('Invalid context: missing goal information');
    }
    if (!context.codebase || !context.codebase.projectRoot) {
        throw new Error('Invalid context: missing codebase information');
    }
    console.log('\n' + pc.yellow('═'.repeat(60)));
    console.log(pc.yellow(pc.bold('  PREVIEW MODE - Nothing will be written')));
    console.log(pc.yellow('═'.repeat(60)) + '\n');
    // Show project info
    console.log(pc.bold('Your project:'));
    console.log(pc.dim(`  Description: ${context.goal.description}`));
    console.log(pc.dim(`  Type: ${context.goal.category}`));
    console.log(pc.dim(`  Framework: ${context.codebase.framework || 'Not detected'}`));
    console.log('');
    // Show what would be generated
    console.log(pc.bold('What we would generate:\n'));
    // Agents
    console.log(orange('  Agents:'));
    for (const agent of context.selectedAgents) {
        const model = selectModel({
            userSelectedModel: context.selectedModel,
            generationType: 'agent'
        });
        console.log(pc.dim(`    → ${agent}`));
        console.log(pc.dim(`      Model: ${getModelDisplayName(model)}`));
    }
    // Skills
    console.log(orange('\n  Skills:'));
    for (const skill of context.selectedSkills) {
        const complexity = getSkillComplexity(skill);
        const model = selectModel({
            userSelectedModel: context.selectedModel,
            generationType: 'skill',
            complexity
        });
        console.log(pc.dim(`    → ${skill} (${complexity})`));
        console.log(pc.dim(`      Model: ${getModelDisplayName(model)}`));
    }
    // Other files
    console.log(orange('\n  Other files:'));
    const claudeMdModel = selectModel({
        userSelectedModel: context.selectedModel,
        generationType: 'claude-md'
    });
    console.log(pc.dim(`    → CLAUDE.md (Model: ${getModelDisplayName(claudeMdModel)})`));
    console.log(pc.dim('    → settings.json'));
    console.log(pc.dim('    → hooks/context-loader.sh'));
    // Output location
    console.log(pc.bold('\nWhere files will go:'));
    console.log(pc.dim(`  ${context.codebase.projectRoot}/.claude/`));
    // Estimate API calls and cost
    const estimate = estimateCost(context);
    console.log(pc.bold('\nEstimated cost:'));
    console.log(pc.dim(`  API calls: ${estimate.apiCalls}`));
    console.log(pc.dim(`  Tokens: ~${(estimate.inputTokens + estimate.outputTokens).toLocaleString()}`));
    console.log(pc.dim(`  Cost: ~$${estimate.cost.toFixed(4)} USD`));
    // Model breakdown
    console.log(pc.bold('\nModels used:'));
    for (const [tier, count] of Object.entries(estimate.modelBreakdown)) {
        if (count > 0) {
            console.log(pc.dim(`  ${tier}: ${count} call${count > 1 ? 's' : ''}`));
        }
    }
    // Command to run for real
    console.log(pc.bold('\nReady to generate? Run:'));
    console.log(pc.green('  superagents') + '\n');
}
/**
 * Estimate API cost for generation
 */
function estimateCost(context) {
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;
    let apiCalls = 0;
    const modelBreakdown = {
        Haiku: 0,
        Sonnet: 0,
        Opus: 0
    };
    // Agents
    for (const _agent of context.selectedAgents) {
        const model = selectModel({
            userSelectedModel: context.selectedModel,
            generationType: 'agent'
        });
        const tier = getModelTier(model);
        const cost = MODEL_COSTS[tier];
        totalInputTokens += TOKEN_ESTIMATES.agent.input;
        totalOutputTokens += TOKEN_ESTIMATES.agent.output;
        totalCost += (TOKEN_ESTIMATES.agent.input * cost.input + TOKEN_ESTIMATES.agent.output * cost.output) / 1_000_000;
        apiCalls++;
        modelBreakdown[tier.charAt(0).toUpperCase() + tier.slice(1)]++;
    }
    // Skills
    for (const skill of context.selectedSkills) {
        const complexity = getSkillComplexity(skill);
        const model = selectModel({
            userSelectedModel: context.selectedModel,
            generationType: 'skill',
            complexity
        });
        const tier = getModelTier(model);
        const cost = MODEL_COSTS[tier];
        totalInputTokens += TOKEN_ESTIMATES.skill.input;
        totalOutputTokens += TOKEN_ESTIMATES.skill.output;
        totalCost += (TOKEN_ESTIMATES.skill.input * cost.input + TOKEN_ESTIMATES.skill.output * cost.output) / 1_000_000;
        apiCalls++;
        modelBreakdown[tier.charAt(0).toUpperCase() + tier.slice(1)]++;
    }
    // CLAUDE.md
    const claudeMdModel = selectModel({
        userSelectedModel: context.selectedModel,
        generationType: 'claude-md'
    });
    const claudeTier = getModelTier(claudeMdModel);
    const claudeCost = MODEL_COSTS[claudeTier];
    totalInputTokens += TOKEN_ESTIMATES['claude-md'].input;
    totalOutputTokens += TOKEN_ESTIMATES['claude-md'].output;
    totalCost += (TOKEN_ESTIMATES['claude-md'].input * claudeCost.input + TOKEN_ESTIMATES['claude-md'].output * claudeCost.output) / 1_000_000;
    apiCalls++;
    modelBreakdown[claudeTier.charAt(0).toUpperCase() + claudeTier.slice(1)]++;
    return {
        apiCalls,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        cost: totalCost,
        modelBreakdown
    };
}
//# sourceMappingURL=dry-run.js.map