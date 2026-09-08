"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  subscribeToVehicles,
} from "@/services/vehicles/subscribeToVehicles";

import type {
  Vehicle,
} from "@/types/vehicles";

export function useFleetPreview() {
  const [
    vehicles,
    setVehicles,
  ] = useState<Vehicle[]>([]);

  const [
    selectedVehicleId,
    setSelectedVehicleId,
  ] = useState("");

  const [
    menuCollapsed,
    setMenuCollapsed,
  ] = useState(false);

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
      subscribeToVehicles(
        (
          registeredVehicles,
        ) => {
          setVehicles(
            registeredVehicles,
          );

          setLoading(false);
          setError("");
        },

        () => {
          setLoading(false);

          setError(
            "Não foi possível carregar a frota neste momento.",
          );
        },
      );

    return unsubscribe;
  }, []);

  const activeVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) =>
          vehicle.status ===
          "active",
      ),
    [vehicles],
  );

  const selectedVehicle =
    useMemo(() => {
      return (
        activeVehicles.find(
          (vehicle) =>
            vehicle.id ===
            selectedVehicleId,
        ) ??
        activeVehicles[0] ??
        null
      );
    }, [
      activeVehicles,
      selectedVehicleId,
    ]);

  const selectVehicle =
    useCallback(
      (
        vehicleId: string,
      ) => {
        setSelectedVehicleId(
          vehicleId,
        );
      },
      [],
    );

  const toggleMenu =
    useCallback(() => {
      setMenuCollapsed(
        (currentValue) =>
          !currentValue,
      );
    }, []);

  return {
    activeVehicles,
    selectedVehicle,

    selectedVehicleId:
      selectedVehicle?.id ?? "",

    menuCollapsed,
    loading,
    error,

    selectVehicle,
    toggleMenu,
  };
}