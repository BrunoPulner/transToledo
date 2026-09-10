import {
  MapPin,
  TriangleAlert,
} from "lucide-react";

type DestinationsEmptyProps = {
  error?: string;
};

export function DestinationsEmpty({
  error,
}: DestinationsEmptyProps) {
  if (error) {
    return (
      <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-400/20 dark:bg-red-400/8">
        <TriangleAlert
          size={32}
          className="mx-auto text-red-500 dark:text-red-300"
        />

        <h3 className="mt-4 text-lg font-bold text-red-800 dark:text-red-200">
          Não foi possível carregar
        </h3>

        <p className="mt-2 text-sm text-red-700/70 dark:text-red-200/60">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-white/10 dark:bg-white/3">
      <MapPin
        size={32}
        className="mx-auto text-yellow-500"
      />

      <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
        Nenhum destino disponível
      </h3>

      <p className="mt-2 text-sm text-slate-500 dark:text-white/40">
        Novos destinos serão adicionados em breve.
      </p>
    </div>
  );
}