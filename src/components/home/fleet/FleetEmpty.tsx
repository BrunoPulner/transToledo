import {
  BusFront,
  RefreshCw,
} from "lucide-react";

type FleetEmptyProps = {
  error?: string;
  onRetry?: () => void;
};

export function FleetEmpty({
  error,
  onRetry,
}: FleetEmptyProps) {
  const hasError =
    Boolean(error);

  return (
    <div
      className="
        mt-5
        flex
        min-h-80
        flex-1
        items-center
        justify-center
        rounded-3xl
        border
        border-dashed
        border-white/15
        bg-white/3
        px-6
        py-12
        text-center
      "
    >
      <div className="max-w-md">
        {/* ÍCONE */}
        <span
          className={`
            mx-auto
            flex
            size-16
            items-center
            justify-center
            rounded-2xl
            border
            ${
              hasError
                ? "border-red-400/20 bg-red-400/10 text-red-300"
                : "border-yellow-400/20 bg-yellow-400/10 text-yellow-400"
            }
          `}
        >
          {hasError ? (
            <RefreshCw
              size={28}
            />
          ) : (
            <BusFront
              size={30}
            />
          )}
        </span>

        {/* TÍTULO */}
        <h3 className="mt-5 font-(family-name:--font-montserrat) text-xl font-bold text-white">
          {hasError
            ? "Não foi possível carregar a frota"
            : "Frota em atualização"}
        </h3>

        {/* DESCRIÇÃO */}
        <p className="mt-3 text-sm leading-6 text-white/45">
          {hasError
            ? error
            : "Em breve você poderá conhecer todos os veículos disponíveis para sua próxima viagem."}
        </p>

        {/* TENTAR NOVAMENTE */}
        {hasError && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="
              mx-auto
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-yellow-400/30
              bg-yellow-400/10
              px-4
              py-2.5
              text-sm
              font-semibold
              text-yellow-400
              transition
              hover:border-yellow-400
              hover:bg-yellow-400
              hover:text-slate-950
            "
          >
            <RefreshCw
              size={16}
            />

            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}