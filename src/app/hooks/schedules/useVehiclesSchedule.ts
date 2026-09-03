"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createWorkingHours,
} from "@/services/schedules/createWorkingHours";

import {
  deleteWorkingHours,
} from "@/services/schedules/deleteWorkingHours";

import {
  subscribeToWorkingHours,
} from "@/services/schedules/subscribeToWorkingHours";

import {
  updateWorkingHours,
} from "@/services/schedules/updateWorkingHours";

import {
  subscribeToVehicles,
} from "@/services/vehicles/subscribeToVehicles";

import type {
  CreateVehicleWorkingHoursInput,
  UpdateVehicleWorkingHoursInput,
  VehicleWorkingHours,
  Weekday,
} from "@/types/schedule";

import type {
  Vehicle,
} from "@/types/vehicles";

export const WEEKDAYS: {
  value: Weekday;
  label: string;
  shortLabel: string;
}[] = [
  {
    value: 1,
    label: "Segunda-feira",
    shortLabel: "Seg",
  },
  {
    value: 2,
    label: "Terça-feira",
    shortLabel: "Ter",
  },
  {
    value: 3,
    label: "Quarta-feira",
    shortLabel: "Qua",
  },
  {
    value: 4,
    label: "Quinta-feira",
    shortLabel: "Qui",
  },
  {
    value: 5,
    label: "Sexta-feira",
    shortLabel: "Sex",
  },
  {
    value: 6,
    label: "Sábado",
    shortLabel: "Sáb",
  },
  {
    value: 0,
    label: "Domingo",
    shortLabel: "Dom",
  },
];

export function useVehiclesSchedule() {
  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [
    selectedVehicleId,
    setSelectedVehicleId,
  ] = useState("");

  const [
    workingHours,
    setWorkingHours,
  ] = useState<
    VehicleWorkingHours[]
  >([]);

  const [
    loadingVehicles,
    setLoadingVehicles,
  ] = useState(true);

  const [
    loadingWorkingHours,
    setLoadingWorkingHours,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    deletingWorkingHoursId,
    setDeletingWorkingHoursId,
  ] = useState<string | null>(
    null,
  );

  const [error, setError] =
    useState("");

  /*
   * Carrega os veículos cadastrados
   * na frota.
   */
  useEffect(() => {
    const unsubscribe =
      subscribeToVehicles(
        (updatedVehicles) => {
          setVehicles(
            updatedVehicles,
          );

          /*
           * Mantém o veículo atual
           * selecionado quando ele
           * ainda existir.
           */
          setSelectedVehicleId(
            (currentVehicleId) => {
              const currentExists =
                updatedVehicles.some(
                  (vehicle) =>
                    vehicle.id ===
                    currentVehicleId,
                );

              if (currentExists) {
                return currentVehicleId;
              }

              /*
               * Seleciona primeiro um
               * veículo ativo.
               */
              const firstActiveVehicle =
                updatedVehicles.find(
                  (vehicle) =>
                    vehicle.status ===
                    "active",
                );

              return (
                firstActiveVehicle?.id ??
                updatedVehicles[0]?.id ??
                ""
              );
            },
          );

          setLoadingVehicles(false);
        },

        (subscriptionError) => {
          console.error(
            "Erro ao carregar veículos:",
            subscriptionError,
          );

          setError(
            subscriptionError.message,
          );

          setLoadingVehicles(false);
        },
      );

    return unsubscribe;
  }, []);

  /*
   * Sempre que o veículo selecionado
   * mudar, carregamos seus horários.
   */
  useEffect(() => {
    if (!selectedVehicleId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkingHours([]);
      setLoadingWorkingHours(false);

      return;
    }

    setLoadingWorkingHours(true);
    setError("");

    const unsubscribe =
      subscribeToWorkingHours(
        selectedVehicleId,

        (updatedWorkingHours) => {
          setWorkingHours(
            updatedWorkingHours,
          );

          setLoadingWorkingHours(
            false,
          );
        },

        (subscriptionError) => {
          console.error(
            "Erro ao carregar horários:",
            subscriptionError,
          );

          setError(
            subscriptionError.message,
          );

          setLoadingWorkingHours(
            false,
          );
        },
      );

    return unsubscribe;
  }, [selectedVehicleId]);

  const activeVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) =>
          vehicle.status === "active",
      ),
    [vehicles],
  );

  const selectedVehicle =
    useMemo(
      () =>
        vehicles.find(
          (vehicle) =>
            vehicle.id ===
            selectedVehicleId,
        ),
      [
        vehicles,
        selectedVehicleId,
      ],
    );

  /*
   * Cria um mapa para localizar
   * rapidamente o horário de cada dia.
   */
  const workingHoursByDay =
    useMemo(() => {
      return new Map<
        Weekday,
        VehicleWorkingHours
      >(
        workingHours.map(
          (workingHour) => [
            workingHour.weekday,
            workingHour,
          ],
        ),
      );
    }, [workingHours]);

  /*
   * Retorna todos os dias da semana,
   * mesmo quando ainda não existe
   * registro no Firestore.
   */
  const weeklySchedule =
    useMemo(() => {
      return WEEKDAYS.map(
        (weekday) => ({
          ...weekday,

          workingHours:
            workingHoursByDay.get(
              weekday.value,
            ),
        }),
      );
    }, [workingHoursByDay]);

  const saveWorkingHours =
    useCallback(
      async (
        input:
          CreateVehicleWorkingHoursInput,
      ) => {
        try {
          setSaving(true);
          setError("");

          const workingHoursId =
            await createWorkingHours(
              input,
            );

          return workingHoursId;
        } catch (saveError) {
          console.error(
            "Erro ao salvar horário:",
            saveError,
          );

          const message =
            saveError instanceof Error
              ? saveError.message
              : "Não foi possível salvar o horário de trabalho.";

          setError(message);

          throw saveError;
        } finally {
          setSaving(false);
        }
      },
      [],
    );

  const editWorkingHours =
    useCallback(
      async (
        workingHoursId: string,
        updates:
          UpdateVehicleWorkingHoursInput,
      ) => {
        try {
          setSaving(true);
          setError("");

          await updateWorkingHours(
            workingHoursId,
            updates,
          );
        } catch (updateError) {
          console.error(
            "Erro ao editar horário:",
            updateError,
          );

          const message =
            updateError instanceof
              Error
              ? updateError.message
              : "Não foi possível editar o horário de trabalho.";

          setError(message);

          throw updateError;
        } finally {
          setSaving(false);
        }
      },
      [],
    );

  const removeWorkingHours =
    useCallback(
      async (
        workingHoursId: string,
      ) => {
        try {
          setDeletingWorkingHoursId(
            workingHoursId,
          );

          setError("");

          await deleteWorkingHours(
            workingHoursId,
          );
        } catch (deleteError) {
          console.error(
            "Erro ao excluir horário:",
            deleteError,
          );

          const message =
            deleteError instanceof
              Error
              ? deleteError.message
              : "Não foi possível excluir o horário de trabalho.";

          setError(message);

          throw deleteError;
        } finally {
          setDeletingWorkingHoursId(
            null,
          );
        }
      },
      [],
    );

  const clearError =
    useCallback(() => {
      setError("");
    }, []);

  return {
    vehicles,
    activeVehicles,

    selectedVehicle,
    selectedVehicleId,
    setSelectedVehicleId,

    workingHours,
    workingHoursByDay,
    weeklySchedule,

    loadingVehicles,
    loadingWorkingHours,

    loading:
      loadingVehicles ||
      loadingWorkingHours,

    saving,
    deletingWorkingHoursId,
    error,

    saveWorkingHours,
    updateWorkingHours:
      editWorkingHours,
    deleteWorkingHours:
      removeWorkingHours,

    clearError,
  };
}