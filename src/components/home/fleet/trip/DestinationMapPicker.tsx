"use client";

import {
  importLibrary,
  setOptions,
} from "@googlemaps/js-api-loader";

import {
  LoaderCircle,
  LocateFixed,
  MapPin,
  Search,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

type DestinationLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

type DestinationMapPickerProps = {
  address: string;
  latitude: number | null;
  longitude: number | null;

  onLocationChange: (
    location: DestinationLocation,
  ) => void;
};

const defaultCenter = {
  lat: -25.6215,
  lng: -50.6874,
};

let loaderConfigured = false;

export function DestinationMapPicker({
  address,
  latitude,
  longitude,
  onLocationChange,
}: DestinationMapPickerProps) {
  const apiKey =
    process.env
      .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const mapRef =
    useRef<google.maps.Map | null>(
      null,
    );

  const markerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(
      null,
    );

  const geocoderRef =
    useRef<google.maps.Geocoder | null>(
      null,
    );

  const onLocationChangeRef =
    useRef(onLocationChange);

  const addressRef =
    useRef(address);

  const initialLatitudeRef =
    useRef(latitude);

  const initialLongitudeRef =
    useRef(longitude);

  const [
    searchValue,
    setSearchValue,
  ] = useState(address);

  const [
    loading,
    setLoading,
  ] = useState(
    Boolean(apiKey),
  );

  const [
    searching,
    setSearching,
  ] = useState(false);

  const [
    locating,
    setLocating,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(
    apiKey
      ? ""
      : "A chave do Google Maps não está configurada.",
  );

  useEffect(() => {
    onLocationChangeRef.current =
      onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    addressRef.current =
      address;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchValue(
      address,
    );
  }, [address]);

  const applyPosition =
    useCallback(
      async (
        position: google.maps.LatLngLiteral,
        resolveAddress = true,
      ) => {
        mapRef.current?.setCenter(
          position,
        );

        mapRef.current?.setZoom(
          16,
        );

        if (markerRef.current) {
          markerRef.current.position =
            position;
        }

        let resolvedAddress =
          addressRef.current;

        if (
          resolveAddress &&
          geocoderRef.current
        ) {
          const response =
            await geocoderRef.current.geocode(
              {
                location:
                  position,
              },
            );

          resolvedAddress =
            response.results[0]
              ?.formatted_address ??
            resolvedAddress;
        }

        addressRef.current =
          resolvedAddress;

        setSearchValue(
          resolvedAddress,
        );

        onLocationChangeRef.current(
          {
            address:
              resolvedAddress,
            latitude:
              position.lat,
            longitude:
              position.lng,
          },
        );
      },
      [],
    );

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    let cancelled = false;

    async function initializeMap() {
      try {
        if (
          !loaderConfigured
        ) {
          setOptions({
            key: apiKey,
            v: "weekly",
            language: "pt-BR",
            region: "BR",
          });

          loaderConfigured =
            true;
        }

        const [
          {
            Map,
          },
          {
            AdvancedMarkerElement,
          },
          {
            Geocoder,
          },
        ] = await Promise.all([
          importLibrary(
            "maps",
          ),
          importLibrary(
            "marker",
          ),
          importLibrary(
            "geocoding",
          ),
        ]);

        if (
          cancelled ||
          !containerRef.current
        ) {
          return;
        }

        const hasInitialLocation =
          initialLatitudeRef.current !==
            null &&
          initialLongitudeRef.current !==
            null &&
          Number.isFinite(
            initialLatitudeRef.current,
          ) &&
          Number.isFinite(
            initialLongitudeRef.current,
          );

        const initialPosition =
          hasInitialLocation
            ? {
                lat:
                  initialLatitudeRef.current as number,

                lng:
                  initialLongitudeRef.current as number,
              }
            : defaultCenter;

        const map = new Map(
          containerRef.current,
          {
            center:
              initialPosition,

            zoom:
              hasInitialLocation
                ? 16
                : 8,

            mapId:
              process.env
                .NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ||
              "DEMO_MAP_ID",

            streetViewControl:
              false,

            mapTypeControl:
              false,

            fullscreenControl:
              true,

            zoomControl:
              true,
          },
        );

        const marker =
          new AdvancedMarkerElement(
            {
              map,
              position:
                initialPosition,

              title:
                "Destino da viagem",

              gmpDraggable:
                true,
            },
          );

        mapRef.current =
          map;

        markerRef.current =
          marker;

        geocoderRef.current =
          new Geocoder();

        marker.addListener(
          "dragend",
          async () => {
            const currentPosition =
              marker.position;

            if (
              !currentPosition
            ) {
              return;
            }

            const currentLatitude =
              typeof currentPosition.lat ===
              "function"
                ? currentPosition.lat()
                : currentPosition.lat;

            const currentLongitude =
              typeof currentPosition.lng ===
              "function"
                ? currentPosition.lng()
                : currentPosition.lng;

            await applyPosition(
              {
                lat:
                  currentLatitude,

                lng:
                  currentLongitude,
              },
              true,
            );
          },
        );

        map.addListener(
          "click",
          async (
            event: google.maps.MapMouseEvent,
          ) => {
            const clickedPosition =
              event.latLng;

            if (
              !clickedPosition
            ) {
              return;
            }

            await applyPosition(
              {
                lat:
                  clickedPosition.lat(),

                lng:
                  clickedPosition.lng(),
              },
              true,
            );
          },
        );
      } catch (mapError) {
        console.error(
          "Erro ao carregar Google Maps:",
          mapError,
        );

        setError(
          "Não foi possível carregar o Google Maps.",
        );
      } finally {
        if (!cancelled) {
          setLoading(
            false,
          );
        }
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;

      if (
        markerRef.current
      ) {
        markerRef.current.map =
          null;
      }
    };
  }, [
    apiKey,
    applyPosition,
  ]);

  async function searchLocation(
    event?: FormEvent<HTMLFormElement>,
  ) {
    event?.preventDefault();

    if (
      !geocoderRef.current
    ) {
      return;
    }

    const normalizedSearch =
      searchValue.trim();

    if (!normalizedSearch) {
      setError(
        "Informe um endereço, CEP ou nome de local.",
      );

      return;
    }

    setError("");
    setSearching(true);

    try {
      const response =
        await geocoderRef.current.geocode(
          {
            address: `${normalizedSearch}, Brasil`,
            region: "BR",
          },
        );

      const result =
        response.results[0];

      if (!result) {
        setError(
          "Nenhuma localização foi encontrada.",
        );

        return;
      }

      const position = {
        lat:
          result.geometry.location.lat(),

        lng:
          result.geometry.location.lng(),
      };

      mapRef.current?.setCenter(
        position,
      );

      mapRef.current?.setZoom(
        16,
      );

      if (markerRef.current) {
        markerRef.current.position =
          position;
      }

      addressRef.current =
        result.formatted_address;

      setSearchValue(
        result.formatted_address,
      );

      onLocationChangeRef.current(
        {
          address:
            result.formatted_address,

          latitude:
            position.lat,

          longitude:
            position.lng,
        },
      );
    } catch (searchError) {
      console.error(
        "Erro ao pesquisar destino:",
        searchError,
      );

      setError(
        "Não foi possível localizar o destino informado.",
      );
    } finally {
      setSearching(false);
    }
  }

  function useCurrentLocation() {
    if (
      !navigator.geolocation
    ) {
      setError(
        "A localização não está disponível neste navegador.",
      );

      return;
    }

    setError("");
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void applyPosition(
          {
            lat:
              position.coords
                .latitude,

            lng:
              position.coords
                .longitude,
          },
          true,
        ).finally(() => {
          setLocating(false);
        });
      },

      () => {
        setLocating(false);

        setError(
          "Não foi possível obter sua localização.",
        );
      },

      {
        enableHighAccuracy:
          true,

        timeout: 10000,
      },
    );
  }

  const hasSelectedLocation =
    latitude !== null &&
    longitude !== null;

  return (
    <div>
      <form
        onSubmit={
          searchLocation
        }
        className="
          flex
          flex-col
          gap-2
          sm:flex-row
        "
      >
        <label
          className="
            min-w-0
            flex-1
          "
        >
          <span
            className="
              mb-1.5
              block
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-white/40
            "
          >
            Pesquise o destino
          </span>

          <div className="relative">
            <MapPin
              size={16}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-yellow-400
              "
            />

            <input
              type="text"
              value={
                searchValue
              }
              onChange={(
                event,
              ) =>
                setSearchValue(
                  event.target
                    .value,
                )
              }
              placeholder="Endereço, CEP ou nome do lugar"
              autoComplete="street-address"
              className="
                h-11
                w-full
                rounded-xl
                border
                border-white/10
                bg-white/5
                pl-10
                pr-3
                text-sm
                text-white
                outline-none
                transition
                placeholder:text-white/25
                focus:border-yellow-400/60
                focus:bg-white/7
              "
            />
          </div>
        </label>

        <div
          className="
            flex
            gap-2
            sm:mt-6
          "
        >
          <button
            type="submit"
            disabled={
              loading ||
              searching ||
              !apiKey
            }
            className="
              flex
              h-11
              flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-yellow-400
              px-4
              text-xs
              font-bold
              text-slate-950
              transition
              hover:bg-yellow-300
              disabled:cursor-not-allowed
              disabled:opacity-40
              sm:flex-none
            "
          >
            {searching ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Search
                size={16}
              />
            )}

            {searching
              ? "Buscando..."
              : "Pesquisar"}
          </button>

          <button
            type="button"
            onClick={
              useCurrentLocation
            }
            disabled={
              loading ||
              locating ||
              !apiKey
            }
            aria-label="Usar minha localização"
            title="Usar minha localização"
            className="
              flex
              size-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/5
              text-white/50
              transition
              hover:border-yellow-400/40
              hover:text-yellow-400
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {locating ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <LocateFixed
                size={17}
              />
            )}
          </button>
        </div>
      </form>

      <div
        className="
          relative
          mt-4
          min-h-85
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-black/20
        "
      >
        <div
          ref={
            containerRef
          }
          className="
            absolute
            inset-0
          "
        />

        {loading && (
          <div
            className="
              absolute
              inset-0
              z-10
              flex
              items-center
              justify-center
              bg-[#0b0d0f]
              text-xs
              text-white/45
            "
          >
            <LoaderCircle
              size={21}
              className="
                mr-2
                animate-spin
                text-yellow-400
              "
            />

            Carregando mapa...
          </div>
        )}

        {error && (
          <div
            className="
              absolute
              inset-x-3
              bottom-3
              z-20
              rounded-xl
              border
              border-red-500/20
              bg-[#180d0f]/95
              px-4
              py-3
              text-xs
              text-red-300
              shadow-lg
            "
          >
            {error}
          </div>
        )}
      </div>

      <div
        className={`
          mt-3
          flex
          items-start
          gap-2
          rounded-xl
          border
          px-3
          py-2.5
          ${
            hasSelectedLocation
              ? `
                border-emerald-400/20
                bg-emerald-400/5
              `
              : `
                border-white/8
                bg-white/3
              `
          }
        `}
      >
        <MapPin
          size={14}
          className={`
            mt-0.5
            shrink-0
            ${
              hasSelectedLocation
                ? "text-emerald-300"
                : "text-white/25"
            }
          `}
        />

        <div className="min-w-0">
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-white/30
            "
          >
            Local selecionado
          </p>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-white/65
            "
          >
            {hasSelectedLocation
              ? address
              : "Pesquise ou clique no mapa para escolher o destino."}
          </p>

          {hasSelectedLocation && (
            <p
              className="
                mt-1
                text-[9px]
                text-white/25
              "
            >
              {latitude?.toFixed(
                6,
              )}
              {", "}
              {longitude?.toFixed(
                6,
              )}
            </p>
          )}
        </div>
      </div>

      <p
        className="
          mt-3
          flex
          items-start
          gap-2
          text-[10px]
          leading-5
          text-white/30
        "
      >
        <MapPin
          size={13}
          className="
            mt-0.5
            shrink-0
          "
        />

        Pesquise um local, clique no
        mapa ou arraste o pin para
        ajustar o destino exato.
      </p>
    </div>
  );
}

export type {
  DestinationLocation,
};