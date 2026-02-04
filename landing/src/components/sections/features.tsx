"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  PlusCircle,
  Users,
  Scan,
  Target,
  Sparkles,
  Boxes,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  visual: React.ReactNode;
}

const features: FeatureItem[] = [
  {
    icon: Users,
    title: "Expert DNA",
    description:
      "15 agents built on proven principles from Uncle Bob, Dan Abramov, Kent Beck, and other industry legends. Their decades of wisdom, embedded in your workflow.",
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "Uncle Bob", image: "/uncle-bob.png" },
            { name: "Dan Abramov", image: "/dan-abramov.png" },
            { name: "Kent Beck", image: "/kent-beck.png" },
          ].map((expert, i) => (
            <motion.div
              key={expert.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30">
                <Image
                  src={expert.image}
                  alt={expert.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-muted-foreground text-center">
                {expert.name}
              </span>
            </motion.div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">+12 more experts</p>
      </div>
    ),
  },
  {
    icon: Scan,
    title: "Reads Your Code",
    description:
      "Automatically detects frameworks, patterns, and dependencies. Next.js, React, TypeScript, Node.js, and 20+ more technologies recognized instantly.",
    visual: (
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              "Next.js",
              "React",
              "TypeScript",
              "Node.js",
              "Tailwind",
              "Prisma",
              "Vitest",
              "Docker",
            ].map((tech, i) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="px-3 py-2 rounded-lg bg-card border border-border text-xs font-mono text-center">
                {tech}
              </motion.div>
            ))}
          </div>
          <motion.div
            className="absolute inset-0 border-2 border-primary rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    ),
  },
  {
    icon: Target,
    title: "Goal-Driven",
    description:
      "Tell it what you're building—API, frontend, full-stack—and it recommends the right agents. No guesswork. Just results.",
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        {["Full-stack App", "API Backend", "Frontend SPA"].map((goal, i) => (
          <motion.div
            key={goal}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={cn(
              "px-6 py-3 rounded-full border text-sm font-medium transition-colors",
              i === 0
                ? "bg-primary/20 border-primary text-primary"
                : "bg-card border-border text-muted-foreground"
            )}>
            {i === 0 && <span className="mr-2">●</span>}
            {goal}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    icon: Sparkles,
    title: "AI-Native",
    description:
      "Claude generates configurations tailored to your codebase patterns. Not static templates. Real intelligence that adapts.",
    visual: (
      <div className="flex items-center justify-center h-full">
        <motion.div
          className="relative w-32 h-32"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <motion.div
              key={deg}
              className="absolute w-3 h-3 rounded-full bg-primary"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${deg}deg) translateY(-50px)`,
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    icon: Boxes,
    title: "Framework Skills",
    description:
      "TypeScript, React, Next.js, Node.js, Prisma, and more. 16 pre-built skills ready to deploy. Best practices baked in.",
    visual: (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">16 skills included</p>
      </div>
    ),
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Smart caching means fast generations. Run it once, iterate quickly. Your .claude/ folder ready in seconds.",
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}>
          <motion.div
            className="h-2 bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-sm text-primary font-mono">
          Done in 2.3s
        </motion.p>
      </div>
    ),
  },
];

interface ControlsProps {
  handleNext: () => void;
  handlePrevious: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
}

const Controls = ({
  handleNext,
  handlePrevious,
  isPreviousDisabled,
  isNextDisabled,
}: ControlsProps) => {
  return (
    <div className="hidden flex-col items-start gap-4 lg:flex">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={handlePrevious}
        disabled={isPreviousDisabled}>
        <ChevronUp className="w-5 h-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={handleNext}
        disabled={isNextDisabled}>
        <ChevronDown className="w-5 h-5" />
      </Button>
    </div>
  );
};

interface FeatureCardProps {
  feature: FeatureItem;
  isActive: boolean;
  onClick: () => void;
}

const FeatureCard = ({ feature, isActive, onClick }: FeatureCardProps) => {
  const Icon = feature.icon;

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        layout
        transition={{
          layout: { duration: 0.4, ease: "easeOut" },
        }}
        className="flex w-full cursor-pointer items-start gap-4 overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 md:w-fit md:max-w-md"
        onClick={onClick}>
        {isActive ? (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key={`feature-active-${feature.title}`}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            className="p-5 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold">{feature.title}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key={`feature-inactive-${feature.title}`}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className={cn(
              "flex items-center gap-3 py-3 px-4",
              !isActive && "h-0 w-0 md:h-auto md:w-auto"
            )}>
            <PlusCircle
              className="w-5 h-5 text-muted-foreground"
              strokeWidth={1.5}
            />
            <span className="font-medium text-sm">{feature.title}</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleNext = () => {
    setDirection(1);
    if (activeIndex !== features.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setDirection(-1);
    if (activeIndex !== 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleFeatureClick = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const xOffset = !isMobile ? 50 : 15;
  const yOffset = !isMobile ? 15 : 5;
  const scale = !isMobile ? 0.6 : 0.8;

  const variants = {
    initial: (dir: number) => ({
      opacity: 0,
      scale: scale,
      filter: "blur(20px)",
      x: dir * xOffset + "%",
      y: dir * yOffset + "%",
    }),
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      x: 0,
      y: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: scale,
      x: dir * -xOffset + "%",
      y: dir * -yOffset + "%",
      filter: "blur(20px)",
    }),
  };

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Why <span className="text-gradient">SuperAgents</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Your codebase. Analyzed. Your agents. Configured. Automatically.
          </p>
        </motion.div>

        <div className="relative min-h-[350px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] w-full overflow-hidden rounded-3xl bg-muted/30 border border-border/50 p-4 sm:p-6 md:p-8">
          {/* Desktop: Feature cards on left */}
          <div className="relative z-10 hidden md:flex items-center gap-6">
            <Controls
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              isPreviousDisabled={activeIndex === 0}
              isNextDisabled={activeIndex === features.length - 1}
            />
            <div className="flex flex-col gap-3">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                  isActive={index === activeIndex}
                  onClick={() => handleFeatureClick(index)}
                />
              ))}
            </div>
          </div>

          {/* Mobile: Swipeable cards at bottom */}
          <div className="absolute bottom-6 left-0 z-10 flex w-full items-end justify-between gap-4 px-4 md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background"
              onClick={handlePrevious}
              disabled={activeIndex === 0}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={`feature-mobile-${activeIndex}`}
                initial={{ opacity: 0, scale: 0.6, x: direction * 50 + "%" }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.6, x: direction * -50 + "%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex-1">
                <FeatureCard
                  feature={features[activeIndex]}
                  isActive={true}
                  onClick={() => {}}
                />
              </motion.div>
            </AnimatePresence>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background"
              onClick={handleNext}
              disabled={activeIndex === features.length - 1}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Visual on right */}
          <div className="absolute top-0 right-0 z-0 flex h-full w-full items-center justify-center md:w-1/2 md:[mask-image:linear-gradient(to_right,transparent,black_30%,black)]">
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={`feature-visual-${activeIndex}`}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={direction}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full h-full flex items-center justify-center p-8">
                {features[activeIndex].visual}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
