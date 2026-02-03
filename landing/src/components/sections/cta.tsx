"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Github } from "lucide-react";
import { ShaderBackground } from "@/components/ui/shader-background";
import { buttonVariants } from "@/components/ui/button";
import { LINKS } from "@/lib/constants";

export function CTA() {
  const [copied, setCopied] = useState(false);
  const command = "curl -fsSL https://superagents.playnew.com/install.sh | bash";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ShaderBackground className="py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Stop configuring.{" "}
            <span className="text-gradient">Start building.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            One command. Expert-level AI agents. Your codebase, transformed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <button
                onClick={handleCopy}
                className="relative flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-lg hover:bg-card/80 transition-colors"
              >
                <code className="font-mono text-lg text-foreground">
                  {command}
                </code>
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>

            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <Github className="h-5 w-5" />
              Star on GitHub
            </a>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Open source and free to use.{" "}
            <a
              href={LINKS.issues}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Report issues
            </a>
          </p>
        </motion.div>
      </div>
    </ShaderBackground>
  );
}
