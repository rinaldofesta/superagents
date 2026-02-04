"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { FileTree, type FileNode } from "@/components/ui/file-tree";
import { CodeBlock, TerminalBlock } from "@/components/ui/code-block";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const fileStructure: FileNode[] = [
  {
    id: ".claude",
    name: ".claude",
    type: "folder",
    children: [
      {
        id: "agents",
        name: "agents",
        type: "folder",
        children: [
          {
            id: "backend-engineer.md",
            name: "backend-engineer.md",
            type: "file",
            content: `# Backend Engineer Agent

Expert: Uncle Bob (Robert C. Martin)
Domain: Clean Architecture & SOLID Principles

## Instructions

You are a backend engineer who follows Clean Architecture principles.
Apply SOLID principles to every design decision:

- **Single Responsibility**: Each module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable
- **Interface Segregation**: Many specific interfaces > one general
- **Dependency Inversion**: Depend on abstractions, not concretions

## Code Review Checklist

- [ ] Dependencies point inward
- [ ] Business logic is framework-agnostic
- [ ] Use cases are explicit and testable
- [ ] Entities contain enterprise business rules`,
          },
          {
            id: "frontend-specialist.md",
            name: "frontend-specialist.md",
            type: "file",
            content: `# Frontend Specialist Agent

Expert: Dan Abramov
Domain: React Patterns & State Management

## Instructions

You are a frontend specialist following React best practices.
Focus on component composition and unidirectional data flow:

- Prefer composition over inheritance
- Lift state up when needed
- Use hooks for reusable logic
- Keep components focused and small

## Principles

1. **Data flows down**: Props are read-only
2. **Events flow up**: Callbacks for state changes
3. **Single source of truth**: Minimal state
4. **Derived state**: Compute, don't store`,
          },
          {
            id: "testing-specialist.md",
            name: "testing-specialist.md",
            type: "file",
            content: `# Testing Specialist Agent

Expert: Kent Beck
Domain: Test-Driven Development

## Instructions

You follow TDD methodology strictly:

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve without changing behavior

## Testing Philosophy

- Tests are documentation
- Fast feedback loops matter
- Test behavior, not implementation
- One assertion per test (ideally)`,
          },
        ],
      },
      {
        id: "skills",
        name: "skills",
        type: "folder",
        children: [
          {
            id: "typescript.md",
            name: "typescript.md",
            type: "file",
            content: `# TypeScript Skill

## Configuration

Use strict mode with these compiler options:
- strict: true
- noImplicitAny: true
- strictNullChecks: true

## Best Practices

- Prefer interfaces for public APIs
- Use type for unions and intersections
- Avoid any, use unknown for truly unknown
- Leverage type inference where clear`,
          },
          {
            id: "react.md",
            name: "react.md",
            type: "file",
            content: `# React Skill

## Component Patterns

- Functional components with hooks
- Custom hooks for shared logic
- Compound components for flexibility
- Render props when needed

## Performance

- Use React.memo for expensive renders
- useMemo for expensive computations
- useCallback for stable references`,
          },
        ],
      },
      {
        id: "CLAUDE.md",
        name: "CLAUDE.md",
        type: "file",
        content: `# Project Configuration

## Project Overview

This is a Next.js 15 application with TypeScript.
Framework: React 19 with App Router
Styling: Tailwind CSS v4

## Available Agents

- backend-engineer (Uncle Bob)
- frontend-specialist (Dan Abramov)
- testing-specialist (Kent Beck)

## Available Skills

- typescript
- react

## Coding Standards

Follow the principles defined by the expert-backed agents.
Run tests before committing. Keep code clean.`,
      },
    ],
  },
];

const terminalLines = [
  { type: "input" as const, content: "curl -fsSL superagents.playnew.com/install.sh | bash" },
  { type: "output" as const, content: "" },
  { type: "info" as const, content: "◆ SuperAgents v1.0.0" },
  { type: "output" as const, content: "" },
  { type: "output" as const, content: "? What are you building?" },
  { type: "success" as const, content: "› Full-stack application" },
  { type: "output" as const, content: "" },
  { type: "output" as const, content: "? Select your agents:" },
  { type: "success" as const, content: "✓ backend-engineer (Uncle Bob)" },
  { type: "success" as const, content: "✓ frontend-specialist (Dan Abramov)" },
  { type: "success" as const, content: "✓ testing-specialist (Kent Beck)" },
  { type: "output" as const, content: "" },
  { type: "info" as const, content: "◆ Analyzing codebase..." },
  { type: "info" as const, content: "◆ Detected: Next.js, TypeScript, React" },
  { type: "info" as const, content: "◆ Generating configurations..." },
  { type: "output" as const, content: "" },
  { type: "success" as const, content: "✓ Created .claude/agents/backend-engineer.md" },
  { type: "success" as const, content: "✓ Created .claude/agents/frontend-specialist.md" },
  { type: "success" as const, content: "✓ Created .claude/agents/testing-specialist.md" },
  { type: "success" as const, content: "✓ Created .claude/skills/typescript.md" },
  { type: "success" as const, content: "✓ Created .claude/skills/react.md" },
  { type: "success" as const, content: "✓ Created .claude/CLAUDE.md" },
  { type: "output" as const, content: "" },
  { type: "success" as const, content: "◆ Done! Your agents are ready." },
];

const findFileById = (files: FileNode[], id: string): FileNode | null => {
  for (const file of files) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findFileById(file.children, id);
      if (found) return found;
    }
  }
  return null;
};

export function HowItWorks() {
  const [selectedFileId, setSelectedFileId] = useState("backend-engineer.md");
  const selectedFile = findFileById(fileStructure, selectedFileId);

  return (
    <section className="py-24 px-4 bg-gradient-radial">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How it <span className="text-gradient">works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            One command. Expert-level configurations. See it in action.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-0 rounded-xl overflow-hidden border border-border max-w-full"
        >
          {/* Terminal + File Tree */}
          <div className="bg-neutral-900 border-b lg:border-b-0 lg:border-r border-border">
            {/* Terminal */}
            <div className="border-b border-border">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-neutral-950">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  Terminal
                </span>
              </div>
              <div className="p-3 font-mono text-xs space-y-0.5 max-h-[180px] sm:max-h-[200px] md:max-h-[280px] overflow-y-auto overflow-x-hidden">
                {terminalLines.map((line, i) => (
                  <div key={i} className="flex items-start gap-2 min-w-0">
                    {line.type === "input" && (
                      <>
                        <span className="text-green-500 shrink-0">$</span>
                        <span className="text-foreground truncate">{line.content}</span>
                      </>
                    )}
                    {line.type === "output" && (
                      <span className="text-muted-foreground pl-3">
                        {line.content || "\u00A0"}
                      </span>
                    )}
                    {line.type === "success" && (
                      <span className="text-green-500 pl-3">{line.content}</span>
                    )}
                    {line.type === "info" && (
                      <span className="text-primary pl-3">{line.content}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* File Tree */}
            <div>
              <div className="px-4 py-2 border-b border-border/50 bg-neutral-950">
                <span className="text-xs text-muted-foreground">Explorer</span>
              </div>
              <div className="p-2 max-h-[120px] sm:max-h-[150px] md:max-h-[200px] overflow-y-auto">
                <FileTree
                  files={fileStructure}
                  selectedId={selectedFileId}
                  onSelect={(file) => setSelectedFileId(file.id)}
                  defaultExpanded={[".claude", "agents", "skills"]}
                />
              </div>
            </div>
          </div>

          {/* Code Preview */}
          <div className="bg-card min-h-[250px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[480px]">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm text-foreground truncate">
                  {selectedFile?.name || "Select a file"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">
                .claude/{selectedFile?.name?.includes(".md") ? "agents/" : ""}
                {selectedFile?.name}
              </span>
            </div>
            <div className="p-3 sm:p-4 overflow-auto max-h-[250px] sm:max-h-[350px] lg:max-h-[440px]">
              <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap">
                <code className="text-muted-foreground">
                  {selectedFile?.content || "// Select a file to view"}
                </code>
              </pre>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <a
            href="https://github.com/Play-New/superagents"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "group rounded-full"
            )}
          >
            View documentation
            <ArrowRight className="ml-2 h-4 w-4 -rotate-45 transition-all ease-out group-hover:rotate-0" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
