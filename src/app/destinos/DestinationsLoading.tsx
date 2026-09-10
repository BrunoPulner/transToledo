import {
  LoaderCircle,
} from "lucide-react";

export function DestinationsLoading() {
  return (
    <div className="mt-10 flex min-h-80 items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/3">
      <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-white/40">
        <LoaderCircle
          size={28}
          className="animate-spin text-yellow-500"
        />

        <p className="text-sm">
          Carregando destinos...
        </p>
      </div>
    </div>
  );
}