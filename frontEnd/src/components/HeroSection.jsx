import React from "react";
import { Button } from "@/components/ui/button";

import { ArrowRight, Sun, Moon, ChevronDown } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  const scrollToNext = () => {
    const el = document.getElementById("next-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 brightness-[0.3]"
      >
        <source src="/videos/gym-bg.mp4" type="video/mp4" />
        <img
          src="/images/gym-bg.jpg"
          alt="Gym Background"
          className="w-full h-full object-cover"
        />
      </video>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight"
        >
          Welcome to <span className="text-green-400">Gym Advice</span>
        </motion.h1>

        <div className="backdrop-blur-md bg-black/30 p-6 rounded-lg max-w-xl mx-auto">
          <TypeAnimation
            sequence={[
              "Here, you'll find the most valuable and effective fitness advice to help you reach your goals. 💪",
              2000,
              "Working out won’t hurt you, but being too skinny can definitely take a toll on your health 🏋️‍♂️",
              2000,
              "Eat clean. Train hard. Achieve the physique you've always dreamed of 🥗🔥",
              2000,
              "Want to get big like Chris Bumstead or build an aesthetic physique like David Laid? It takes hard work in the gym — scrolling through Instagram won’t get you there. Get up, show up, and put in the work!🔥🔥🔥",
              2000,
            ]}
            wrapper="p"
            speed={50}
            repeat={Infinity}
            className="text-lg sm:text-xl md:text-2xl text-white text-center leading-relaxed"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to={"/blogs"}>
            <Button
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 text-base rounded-2xl shadow-md hover:translate-x-1"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div
        onClick={scrollToNext}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-bounce text-white opacity-70 cursor-pointer"
      >
        <ChevronDown size={28} />
      </div>
    </section>
  );
};
