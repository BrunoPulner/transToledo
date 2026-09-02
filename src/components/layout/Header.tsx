"use client";

import {
  LockKeyhole,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { useTheme } from "@teispace/next-themes";

import { useEffect, useState } from "react";

const navigation = [
  {
    label: "Início",
    href: "/",
    id: "inicio",
  },
  {
    label: "Sobre",
    href: "/#sobre",
    id: "sobre",
  },
  {
    label: "Frota",
    href: "/frota",
    id: "frota",
  },
  {
    label: "Destinos",
    href: "/destinos",
    id: "destinos",
  },
  {
    label: "Contato",
    href: "/contato",
    id: "contato",
  },
];

export function Header() {
  const pathname = usePathname();

  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [activeSection, setActiveSection] =
    useState("inicio");

  /*
   * ESTADO DA AUTENTICAÇÃO
   */
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  /*
   * VERIFICA SE EXISTE SESSÃO
   * ADMINISTRATIVA VÁLIDA
   */
  useEffect(() => {
    let cancelled = false;

    async function checkAuthentication() {
      try {
        const response = await fetch(
          "/api/auth/status",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setIsAuthenticated(false);
          }

          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setIsAuthenticated(
            data.authenticated === true
          );
        }
      } catch (error) {
        console.error(
          "Erro ao verificar autenticação:",
          error
        );

        if (!cancelled) {
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingAuth(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  /*
   * MONTAGEM + SCROLL DO HEADER
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /*
   * IDENTIFICA QUAL SECTION DA HOME
   * ESTÁ SENDO EXIBIDA
   */
  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const sobreSection =
      document.getElementById("sobre");

    if (!sobreSection) {
      return;
    }

    const handleSectionScroll = () => {
      const sobreTop =
        sobreSection.getBoundingClientRect().top;

      if (sobreTop <= 180) {
        setActiveSection("sobre");
      } else {
        setActiveSection("inicio");
      }
    };

    handleSectionScroll();

    window.addEventListener(
      "scroll",
      handleSectionScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleSectionScroll
      );
    };
  }, [pathname]);

  /*
   * BLOQUEIA SCROLL QUANDO
   * MENU MOBILE ESTIVER ABERTO
   */
  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /*
   * VERIFICA ITEM ATIVO
   */
  function isActive(
    href: string,
    id: string
  ) {
    if (pathname === "/") {
      if (id === "inicio") {
        return activeSection === "inicio";
      }

      if (id === "sobre") {
        return activeSection === "sobre";
      }

      return false;
    }

    if (href.startsWith("/#")) {
      return false;
    }

    return pathname.startsWith(href);
  }

  function handleNavigation(id: string) {
    setActiveSection(id);
    setMenuOpen(false);
  }

  /*
   * DESTINO DA ÁREA ADMINISTRATIVA
   */
  const adminHref = isAuthenticated
    ? "/admin/dashboard"
    : "/admin";

  /*
   * TEXTO DO BOTÃO
   */
  const adminLabel = isAuthenticated
    ? "Painel"
    : "Área privada";

  return (
    <>
      {/* HEADER */}
      <header
  className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
    scrolled
      ? "bg-black/80 shadow-md shadow-black/20 backdrop-blur-xl"
      : "bg-transparent"
  }`}
>
        <div className="mx-auto flex h-28 w-full max-w-375 items-center justify-between px-5 lg:h-28 lg:px-10">
          {/* LOGO */}
          <Link
            href="/"
            className="relative z-50 flex items-center"
            onClick={() =>
              handleNavigation("inicio")
            }
            aria-label="Ir para o início"
          >
            <Image
              src="/images/logo/logo_semfundo_att.png"
              alt="TransToledo Transportes"
              width={320}
              height={120}
              sizes="(max-width: 1024px) 180px, 200px"
              className="h-auto w-45 object-contain lg:w-50"
            />
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden items-center gap-9 lg:flex">
            {navigation.map((item) => {
              const active = isActive(
                item.href,
                item.id
              );

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() =>
                    handleNavigation(item.id)
                  }
                  className={`group relative py-3 text-sm font-medium transition-colors duration-300 ${
                    active
                      ? "text-yellow-500"
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

          {/* AÇÕES DESKTOP */}
          <div className="hidden items-center gap-3 lg:flex">
            {/* TEMA */}
            <button
              type="button"
              onClick={() =>
                setTheme(
                  resolvedTheme === "dark"
                    ? "light"
                    : "dark"
                )
              }
              className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition duration-300 hover:border-yellow-400/50 hover:bg-white/10 hover:text-yellow-400"
              aria-label="Alterar tema"
            >
              {mounted &&
                (resolvedTheme === "dark" ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                ))}
            </button>

            {/* ÁREA ADMINISTRATIVA */}
            {!checkingAuth && (
              <Link
                href={adminHref}
                className="flex items-center gap-2 rounded-full border border-yellow-400/70 px-5 py-3 text-sm font-semibold text-yellow-400 transition duration-300 hover:bg-yellow-400 hover:text-black"
              >
                <LockKeyhole size={16} />

                {adminLabel}
              </Link>
            )}
          </div>

          {/* BOTÃO MOBILE */}
          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (value) => !value
              )
            }
            className="relative z-50 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-md transition duration-300 hover:border-yellow-400/40 hover:text-yellow-400 lg:hidden"
            aria-label={
              menuOpen
                ? "Fechar menu"
                : "Abrir menu"
            }
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
        <div className="flex min-h-dvh flex-col items-center justify-center px-6 pt-24">
          {/* NAVEGAÇÃO */}
          <nav className="flex w-full max-w-sm flex-col items-center">
            {navigation.map((item) => {
              const active = isActive(
                item.href,
                item.id
              );

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() =>
                    handleNavigation(item.id)
                  }
                  className="group relative flex w-full items-center justify-center py-4 text-center font-(family-name:--font-montserrat) text-2xl font-bold"
                >
                  <span
                    className={`relative transition-colors duration-300 ${
                      active
                        ? "text-yellow-400"
                        : "text-white"
                    }`}
                  >
                    {item.label}

                    <span
                      className={`absolute -bottom-2 left-1/2 h-0.5 -translate-x-1/2 bg-yellow-400 transition-all duration-300 ${
                        active
                          ? "w-full"
                          : "w-0"
                      }`}
                    />
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* ÁREA ADMINISTRATIVA MOBILE */}
          {!checkingAuth && (
            <Link
              href={adminHref}
              onClick={() =>
                setMenuOpen(false)
              }
              className="mt-9 flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-7 py-3 text-sm font-bold text-black transition duration-300 hover:scale-[1.03] hover:bg-yellow-300"
            >
              <LockKeyhole size={16} />

              {adminLabel}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}