import { Github, ExternalLink } from "lucide-react";
import Image from "next/image";
import { LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/favicon.svg"
              alt="SuperAgents"
              width={32}
              height={32}
            />
            <span className="font-semibold">SuperAgents</span>
            <span className="text-muted-foreground text-sm">by</span>
            <a
              href={LINKS.playnew}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline">
              Play New
            </a>
          </div>

          <div className="flex items-center gap-6">
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href={LINKS.issues}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="w-4 h-4" />
              Issues
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>
            Expert-backed AI agents for Claude Code. Open source. MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
