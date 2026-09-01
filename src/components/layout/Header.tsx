"use client";

import {
  LockKeyhole,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@teispace/next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

const navigation = [
  {
    label: "Início",
    href: "/",
  },
  
  {
    label: "Sobre",
    href: "/#sobre",
  },
  {
    label: "Frota",
    href: "/frota",
  },
  {
    label: "Destinos",
    href: "/destinos",
  },
  {
    label: "Contato",
    href: "/contato",
  },
];

export function Header() {
  const pathname = usePathname();

  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "border-b border-white/10 bg-black/80 shadow-lg shadow-black/10 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-25 w-full max-w-375 items-center justify-between px-5 lg:h-24 lg:px-10">
          {/* LOGO */}
<Link
  href="/"
  className="relative z-50 flex items-center"
  onClick={() => setMenuOpen(false)}
  aria-label="Ir para o início"
>
  <Image
  src="/images/logo/logo_semfundo_att.png"
  alt="TransToledo Transportes"
  width={320}
  height={120}
  priority
  sizes="(max-width: 1024px) 180px, 240px"
  className="h-auto w-45 object-contain lg:w-50 mt-5"
/>
</Link>

          {/* DESKTOP */}
          <nav className="hidden items-center gap-9 lg:flex">
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative py-3 text-sm font-medium transition-colors ${
                    active
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}

                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-yellow-400 transition-all duration-300 ${
                      active
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* AÇÕES */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() =>
  setTheme(
    resolvedTheme === "dark"
      ? "light"
      : "dark"
  )
}
              className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-yellow-400/50 hover:bg-white/10 hover:text-yellow-400"
              aria-label="Alterar tema"
            >
              {mounted &&
  (resolvedTheme === "dark" ? (
    <Sun size={18} />
  ) : (
    <Moon size={18} />
  ))}
            </button>

            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-full border border-yellow-400/70 px-5 py-3 text-sm font-semibold text-yellow-400 transition duration-300 hover:bg-yellow-400 hover:text-black"
            >
              <LockKeyhole size={16} />

              Área privada
            </Link>
          </div>

          {/* MOBILE */}
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="relative z-50 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-md lg:hidden"
            aria-label="Abrir menu"
          >
            {menuOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>
        </div>
      </header>

      {/* MENU MOBILE */}

      <div
        className={`fixed inset-0 z-40 bg-[#07090b] transition-all duration-500 lg:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex min-h-screen flex-col justify-center px-8">
          <nav className="flex flex-col">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`border-b border-white/10 py-5 font-(family-name:--font-montserrat) text-3xl font-bold ${
                  isActive(item.href)
                    ? "text-yellow-400"
                    : "text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/admin"
            onClick={() => setMenuOpen(false)}
            className="mt-10 flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-6 py-4 font-bold text-black"
          >
            <LockKeyhole size={18} />

            Área privada
          </Link>
        </div>
      </div>
    </>
  );
}