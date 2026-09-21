const whatsappNumber = "554197705004";

const defaultMessage =
  "Olá! Acessei o site da TransToledo e gostaria de solicitar mais informações.";

function WhatsAppIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M16.04 3C9.41 3 4.02 8.38 4.02 15c0 2.13.56 4.21 1.62 6.04L3 29l8.2-2.57A12.02 12.02 0 0 0 28.06 15C28.06 8.38 22.67 3 16.04 3Zm0 21.84c-1.79 0-3.55-.49-5.08-1.42l-.36-.22-4.86 1.52 1.58-4.73-.24-.38A9.78 9.78 0 0 1 6.26 15c0-5.39 4.39-9.77 9.79-9.77 5.39 0 9.78 4.38 9.78 9.77 0 5.39-4.39 9.78-9.79 9.78v.06Zm5.37-7.32c-.29-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.93 1.16-.17.19-.34.22-.63.07-.29-.14-1.24-.45-2.36-1.46a8.84 8.84 0 0 1-1.63-2.02c-.17-.29-.02-.45.13-.59.13-.13.29-.34.44-.51.14-.17.19-.29.29-.49.1-.19.05-.36-.02-.51-.08-.14-.66-1.59-.91-2.18-.24-.57-.48-.49-.66-.5h-.56c-.19 0-.51.07-.78.36-.27.29-1.03 1.01-1.03 2.46 0 1.45 1.06 2.85 1.2 3.04.15.2 2.08 3.18 5.04 4.46.7.3 1.25.49 1.68.62.71.22 1.35.19 1.86.12.57-.08 1.74-.71 1.99-1.4.24-.68.24-1.27.17-1.39-.07-.12-.27-.2-.56-.34Z" />
    </svg>
  );
}

export function FloatingWhatsApp() {
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar com a TransToledo pelo WhatsApp"
        className="group relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.35)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 sm:size-16"
      >
        {/* ANIMAÇÃO PULSANTE */}
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40"
        />

        {/* BORDA ANIMADA */}
        <span
          aria-hidden="true"
          className="absolute -inset-1 -z-10 animate-pulse rounded-full border border-[#25D366]/50"
        />

        <WhatsAppIcon className="size-8 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 sm:size-9" />

        {/* TEXTO DESKTOP */}
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#101214] px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100 lg:block">
          Fale conosco pelo WhatsApp

          <span
            aria-hidden="true"
            className="absolute -right-1.5 top-1/2 size-3 -translate-y-1/2 rotate-45 border-r border-t border-white/10 bg-[#101214]"
          />
        </span>
      </a>
    </div>
  );
}