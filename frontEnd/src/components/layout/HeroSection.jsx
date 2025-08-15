// src/components/layout/HeroSection.jsx
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePrefersReducedMotion } from "@chakra-ui/react";

export const HeroSection = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const scrollToNext = () => {
    const el = document.getElementById("recent-blogs");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const staticTagline =
    "Here you'll find effective fitness advice to reach your goals. Eat clean. Train hard. Build the physique you want.";

  const typeSequence = useMemo(
    () => [
      "Here you'll find effective fitness advice to reach your goals. 💪",
      2000,
      "Working out won't hurt you—being undertrained might. 🏋️‍♂️",
      2000,
      "Eat clean. Train hard. Build the physique you want. 🥗🔥",
      2000,
      "Stop scrolling. Start showing up. Do the work. 🔥🔥🔥",
      2000,
    ],
    []
  );

  const motionProps = prefersReducedMotion
    ? { initial: false, animate: false, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" },
      };

  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden bg-black text-white">
      {prefersReducedMotion ? (
        <img
          src="/images/gym-bg.jpg"
          alt="Gym background"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover z-0 brightness-[0.35]"
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/gym-bg.jpg"
          className="absolute inset-0 w-full h-full object-cover z-0 brightness-[0.35]"
          aria-hidden
        >
          <source src="/videos/gym-bg.mp4" type="video/mp4" />
          <img
            src="/images/gym-bg.jpg"
            alt="Gym background"
            className="w-full h-full object-cover"
          />
        </video>
      )}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.25),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.25),transparent_40%)]" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/50 via-black/30 to-black/80" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100svh] px-4">
        <motion.div
          {...motionProps}
          className="w-full max-w-4xl mx-auto text-center pt-24 md:pt-28"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              Gym Advice
            </span>
          </h1>

          <div className="mt-4 md:mt-6 w-full text-center">
            {prefersReducedMotion ? (
              <p className="mx-auto max-w-2xl text-center text-base sm:text-lg md:text-xl text-white/90 leading-relaxed">
                {staticTagline}
              </p>
            ) : (
              <TypeAnimation
                sequence={typeSequence}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="inline-block align-top mx-auto max-w-2xl text-center text-base sm:text-lg md:text-xl text-white/90 leading-relaxed"
              />
            )}
          </div>

          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/blogs">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-2xl shadow-lg hover:translate-x-[2px] hover:-translate-y-[1px] transition-all"
              >
                Explore Blogs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/create">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 rounded-2xl"
              >
                Create a Post
              </Button>
            </Link>
          </div>

          <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-white/80">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
              1k+ articles
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
              5k+ members
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
              Updated weekly
            </span>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <button
        onClick={scrollToNext}
        aria-label="Scroll to recent blogs"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 hover:bg-white/20 transition-colors p-2 text-white/80 backdrop-blur-sm"
      >
        <span className={prefersReducedMotion ? "" : "animate-bounce"}>
          <ChevronDown size={24} />
        </span>
      </button>
    </section>
  );
};
