"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export function HomeLoading() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const startedAt = Date.now();

    // Apenas para conseguirmos visualizar o loading durante os testes.
    const minimumDuration = 2500;

    const finishLoading = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(minimumDuration - elapsed, 0);

      window.setTimeout(() => {
        setVisible(false);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finishLoading();
      return;
    }

    window.addEventListener("load", finishLoading);

    return () => {
      window.removeEventListener("load", finishLoading);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="fixed inset-0 z-9999 overflow-hidden bg-black"
        >
          {/* VÍDEO DE FUNDO */}
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source
              src="/images/destinations/serra.mp4"
              type="video/mp4"
            />
          </video>

          

          {/* GRADIENTE */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/30" />

          {/* LEVE VINHETA */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.45)_100%)]" />

          {/* CONTEÚDO */}
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6">
            {/* LOGO */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
            >
              <Image
                src="/images/logo/logo_semfundo_att.png"
                alt="TransToledo Transportes"
                width={400}
                height={180}
                className="h-auto w-57.5 object-contain sm:w-70 lg:w-[320px]"
              />
            </motion.div>

            {/* TEXTO */}
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.35,
              }}
              className="mt-8 text-center"
            >
              

              <p className="mt-3 text-xs font-medium tracking-wide text-yellow-400 sm:text-sm">
                Preparando sua próxima viagem
              </p>
            </motion.div>

            {/* LOADING */}
            <div className="relative mt-7 h-0.5 w-52 overflow-hidden rounded-full bg-white/15 sm:w-64">
              <motion.div
                initial={{
                  x: "-100%",
                }}
                animate={{
                  x: "200%",
                }}
                transition={{
                  duration: 1.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-yellow-400 to-transparent"
              />
            </div>

            {/* PONTOS */}
            <motion.div
              animate={{
                opacity: [0.35, 1, 0.35],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
              }}
              className="mt-6 flex items-center gap-2"
            >
              <span className="size-1 rounded-full bg-yellow-400" />
              <span className="size-1 rounded-full bg-yellow-400/60" />
              <span className="size-1 rounded-full bg-yellow-400/30" />
            </motion.div>
          </div>

          {/* LINHA INFERIOR */}
          <motion.div
            initial={{
              scaleX: 0,
            }}
            animate={{
              scaleX: 1,
            }}
            transition={{
              duration: 2.2,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 left-0 z-20 h-0.5 w-full origin-left bg-yellow-400"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}