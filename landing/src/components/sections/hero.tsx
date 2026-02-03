"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import Image from "next/image";
import { ShaderBackground } from "@/components/ui/shader-background";
import { Button, buttonVariants } from "@/components/ui/button";

export function Hero() {
  const [copied, setCopied] = useState(false);
  const command = "curl -fsSL https://superagents.playnew.com/install.sh | bash";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ShaderBackground className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8">
            <Image
              src="/favicon.svg"
              alt="SuperAgents"
              width={16}
              height={16}
            />
            <span className="text-sm text-muted-foreground">by Play New</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          Build with <span className="text-highlight">AI Agents</span>
          <br />
          That Think Like Experts
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Transform your Claude Code into an agentic powerhouse. Principles from{" "}
          <span className="text-foreground">Uncle Bob</span>,{" "}
          <span className="text-foreground">Dan Abramov</span>,{" "}
          <span className="text-foreground">Kent Beck</span>. Built in.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500" />
            <div className="relative flex items-center gap-3 px-6 py-3 bg-card border border-border rounded-lg">
              <code className="font-mono text-lg text-foreground">
                {command}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8">
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <a
            href="https://github.com/rinaldofesta/superagents"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "lg" })}>
            View on GitHub
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
          {[
            { value: "15", label: "Expert Agents" },
            { value: "16", label: "Framework Skills" },
            { value: "20+", label: "Tech Detected" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gradient">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </ShaderBackground>
  );
}
