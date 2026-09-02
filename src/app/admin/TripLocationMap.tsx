"use client";

import {
  importLibrary,
  setOptions,
} from "@googlemaps/js-api-loader";
import { LoaderCircle, MapPin, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type TripLocationMapProps = {
  address: string;
  latitude: string;
  longitude: string;
  onLocationChange: (location: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
};

const DEFAULT_CENTER = {
  lat: -25.6215,
  lng: -50.6874,
};

let loaderConfigured = false;

export function TripLocationMap({
  address,
  latitude,
  longitude,
  onLocationChange,
}: TripLocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const addressRef = useRef(address);
  const onLocationChangeRef = useRef(onLocationChange);
  const initialLatitudeRef = useRef(latitude);
  const initialLongitudeRef = useRef(longitude);
  const [loading, setLoading] = useState(Boolean(apiKey));
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(
    apiKey ? "" : "Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para exibir o mapa."
  );

  useEffect(() => {
    addressRef.current = address;
    onLocationChangeRef.current = onLocationChange;
  }, [address, onLocationChange]);

  const applyPosition = useCallback(
    async (position: google.maps.LatLngLiteral, reverse = false) => {
      mapRef.current?.setCenter(position);
      mapRef.current?.setZoom(16);

      if (markerRef.current) {
        markerRef.current.position = position;
      }

      let resolvedAddress = addressRef.current;

      if (reverse && geocoderRef.current) {
        const response = await geocoderRef.current.geocode({
          location: position,
        });
        resolvedAddress =
          response.results[0]?.formatted_address ?? addressRef.current;
      }

      onLocationChangeRef.current({
        address: resolvedAddress,
        latitude: position.lat,
        longitude: position.lng,
      });
    },
    []
  );

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    let cancelled = false;

    async function initializeMap() {
      try {
        if (!loaderConfigured) {
          setOptions({ key: apiKey, v: "weekly", language: "pt-BR", region: "BR" });
          loaderConfigured = true;
        }

        const [{ Map }, { AdvancedMarkerElement }, { Geocoder }] =
          await Promise.all([
            importLibrary("maps"),
            importLibrary("marker"),
            importLibrary("geocoding"),
          ]);

        if (cancelled || !containerRef.current) return;

        const initialPosition =
          Number.isFinite(Number(initialLatitudeRef.current)) &&
          Number.isFinite(Number(initialLongitudeRef.current)) &&
          initialLatitudeRef.current !== "" &&
          initialLongitudeRef.current !== ""
            ? {
                lat: Number(initialLatitudeRef.current),
                lng: Number(initialLongitudeRef.current),
              }
            : DEFAULT_CENTER;

        const map = new Map(containerRef.current, {
          center: initialPosition,
          zoom:
            initialLatitudeRef.current && initialLongitudeRef.current
              ? 16
              : 7,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
          streetViewControl: false,
          mapTypeControl: false,
        });

        const marker = new AdvancedMarkerElement({
          map,
          position: initialPosition,
          title: "Local da viagem",
          gmpDraggable: true,
        });

        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = new Geocoder();

        marker.addListener("dragend", async () => {
          const current = marker.position;
          if (!current) return;

          const lat = typeof current.lat === "function" ? current.lat() : current.lat;
          const lng = typeof current.lng === "function" ? current.lng() : current.lng;

          await applyPosition({ lat, lng }, true);
        });
      } catch (mapError) {
        console.error("Erro ao carregar Google Maps:", mapError);
        setError("Não foi possível carregar o Google Maps.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initializeMap();
    return () => {
      cancelled = true;
      if (markerRef.current) markerRef.current.map = null;
    };
  }, [apiKey, applyPosition]);

  async function searchLocation() {
    if (!geocoderRef.current) return;

    setError("");
    setSearching(true);

    try {
      const lat = Number(latitude);
      const lng = Number(longitude);
      const hasCoordinates =
        latitude !== "" && longitude !== "" &&
        Number.isFinite(lat) && Number.isFinite(lng);

      if (hasCoordinates) {
        await applyPosition({ lat, lng }, true);
        return;
      }

      if (!address.trim()) {
        setError("Informe um endereço, CEP ou as duas coordenadas.");
        return;
      }

      const response = await geocoderRef.current.geocode({
        address: `${address.trim()}, Brasil`,
        region: "BR",
      });
      const result = response.results[0];

      if (!result) {
        setError("Localização não encontrada.");
        return;
      }

      const position = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
      };

      await applyPosition(position);
      onLocationChange({
        address: result.formatted_address,
        latitude: position.lat,
        longitude: position.lng,
      });
    } catch (searchError) {
      console.error("Erro ao localizar endereço:", searchError);
      setError("Não foi possível localizar o endereço informado.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={searchLocation}
        disabled={loading || searching || Boolean(error && !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)}
        className="mb-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {searching ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />}
        {searching ? "Localizando..." : "Localizar no mapa"}
      </button>

      <div className="relative min-h-80 overflow-hidden rounded-xl border border-white/10 bg-black/20">
        <div ref={containerRef} className="absolute inset-0" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0d0f] text-white/45">
            <LoaderCircle size={24} className="mr-2 animate-spin" /> Carregando mapa...
          </div>
        )}
        {error && (
          <div className="absolute inset-x-4 bottom-4 z-10 rounded-xl border border-red-500/20 bg-[#160b0b]/95 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-white/30">
        <MapPin size={14} className="mt-0.5 shrink-0" />
        Localize pelo endereço, CEP ou coordenadas e arraste o pin para ajustar o ponto exato.
      </p>
    </div>
  );
}
