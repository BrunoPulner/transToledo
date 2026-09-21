"use client";

import {
  ArrowUp,
  MessageCircle,
  Phone,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

const navigation = [
  {
    label: "Início",
    href: "/#inicio",
  },
  {
    label: "Sobre",
    href: "/#sobre",
  },
  {
    label: "Orçamento",
    href: "/#frota",
  },
  {
    label: "Destinos",
    href: "/#destinos",
  },
];

/*
 * SUBSTITUA PELOS DADOS REAIS
 * DA TRANSTOLEDO
 */
const contact = {
  phoneLabel: "(41) 97705-004",
  phoneNumber: "554197705004",
  whatsappNumber: "554197705004",
};

/*
 * SUBSTITUA PELOS LINKS REAIS
 * DAS REDES SOCIAIS
 */
const socialLinks = {
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/",
};

type SocialIconProps = {
  className?: string;
};

function InstagramIcon({
  className,
}: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect
        width="18"
        height="18"
        x="3"
        y="3"
        rx="5"
      />

      <circle cx="12" cy="12" r="4" />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function FacebookIcon({
  className,
}: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M13.5 21v-8h2.8l.42-3.2H13.5V7.75c0-.93.26-1.56 1.62-1.56h1.73V3.33a23.6 23.6 0 0 0-2.52-.13c-2.5 0-4.2 1.52-4.2 4.32V9.8H7.3V13h2.83v8h3.37Z" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  function handleScrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    window.history.replaceState(
      null,
      "",
      "/"
    );
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050607] text-white">
      {/* EFEITOS DE FUNDO */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 size-80 rounded-full bg-yellow-400/6 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-0 size-80 rounded-full bg-yellow-400/5 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-375 px-5 py-14 lg:px-10 lg:py-18">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:gap-16">
          {/* EMPRESA */}
          <div>
            <Link
              href="/"
              aria-label="Ir para o início"
              className="inline-flex"
            >
              <Image
                src="/images/logo/logo_semfundo_att.png"
                alt="TransToledo Transportes"
                width={320}
                height={120}
                sizes="200px"
                className="h-auto w-48 object-contain lg:w-52"
              />
            </Link>

            <p className="mt-5 max-w-md font-(family-name:--font-montserrat) text-lg font-semibold leading-relaxed text-white">
              Mais de 15 anos levando você ao seu
              destino.
            </p>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/55">
              Segurança, conforto e confiança para
              transformar cada viagem em uma ótima
              experiência.
            </p>
          </div>

          {/* NAVEGAÇÃO */}
          <div>
            <p className="font-(family-name:--font-montserrat) text-sm font-bold uppercase tracking-[0.16em] text-yellow-400">
              Navegação
            </p>

            <nav
              aria-label="Navegação do rodapé"
              className="mt-5 flex flex-col items-start gap-3"
            >
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-white/60 transition-colors duration-300 hover:text-yellow-400"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* CONTATO */}
          <div>
            <p className="font-(family-name:--font-montserrat) text-sm font-bold uppercase tracking-[0.16em] text-yellow-400">
              Fale conosco
            </p>

            <div className="mt-5 flex flex-col gap-3">
              {/* TELEFONE */}
              <a
                href={`tel:+${contact.phoneNumber}`}
                className="group flex items-center gap-3 text-sm text-white/65 transition-colors duration-300 hover:text-white"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-yellow-400 transition-colors duration-300 group-hover:border-yellow-400/40 group-hover:bg-yellow-400/10">
                  <Phone size={17} />
                </span>

                <span>{contact.phoneLabel}</span>
              </a>

              {/* WHATSAPP */}
              <a
                href={`https://wa.me/${contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-sm text-white/65 transition-colors duration-300 hover:text-white"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-yellow-400 transition-colors duration-300 group-hover:border-yellow-400/40 group-hover:bg-yellow-400/10">
                  <MessageCircle size={18} />
                </span>

                <span>Conversar pelo WhatsApp</span>
              </a>
            </div>

            {/* REDES SOCIAIS */}
            <div className="mt-6 flex items-center gap-3">
              {/* INSTAGRAM */}
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da TransToledo"
                title="Instagram"
                className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/50 hover:bg-yellow-400 hover:text-black"
              >
                <InstagramIcon className="size-5" />
              </a>

              {/* FACEBOOK */}
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook da TransToledo"
                title="Facebook"
                className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/50 hover:bg-yellow-400 hover:text-black"
              >
                <FacebookIcon className="size-5" />
              </a>

              {/* WHATSAPP */}
              <a
                href={`https://wa.me/${contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp da TransToledo"
                title="WhatsApp"
                className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/50 hover:bg-yellow-400 hover:text-black"
              >
                <MessageCircle size={19} />
              </a>
            </div>
          </div>
        </div>

        {/* PARTE INFERIOR */}
        <div className="flex flex-col items-center justify-between gap-6 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs leading-5 text-white/45 sm:text-sm">
            © {currentYear} TransToledo Transportes.
            Todos os direitos reservados.
          </p>

          <button
            type="button"
            onClick={handleScrollToTop}
            aria-label="Retornar ao topo da página"
            className="group flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/5 px-4 py-2.5 text-xs font-semibold text-yellow-400 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
          >
            Voltar ao topo

            <ArrowUp
              size={16}
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}