"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createSchedule,
} from "@/services/schedules/createSchedule";

import {
  deleteSchedule,
} from "@/services/schedules/deleteSchedule";

import {
  subscribeToSchedules,
} from "@/services/schedules/subscribeToSchedules";

import {
  updateSchedule,
} from "@/services/schedules/updateSchedule";

import type {
  CreateVehicleScheduleInput,
  UpdateVehicleScheduleInput,
  VehicleScheduleEntry,
} from "@/types/schedule";

type UseSchedulesOptions = {
  vehicleId?: string;
};

export function useSchedules({
  vehicleId,
}: UseSchedulesOptions = {}) {
  const [
    schedules,
    setSchedules,
  ] = useState<
    VehicleScheduleEntry[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(
    null,
  );

  const [error, setError] =
    useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    const unsubscribe =
      subscribeToSchedules(
        (updatedSchedules) => {
          setSchedules(
            updatedSchedules,
          );

          setLoading(false);
        },

        (subscriptionError) => {
          console.error(
            "Erro ao carregar agendamentos:",
            subscriptionError,
          );

          setError(
            subscriptionError.message,
          );

          setLoading(false);
        },

        vehicleId,
      );

    return unsubscribe;
  }, [vehicleId]);

  const activeSchedules =
    useMemo(
      () =>
        schedules.filter(
          (schedule) =>
            schedule.status ===
            "active",
        ),
      [schedules],
    );

  const bookings = useMemo(
    () =>
      activeSchedules.filter(
        (schedule) =>
          schedule.type ===
          "booking",
      ),
    [activeSchedules],
  );

  const blockedSchedules =
    useMemo(
      () =>
        activeSchedules.filter(
          (schedule) =>
            schedule.type ===
            "blocked",
        ),
      [activeSchedules],
    );

  const createNewSchedule =
    useCallback(
      async (
        schedule:
          CreateVehicleScheduleInput,
      ) => {
        try {
          setSaving(true);
          setError("");

          const scheduleId =
            await createSchedule(
              schedule,
            );

          return scheduleId;
        } catch (createError) {
          console.error(
            "Erro ao criar agendamento:",
            createError,
          );

          const message =
            createError instanceof
              Error
              ? createError.message
              : "Não foi possível criar o agendamento.";

          setError(message);

          throw createError;
        } finally {
          setSaving(false);
        }
      },
      [],
    );

  const editSchedule =
    useCallback(
      async (
        scheduleId: string,
        updates:
          UpdateVehicleScheduleInput,
      ) => {
        try {
          setSaving(true);
          setError("");

          await updateSchedule(
            scheduleId,
            updates,
          );
        } catch (updateError) {
          console.error(
            "Erro ao editar agendamento:",
            updateError,
          );

          const message =
            updateError instanceof
              Error
              ? updateError.message
              : "Não foi possível editar o agendamento.";

          setError(message);

          throw updateError;
        } finally {
          setSaving(false);
        }
      },
      [],
    );

  const removeSchedule =
    useCallback(
      async (
        schedule:
          VehicleScheduleEntry,
      ) => {
        /*
         * Reservas confirmadas não devem
         * ser apagadas diretamente pela
         * agenda.
         *
         * Elas deverão ser canceladas
         * pelo módulo de orçamentos.
         */
        if (
          schedule.type ===
          "booking"
        ) {
          const bookingError =
            new Error(
              "Uma viagem confirmada deve ser cancelada pelo orçamento.",
            );

          setError(
            bookingError.message,
          );

          throw bookingError;
        }

        try {
          setDeletingId(
            schedule.id,
          );

          setError("");

          await deleteSchedule(
            schedule.id,
          );
        } catch (deleteError) {
          console.error(
            "Erro ao excluir agendamento:",
            deleteError,
          );

          const message =
            deleteError instanceof
              Error
              ? deleteError.message
              : "Não foi possível excluir o agendamento.";

          setError(message);

          throw deleteError;
        } finally {
          setDeletingId(null);
        }
      },
      [],
    );

  const clearError =
    useCallback(() => {
      setError("");
    }, []);

  return {
    schedules,
    activeSchedules,
    bookings,
    blockedSchedules,

    loading,
    saving,
    deletingId,
    error,

    createSchedule:
      createNewSchedule,

    updateSchedule:
      editSchedule,

    deleteSchedule:
      removeSchedule,

    clearError,
  };
}