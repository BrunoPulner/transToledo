"use client";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import { FormEvent, useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/lib/firebase/client";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        "Informe seu e-mail e sua senha."
      );

      return;
    }

    try {
      setLoading(true);

      /*
       * 1. AUTENTICA NO FIREBASE
       */
      const credential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      /*
       * 2. PEGA O TOKEN GERADO
       * PELO FIREBASE AUTH
       */
      const idToken =
        await credential.user.getIdToken();

      /*
       * 3. ENVIA O TOKEN PARA
       * NOSSO BACKEND NEXT.JS
       */
      const response = await fetch(
        "/api/auth/session",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            idToken,
          }),
        }
      );

      const data =
        await response.json();

      /*
       * 4. SE O SERVIDOR NÃO
       * CRIOU A SESSÃO
       */
      if (!response.ok) {
        throw new Error(
          data.message ||
            "Não foi possível criar a sessão."
        );
      }

      /*
       * 5. RECARREGAMENTO COMPLETO
       *
       * Isso garante que o novo cookie
       * HttpOnly seja enviado para o
       * Server Component do dashboard.
       */
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(
        "/admin/dashboard"
      );
    } catch (error) {
      console.error(
        "Erro ao fazer login:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#07090b] px-5 py-10 text-white">
      {/* FUNDO */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-yellow-400/8 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-yellow-400/5 blur-3xl" />

      {/* VOLTAR AO SITE */}
      <Link
        href="/"
        className="absolute left-5 top-5 flex items-center gap-2 text-sm text-white/60 transition hover:text-yellow-400 sm:left-8 sm:top-8"
      >
        <ArrowLeft size={17} />

        Voltar ao site
      </Link>

      <section className="relative w-full max-w-md">
        {/* LOGO */}
        <div className="mb-8 flex justify-center">
          <Link
            href="/"
            aria-label="Voltar para a página inicial"
            className="transition duration-300 hover:scale-[1.03]"
          >
            <Image
              src="/images/logo/logo_semfundo_att.png"
              alt="TransToledo Transportes"
              width={280}
              height={110}
              className="h-auto w-52 object-contain"
            />
          </Link>
        </div>

        {/* CARD */}
        <div className="rounded-3xl border border-white/10 bg-white/4 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-yellow-400 text-black">
              <LockKeyhole size={21} />
            </div>

            <h1 className="font-(family-name:--font-montserrat) text-2xl font-bold">
              Área administrativa
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/50">
              Entre com suas credenciais para
              acessar o gerenciamento da
              TransToledo.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                E-mail
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="admin@transtoledo.com.br"
                  autoComplete="email"
                  className="h-13 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/60 focus:bg-white/[0.07]"
                />
              </div>
            </div>

            {/* SENHA */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                Senha
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  className="h-13 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/60 focus:bg-white/[0.07]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white"
                  aria-label={
                    showPassword
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* ERRO */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* ENTRAR */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 font-bold text-black transition duration-300 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />

                  Entrando...
                </>
              ) : (
                <>
                  <LockKeyhole size={18} />

                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          Acesso exclusivo para usuários autorizados.
        </p>
      </section>
    </main>
  );
}