"use client";

import {
  ArrowLeft,
  BusFront,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Route,
  X,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase/client";

const navigation = [
  {
    label: "Início",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Viagens",
    href: "/admin/viagens",
    icon: Route,
  },
  {
    label: "Frotas",
    href: "/admin/frota",
    icon: BusFront,
  },
  {
    label: "Agenda",
    href: "/admin/agenda",
    icon: CalendarDays,
  },
  {
    label: "Orçamentos",
    href: "/admin/orcamentos",
    icon: ClipboardList,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  function isActive(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      /*
       * 1. REMOVE A SESSÃO DO FIREBASE
       * NO NAVEGADOR
       */
      await signOut(auth);

      /*
       * 2. REMOVE NOSSO COOKIE HTTPONLY
       */
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível encerrar a sessão."
        );
      }

      /*
       * 3. VOLTA PARA A TELA DE LOGIN
       *
       * Usamos navegação completa para
       * garantir que o servidor receba o
       * estado atualizado do cookie.
       */
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/admin");
    } catch (error) {
      console.error(
        "Erro ao sair da conta:",
        error
      );

      /*
       * Mesmo se o signOut do Firebase
       * apresentar algum problema, tentamos
       * remover a sessão do servidor.
       */
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // Ignora erro secundário.
      }

      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/admin");
    }
  }

  return (
    <>
      {/* HEADER MOBILE */}
      <div className="fixed left-0 top-0 z-40 flex h-18 w-full items-center justify-between border-b border-white/10 bg-[#090b0d]/95 px-5 backdrop-blur-xl lg:hidden">
        <Link
          href="/admin/dashboard"
          onClick={() =>
            setMenuOpen(false)
          }
          aria-label="Ir para o dashboard"
        >
          <Image
            src="/images/logo/logo_semfundo_att.png"
            alt="TransToledo Transportes"
            width={180}
            height={70}
            className="h-auto w-32 object-contain"
          />
        </Link>

        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              (value) => !value
            )
          }
          className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-yellow-400/30 hover:text-yellow-400"
          aria-label={
            menuOpen
              ? "Fechar menu"
              : "Abrir menu"
          }
        >
          {menuOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-30
          flex
          w-72
          flex-col
          border-r
          border-white/10
          bg-[#090b0d]
          transition-transform
          duration-300

          ${
            menuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >
        {/* LOGO */}
        <div className="flex h-28 items-center justify-center border-b border-white/10 px-7">
          <Link
            href="/"
            onClick={() =>
              setMenuOpen(false)
            }
            aria-label="Ir para o dashboard"
          >
            <Image
              src="/images/logo/logo_semfundo_att.png"
              alt="TransToledo Transportes"
              width={220}
              height={85}
              className="h-auto w-40 object-contain"
            />
          </Link>
        </div>

        {/* IDENTIFICAÇÃO */}
        <div className="px-6 pb-5 pt-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-400">
            Administração
          </p>

          <p className="mt-2 text-sm text-white/40">
            Gerenciamento TransToledo
          </p>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setMenuOpen(false)
                }
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-medium
                  transition-all
                  duration-300

                  ${
                    active
                      ? "bg-yellow-400 text-black"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon size={19} />

                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* AÇÕES INFERIORES */}
        <div className="border-t border-white/10 p-4">
          {/* RETORNAR AO SITE */}
          <Link
            href="/"
            onClick={() =>
              setMenuOpen(false)
            }
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/45 transition hover:bg-white/5 hover:text-yellow-400"
          >
            <ArrowLeft size={18} />

            Retornar ao site
          </Link>

          {/* SAIR */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <LogOut size={18} />
            )}

            {loggingOut
              ? "Saindo..."
              : "Sair"}
          </button>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {menuOpen && (
        <button
          type="button"
          onClick={() =>
            setMenuOpen(false)
          }
          aria-label="Fechar menu"
          className="fixed inset-0 z-20 bg-black/70 lg:hidden"
        />
      )}
    </>
  );
}