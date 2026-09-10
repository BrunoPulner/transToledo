"use client";

import {
  MapPin,
  Route,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  subscribeToTrips,
} from "@/services/trips/subscribeToTrips";

import type {
  FrequentTrip,
} from "@/types/trip";

import {
  DestinationCard,
} from "./DestinationCard";

import {
  DestinationDetails,
} from "./DestinationDetails";

import {
  DestinationMap,
} from "./DestinationMap";

import {
  DestinationsEmpty,
} from "./DestinationsEmpty";

import {
  DestinationsLoading,
} from "./DestinationsLoading";

export function DestinationsSection() {
  const [
    trips,
    setTrips,
  ] = useState<
    FrequentTrip[]
  >([]);

  const [
    selectedTripId,
    setSelectedTripId,
  ] = useState<
    string | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const unsubscribe =
      subscribeToTrips(
        (receivedTrips) => {
          setTrips(
            receivedTrips,
          );

          setSelectedTripId(
            (currentId) => {
              const selectedStillExists =
                receivedTrips.some(
                  (trip) =>
                    trip.id ===
                    currentId,
                );

              if (
                selectedStillExists
              ) {
                return currentId;
              }

              return (
                receivedTrips[0]
                  ?.id ?? null
              );
            },
          );

          setLoading(false);
          setError("");
        },

        (subscriptionError) => {
          console.error(
            "Erro ao carregar destinos:",
            subscriptionError,
          );

          setTrips([]);
          setSelectedTripId(
            null,
          );
          setLoading(false);

          setError(
            "Não foi possível carregar os destinos. Tente novamente mais tarde.",
          );
        },
      );

    return unsubscribe;
  }, []);

  const selectedTrip =
    useMemo(
      () =>
        trips.find(
          (trip) =>
            trip.id ===
            selectedTripId,
        ) ??
        trips[0] ??
        null,
      [
        trips,
        selectedTripId,
      ],
    );

  function selectTrip(
    tripId: string,
  ) {
    setSelectedTripId(
      tripId,
    );
  }

  return (
    <section
      id="destinos"
      className="
        scroll-mt-20
        bg-slate-50
        py-16
        text-slate-950
        transition-colors
        duration-300
        dark:bg-[#080b10]
        dark:text-white
        md:scroll-mt-24
        md:py-20
      "
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* CABEÇALHO */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-yellow-500" />

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400">
                Destinos
              </p>
            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Viaje para lugares{" "}
              <span className="text-yellow-500">
                inesquecíveis
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-white/55 sm:text-base">
              Conheça nossos destinos e encontre a viagem ideal para você, sua
              família ou seu grupo.
            </p>
          </div>

          {!loading &&
            !error &&
            trips.length > 0 && (
              <div className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/55">
                <Route
                  size={15}
                  className="text-yellow-500"
                />

                {trips.length}{" "}
                {trips.length === 1
                  ? "destino disponível"
                  : "destinos disponíveis"}
              </div>
            )}
        </div>

        {loading && (
          <DestinationsLoading />
        )}

        {!loading &&
          error && (
            <DestinationsEmpty
              error={
                error
              }
            />
          )}

        {!loading &&
          !error &&
          trips.length === 0 && (
            <DestinationsEmpty />
          )}

        {!loading &&
          !error &&
          selectedTrip && (
            <>
              {/* MENU HORIZONTAL FIXO */}
              <div
                className="
                  sticky
                  top-20
                  z-30
                  -mx-4
                  mt-8
                  border-y
                  border-slate-200
                  bg-slate-50/95
                  px-4
                  py-3
                  shadow-sm
                  backdrop-blur-xl
                  dark:border-white/10
                  dark:bg-[#080b10]/95
                  md:top-24
                  sm:-mx-6
                  sm:px-6
                  lg:-mx-8
                  lg:px-8
                "
              >
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                  <div className="hidden shrink-0 items-center gap-2 pr-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-white/40 lg:flex">
                    <MapPin
                      size={15}
                      className="text-yellow-500"
                    />

                    Escolha o destino
                  </div>

                  <div
                    className="
                      flex
                      min-w-0
                      flex-1
                      gap-3
                      overflow-x-auto
                      pb-1
                      [scrollbar-color:rgb(234_179_8)_transparent]
                      scrollbar-thin
                    "
                  >
                    {trips.map(
                      (trip) => (
                        <DestinationCard
                          key={
                            trip.id
                          }
                          trip={
                            trip
                          }
                          selected={
                            trip.id ===
                            selectedTrip.id
                          }
                          onSelect={() =>
                            selectTrip(
                              trip.id,
                            )
                          }
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* DESTINO E MAPA */}
              <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
                <DestinationDetails
                  trip={
                    selectedTrip
                  }
                />

                <DestinationMap
                  trip={
                    selectedTrip
                  }
                />
              </div>
            </>
          )}
      </div>
    </section>
  );
}