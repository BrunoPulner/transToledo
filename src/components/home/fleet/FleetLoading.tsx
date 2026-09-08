export function FleetLoading() {
  return (
    <div
      className="
        mt-5
        grid
        min-h-0
        flex-1
        gap-4
        lg:grid-cols-[17rem_minmax(0,1fr)]
      "
      aria-label="Carregando frota"
      aria-busy="true"
    >
      {/* MENU LATERAL */}
      <aside
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/4
          p-3
        "
      >
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between">
          <span className="h-3 w-32 animate-pulse rounded-full bg-white/10" />

          <span className="size-9 animate-pulse rounded-xl bg-white/10" />
        </div>

        {/* VEÍCULOS */}
        <div className="mt-3 flex gap-2 overflow-hidden lg:flex-col">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="
                flex
                min-w-60
                items-center
                gap-3
                rounded-2xl
                border
                border-white/5
                bg-white/3
                p-2
                lg:min-w-0
              "
            >
              <span className="size-14 shrink-0 animate-pulse rounded-xl bg-white/10" />

              <span className="flex flex-1 flex-col gap-2">
                <span className="h-3 w-3/5 animate-pulse rounded-full bg-white/10" />

                <span className="h-2.5 w-4/5 animate-pulse rounded-full bg-white/5" />
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* PAINEL DO VEÍCULO */}
      <div
        className="
          flex
          min-h-115
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-white/4
        "
      >
        {/* ÁREA DA MÍDIA */}
        <div className="min-h-72 flex-1 p-3 pb-0">
          <div className="relative size-full min-h-72 overflow-hidden rounded-2xl bg-white/5">
            <div className="absolute inset-0 animate-pulse bg-linear-to-r from-transparent via-white/5 to-transparent" />

            {/* ANO */}
            <span className="absolute left-4 top-4 h-7 w-14 animate-pulse rounded-full bg-white/10" />

            {/* TELA CHEIA */}
            <span className="absolute right-4 top-4 size-10 animate-pulse rounded-full bg-white/10" />

            {/* INDICADORES */}
            <span className="absolute bottom-4 left-1/2 h-5 w-24 -translate-x-1/2 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>

        {/* INFORMAÇÕES INFERIORES */}
        <div className="shrink-0 p-4 lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* NOME */}
            <div>
              <span className="block h-2.5 w-36 animate-pulse rounded-full bg-yellow-400/15" />

              <span className="mt-2 block h-6 w-48 animate-pulse rounded-full bg-white/10" />

              <span className="mt-2 block h-2.5 w-20 animate-pulse rounded-full bg-white/5" />
            </div>

            {/* ABAS */}
            <div className="grid w-full grid-cols-2 gap-1 rounded-xl bg-black/20 p-1 lg:w-72">
              <span className="h-9 animate-pulse rounded-lg bg-white/10" />

              <span className="h-9 animate-pulse rounded-lg bg-white/5" />
            </div>
          </div>

          {/* CARACTERÍSTICAS */}
          <div className="mt-4 flex flex-col gap-3 xl:flex-row">
            <InformationSkeleton />

            <InformationSkeleton />

            <div className="flex min-h-18 flex-1 items-center gap-2 rounded-2xl border border-white/5 bg-white/3 px-4">
              <span className="h-7 w-28 animate-pulse rounded-full bg-white/10" />

              <span className="h-7 w-20 animate-pulse rounded-full bg-white/10" />

              <span className="h-7 w-24 animate-pulse rounded-full bg-white/10" />
            </div>

            {/* BOTÃO */}
            <span className="min-h-18 animate-pulse rounded-2xl bg-yellow-400/15 xl:w-52" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InformationSkeleton() {
  return (
    <div
      className="
        flex
        min-h-18
        min-w-44
        items-center
        gap-3
        rounded-2xl
        border
        border-white/5
        bg-white/3
        px-4
        py-3
      "
    >
      <span className="size-9 shrink-0 animate-pulse rounded-xl bg-yellow-400/10" />

      <span className="flex flex-1 flex-col gap-2">
        <span className="h-2.5 w-16 animate-pulse rounded-full bg-white/5" />

        <span className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
      </span>
    </div>
  );
}