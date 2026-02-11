/**
 * ROADMAP.md parser — extracts phases and tasks from markdown
 */
/**
 * Parse ROADMAP.md content into structured phases.
 *
 * Expects `## Phase N: Name` headers and `- [x]`/`- [ ]` task lines.
 */
export function parseRoadmap(content) {
    const phases = [];
    let currentPhase = null;
    for (const line of content.split('\n')) {
        // Match phase headers: ## Phase 1: Foundation
        const phaseMatch = line.match(/^## Phase (\d+):\s*(.+)/);
        if (phaseMatch) {
            if (currentPhase) {
                phases.push(currentPhase);
            }
            currentPhase = {
                number: parseInt(phaseMatch[1], 10),
                name: phaseMatch[2].trim(),
                tasks: []
            };
            continue;
        }
        // Match task lines: - [x] or - [ ]
        const taskMatch = line.match(/^- \[([ xX])\]\s+(.+)/);
        if (taskMatch && currentPhase) {
            currentPhase.tasks.push({
                title: taskMatch[2].trim(),
                done: taskMatch[1].toLowerCase() === 'x'
            });
            continue;
        }
        // Match description lines: two-space indent under a task
        if (line.match(/^ {2}\S/) && currentPhase && currentPhase.tasks.length > 0) {
            const lastTask = currentPhase.tasks[currentPhase.tasks.length - 1];
            if (!lastTask.description) {
                lastTask.description = line.trim();
            }
        }
    }
    // Push last phase
    if (currentPhase) {
        phases.push(currentPhase);
    }
    return phases;
}
//# sourceMappingURL=parser.js.map