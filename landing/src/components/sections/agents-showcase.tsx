"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  Server,
  Layout,
  TestTube,
  Building2,
  GitPullRequest,
  Bug,
  Cloud,
  Shield,
  Database,
  Webhook,
  FileText,
  Zap,
  PenTool,
  Palette,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { buttonVariants } from "@/components/ui/button";
import { AGENTS } from "@/lib/constants";
import Image from "next/image";

const agentImages = [
  "/agent-1.png",
  "/agent-2.png",
  "/agent-3.png",
  "/agent-4.png",
  "/agent-5.png",
];

const iconMap: Record<string, LucideIcon> = {
  Server,
  Layout,
  TestTube,
  Building2,
  GitPullRequest,
  Bug,
  Cloud,
  Shield,
  Database,
  Webhook,
  FileText,
  Zap,
  PenTool,
  Palette,
  Target,
};

const gradients = [
  "from-[#ff4d00]/20 to-[#ff6620]/20",
  "from-[#ff6620]/20 to-[#ff4d00]/20",
  "from-[#ff4d00]/15 to-[#ff6620]/15",
  "from-[#ff6620]/20 to-[#ff4d00]/15",
  "from-[#ff4d00]/20 to-[#ff6620]/20",
  "from-[#ff6620]/15 to-[#ff4d00]/20",
  "from-[#ff4d00]/15 to-[#ff6620]/15",
  "from-[#ff6620]/20 to-[#ff4d00]/20",
];

export function AgentsShowcase() {
  const [activeAgent, setActiveAgent] = useState<number>(0);
  const isMobile = useIsMobile();
  const displayAgents = isMobile ? AGENTS.slice(0, 5) : AGENTS.slice(0, 8);

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-4">
            Meet the <span className="text-gradient">Agents</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground text-center max-w-lg mb-12">
            15 specialists. Built on decades of engineering wisdom. Ready to
            work.
          </motion.p>

          <div className="flex w-full items-center justify-center gap-1.5 sm:gap-2">
            {displayAgents.map((agent, index) => {
              const Icon = iconMap[agent.icon];
              const gradient = gradients[index % gradients.length];

              return (
                <motion.div
                  key={agent.name}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl border border-border/50",
                    `bg-gradient-to-br ${gradient}`
                  )}
                  initial={{ width: "2.5rem", height: "16rem" }}
                  animate={{
                    width:
                      activeAgent === index
                        ? isMobile
                          ? "10rem"
                          : "20rem"
                        : isMobile
                        ? "2.5rem"
                        : "4rem",
                    height: isMobile ? "16rem" : "22rem",
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  onClick={() => setActiveAgent(index)}
                  onHoverStart={() => setActiveAgent(index)}
                  onTouchStart={() => setActiveAgent(index)}>
                  {agentImages[index % agentImages.length] && (
                    <Image
                      src={agentImages[index % agentImages.length]}
                      alt={agent.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover object-top"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                  <AnimatePresence>
                    {activeAgent !== index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary/70" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {activeAgent === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute flex h-full w-full flex-col items-start justify-end p-4 md:p-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-3 md:mb-4">
                          <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium mb-1">
                          {agent.expert}
                        </p>
                        <h3 className="text-lg md:text-2xl font-bold text-white mb-1">
                          {agent.name}
                        </h3>
                        <p className="text-xs md:text-sm text-white/60">
                          {agent.domain}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              +{AGENTS.length - displayAgents.length} more agents available
            </p>
            <a
              href="https://github.com/Play-New/superagents"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "group rounded-full"
              )}>
              View all agents
              <ArrowRight className="ml-2 h-4 w-4 -rotate-45 transition-all ease-out group-hover:rotate-0" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
