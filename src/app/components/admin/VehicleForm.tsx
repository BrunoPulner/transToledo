"use client";

import {
  Check,
  ImageIcon,
  LoaderCircle,
  Star,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createVehicle } from "@/services/vehicles/createVehicle";
import { deleteVehicleMedia } from "@/services/vehicles/deleteVehicleMedia";
import { updateVehicle } from "@/services/vehicles/updateVehicle";
import { uploadVehicleMedia } from "@/services/vehicles/uploadVehicleMedia";
import type {
  LuggageSize,
  Vehicle,
  VehicleFeatures,
  VehicleMedia,
  VehicleMediaType,
  VehicleStatus,
} from "@/types/vehicles";

type VehicleFormProps = {
  vehicle?: Vehicle;
};

type SelectedMedia = {
  id: string;
  file: File;
  previewUrl: string;
  type: VehicleMediaType;
  isCover: boolean;
};

type DisplayMedia = {
  id: string;
  url: string;
  type: VehicleMediaType;
  isCover: boolean;
  existing: boolean;
  fileName?: string;
};

const initialFeatures: VehicleFeatures = {
  airConditioning: false,
  wifi: false,
  usb: false,
  powerOutlet: false,
  recliningSeats: false,
  accessibility: false,
  television: false,
  refrigerator: false,
};

const featureOptions: Array<{
  name: keyof VehicleFeatures;
  label: string;
}> = [
  {
    name: "airConditioning",
    label: "Ar-condicionado",
  },
  {
    name: "wifi",
    label: "Wi-Fi",
  },
  {
    name: "usb",
    label: "Entrada USB",
  },
  {
    name: "powerOutlet",
    label: "Tomada elétrica",
  },
  {
    name: "recliningSeats",
    label: "Assentos reclináveis",
  },
  {
    name: "accessibility",
    label: "Acessibilidade",
  },
  {
    name: "television",
    label: "Televisão",
  },
  {
    name: "refrigerator",
    label: "Geladeira",
  },
];

export function VehicleForm({
  vehicle,
}: VehicleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedMediaRef = useRef<SelectedMedia[]>([]);

  const isEditing = Boolean(vehicle);

  const [model, setModel] = useState(vehicle?.model ?? "");
  const [year, setYear] = useState(
    vehicle ? String(vehicle.year) : "",
  );
  const [passengerCapacity, setPassengerCapacity] =
    useState(
      vehicle
        ? String(vehicle.passengerCapacity)
        : "",
    );

  const [luggageSize, setLuggageSize] =
    useState<LuggageSize>(
      vehicle?.luggageSize ?? "medium",
    );

  const [luggageCapacityLiters, setLuggageCapacityLiters] =
    useState(
      vehicle
        ? String(vehicle.luggageCapacityLiters)
        : "",
    );

  const [hasLuggageDimensions, setHasLuggageDimensions] =
    useState(Boolean(vehicle?.luggageDimensions));

  const [luggageWidthCm, setLuggageWidthCm] = useState(
    vehicle?.luggageDimensions
      ? String(vehicle.luggageDimensions.widthCm)
      : "",
  );

  const [luggageHeightCm, setLuggageHeightCm] = useState(
    vehicle?.luggageDimensions
      ? String(vehicle.luggageDimensions.heightCm)
      : "",
  );

  const [luggageDepthCm, setLuggageDepthCm] = useState(
    vehicle?.luggageDimensions
      ? String(vehicle.luggageDimensions.depthCm)
      : "",
  );

  const [status, setStatus] =
    useState<VehicleStatus>(
      vehicle?.status ?? "active",
    );

  const [features, setFeatures] =
    useState<VehicleFeatures>({
      ...initialFeatures,
      ...(vehicle?.features ?? {}),
    });

  const [existingMedia, setExistingMedia] = useState<
    VehicleMedia[]
  >(vehicle?.media ?? []);

  const [selectedMedia, setSelectedMedia] = useState<
    SelectedMedia[]
  >([]);

  const [removedMediaUrls, setRemovedMediaUrls] = useState<
    string[]
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    selectedMediaRef.current = selectedMedia;
  }, [selectedMedia]);

  useEffect(() => {
    return () => {
      selectedMediaRef.current.forEach((media) => {
        URL.revokeObjectURL(media.previewUrl);
      });
    };
  }, []);

  const displayMedia = useMemo<DisplayMedia[]>(() => {
    const savedMedia = existingMedia.map(
      (media, index) => ({
        id: `existing-${index}-${media.url}`,
        url: media.url,
        type: media.type,
        isCover: Boolean(media.isCover),
        existing: true,
      }),
    );

    const newMedia = selectedMedia.map((media) => ({
      id: media.id,
      url: media.previewUrl,
      type: media.type,
      isCover: media.isCover,
      existing: false,
      fileName: media.file.name,
    }));

    return [...savedMedia, ...newMedia];
  }, [existingMedia, selectedMedia]);

  const coverMedia = useMemo(
    () => displayMedia.find((media) => media.isCover),
    [displayMedia],
  );

  function handleFeatureChange(
    feature: keyof VehicleFeatures,
  ) {
    setFeatures((currentFeatures) => ({
      ...currentFeatures,
      [feature]: !currentFeatures[feature],
    }));
  }

  function handleMediaChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setError("");
    setMessage("");

    const acceptedMedia: SelectedMedia[] = [];

    for (const file of files) {
      const isImage = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type);

      const isVideo = file.type === "video/mp4";

      if (!isImage && !isVideo) {
        setError(
          `O arquivo "${file.name}" não possui um formato permitido.`,
        );
        continue;
      }

      const maximumSize = isImage
        ? 10 * 1024 * 1024
        : 100 * 1024 * 1024;

      if (file.size > maximumSize) {
        setError(
          `O arquivo "${file.name}" ultrapassa o limite permitido.`,
        );
        continue;
      }

      acceptedMedia.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        type: isImage ? "image" : "video",
        isCover: false,
      });
    }

    if (acceptedMedia.length === 0) {
      event.target.value = "";
      return;
    }

    const alreadyHasCover =
      existingMedia.some((media) => media.isCover) ||
      selectedMedia.some((media) => media.isCover);

    setSelectedMedia((currentMedia) => [
      ...currentMedia,
      ...acceptedMedia.map((media, index) => ({
        ...media,
        isCover: !alreadyHasCover && index === 0,
      })),
    ]);

    event.target.value = "";
  }

  function selectCover(media: DisplayMedia) {
    setExistingMedia((currentMedia) =>
      currentMedia.map((item) => ({
        ...item,
        isCover:
          media.existing && item.url === media.url,
      })),
    );

    setSelectedMedia((currentMedia) =>
      currentMedia.map((item) => ({
        ...item,
        isCover:
          !media.existing && item.id === media.id,
      })),
    );
  }

  function ensureFirstMediaIsCover(
    savedMedia: VehicleMedia[],
    newMedia: SelectedMedia[],
  ) {
    const hasCover =
      savedMedia.some((media) => media.isCover) ||
      newMedia.some((media) => media.isCover);

    if (hasCover) {
      return {
        savedMedia,
        newMedia,
      };
    }

    if (savedMedia.length > 0) {
      return {
        savedMedia: savedMedia.map((media, index) => ({
          ...media,
          isCover: index === 0,
        })),
        newMedia,
      };
    }

    if (newMedia.length > 0) {
      return {
        savedMedia,
        newMedia: newMedia.map((media, index) => ({
          ...media,
          isCover: index === 0,
        })),
      };
    }

    return {
      savedMedia,
      newMedia,
    };
  }

  function removeMedia(media: DisplayMedia) {
    if (media.existing) {
      const remainingExistingMedia =
        existingMedia.filter(
          (item) => item.url !== media.url,
        );

      setRemovedMediaUrls((currentUrls) => [
        ...currentUrls,
        media.url,
      ]);

      const normalized = ensureFirstMediaIsCover(
        remainingExistingMedia,
        selectedMedia,
      );

      setExistingMedia(normalized.savedMedia);
      setSelectedMedia(normalized.newMedia);

      return;
    }

    const selectedItem = selectedMedia.find(
      (item) => item.id === media.id,
    );

    if (selectedItem) {
      URL.revokeObjectURL(selectedItem.previewUrl);
    }

    const remainingSelectedMedia =
      selectedMedia.filter(
        (item) => item.id !== media.id,
      );

    const normalized = ensureFirstMediaIsCover(
      existingMedia,
      remainingSelectedMedia,
    );

    setExistingMedia(normalized.savedMedia);
    setSelectedMedia(normalized.newMedia);
  }

  function validateForm() {
    const parsedYear = Number(year);
    const parsedPassengerCapacity = Number(
      passengerCapacity,
    );
    const parsedLuggageCapacity = Number(
      luggageCapacityLiters,
    );

    if (!model.trim()) {
      return "Informe o modelo da van.";
    }

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 1980 ||
      parsedYear > new Date().getFullYear() + 1
    ) {
      return "Informe um ano válido para a van.";
    }

    if (
      !Number.isInteger(parsedPassengerCapacity) ||
      parsedPassengerCapacity <= 0
    ) {
      return "Informe uma capacidade válida de passageiros.";
    }

    if (
      !Number.isFinite(parsedLuggageCapacity) ||
      parsedLuggageCapacity <= 0
    ) {
      return "Informe a capacidade do bagageiro em litros.";
    }

    if (hasLuggageDimensions) {
      const dimensions = [
        Number(luggageWidthCm),
        Number(luggageHeightCm),
        Number(luggageDepthCm),
      ];

      if (
        dimensions.some(
          (dimension) =>
            !Number.isFinite(dimension) ||
            dimension <= 0,
        )
      ) {
        return "Preencha corretamente todas as dimensões do bagageiro.";
      }
    }

    return null;
  }

  function resetForm() {
    selectedMedia.forEach((media) => {
      URL.revokeObjectURL(media.previewUrl);
    });

    setModel("");
    setYear("");
    setPassengerCapacity("");
    setLuggageSize("medium");
    setLuggageCapacityLiters("");
    setHasLuggageDimensions(false);
    setLuggageWidthCm("");
    setLuggageHeightCm("");
    setLuggageDepthCm("");
    setStatus("active");
    setFeatures(initialFeatures);
    setExistingMedia([]);
    setSelectedMedia([]);
    setRemovedMediaUrls([]);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const mediaFolderId =
        vehicle?.id ?? crypto.randomUUID();

      const uploadedMedia =
        selectedMedia.length > 0
          ? await uploadVehicleMedia(
              selectedMedia.map((media) => media.file),
              mediaFolderId,
            )
          : [];

      const newUploadedMedia: VehicleMedia[] =
        uploadedMedia.map((media, index) => ({
          ...media,
          isCover:
            selectedMedia[index]?.isCover ?? false,
        }));

      const completeMedia: VehicleMedia[] = [
        ...existingMedia,
        ...newUploadedMedia,
      ];

      const vehicleData = {
        model: model.trim(),
        year: Number(year),
        passengerCapacity: Number(passengerCapacity),
        luggageSize,
        luggageCapacityLiters: Number(
          luggageCapacityLiters,
        ),
        luggageDimensions: hasLuggageDimensions
          ? {
              widthCm: Number(luggageWidthCm),
              heightCm: Number(luggageHeightCm),
              depthCm: Number(luggageDepthCm),
            }
          : null,
        status,
        features,
        media: completeMedia,
      };

      if (vehicle) {
        await updateVehicle(vehicle.id, vehicleData);

        const deletionResults = await Promise.allSettled(
          removedMediaUrls.map((mediaUrl) =>
            deleteVehicleMedia(mediaUrl),
          ),
        );

        const failedDeletions = deletionResults.filter(
          (result) => result.status === "rejected",
        );

        if (failedDeletions.length > 0) {
          console.error(
            "Algumas mídias removidas não puderam ser excluídas:",
            failedDeletions,
          );
        }

        router.push("/admin/frota");
        router.refresh();
        return;
      }

      await createVehicle(vehicleData);

      resetForm();

      setMessage("Van cadastrada com sucesso.");
    } catch (submitError) {
      console.error(submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : isEditing
            ? "Não foi possível atualizar a van."
            : "Não foi possível cadastrar a van.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white">
          Informações da van
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Informe os dados principais do veículo.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <FormField label="Modelo *">
            <input
              value={model}
              onChange={(event) =>
                setModel(event.target.value)
              }
              placeholder="Ex.: Mercedes-Benz Sprinter"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Ano *">
            <input
              type="number"
              min="1980"
              max={new Date().getFullYear() + 1}
              value={year}
              onChange={(event) =>
                setYear(event.target.value)
              }
              placeholder="Ex.: 2024"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Capacidade de passageiros *">
            <input
              type="number"
              min="1"
              value={passengerCapacity}
              onChange={(event) =>
                setPassengerCapacity(event.target.value)
              }
              placeholder="Ex.: 16"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Situação *">
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as VehicleStatus,
                )
              }
              className={inputClassName}
            >
              <option value="active">Ativa</option>
              <option value="maintenance">
                Em manutenção
              </option>
              <option value="inactive">Inativa</option>
            </select>
          </FormField>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white">
          Bagageiro
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Informe o porte e a capacidade de armazenamento.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <FormField label="Porte do bagageiro *">
            <select
              value={luggageSize}
              onChange={(event) =>
                setLuggageSize(
                  event.target.value as LuggageSize,
                )
              }
              className={inputClassName}
            >
              <option value="small">Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
            </select>
          </FormField>

          <FormField label="Capacidade em litros *">
            <input
              type="number"
              min="1"
              value={luggageCapacityLiters}
              onChange={(event) =>
                setLuggageCapacityLiters(
                  event.target.value,
                )
              }
              placeholder="Ex.: 1200"
              className={inputClassName}
            />
          </FormField>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={hasLuggageDimensions}
            onChange={(event) =>
              setHasLuggageDimensions(
                event.target.checked,
              )
            }
            className="size-4 accent-yellow-400"
          />

          Informar dimensões do bagageiro
        </label>

        {hasLuggageDimensions && (
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <DimensionInput
              label="Largura"
              value={luggageWidthCm}
              onChange={setLuggageWidthCm}
            />

            <DimensionInput
              label="Altura"
              value={luggageHeightCm}
              onChange={setLuggageHeightCm}
            />

            <DimensionInput
              label="Profundidade"
              value={luggageDepthCm}
              onChange={setLuggageDepthCm}
            />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white">
          Comodidades
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Marque somente os recursos disponíveis nesta van.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featureOptions.map((feature) => {
            const checked = features[feature.name];

            return (
              <label
                key={feature.name}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                  checked
                    ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    handleFeatureChange(feature.name)
                  }
                  className="sr-only"
                />

                <span
                  className={`flex size-5 items-center justify-center rounded border ${
                    checked
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : "border-zinc-600"
                  }`}
                >
                  {checked && <Check size={14} />}
                </span>

                <span className="text-sm font-medium">
                  {feature.label}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white">
          Fotos e vídeos
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Adicione mídias da van e escolha uma delas como
          capa.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4"
          onChange={handleMediaChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 px-5 py-8 text-zinc-300 transition hover:border-yellow-400 hover:text-yellow-300"
        >
          <Upload size={20} />
          Selecionar fotos ou vídeos
        </button>

        <p className="mt-3 text-xs text-zinc-500">
          JPG, PNG ou WEBP até 10 MB. MP4 até 100 MB.
        </p>

        {displayMedia.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayMedia.map((media) => (
              <article
                key={media.id}
                className={`overflow-hidden rounded-xl border ${
                  media.isCover
                    ? "border-yellow-400"
                    : "border-zinc-800"
                } bg-zinc-900`}
              >
                <div className="relative aspect-video bg-black">
                  {media.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.url}
                      alt={
                        media.fileName ??
                        `Mídia da van ${model}`
                      }
                      className="size-full object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      controls
                      playsInline
                      className="size-full object-cover"
                    />
                  )}

                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/75 px-2 py-1 text-xs text-white">
                    {media.type === "image" ? (
                      <ImageIcon size={13} />
                    ) : (
                      <Video size={13} />
                    )}

                    {media.existing
                      ? "Salva"
                      : "Nova"}
                  </span>

                  {media.isCover && (
                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-1 text-xs font-semibold text-black">
                      <Star
                        size={13}
                        fill="currentColor"
                      />
                      Capa
                    </span>
                  )}
                </div>

                <div className="flex gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => selectCover(media)}
                    disabled={media.isCover}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-3 py-2 text-xs font-semibold text-black disabled:cursor-default disabled:opacity-50"
                  >
                    <Star size={14} />
                    Usar como capa
                  </button>

                  <button
                    type="button"
                    onClick={() => removeMedia(media)}
                    aria-label="Remover mídia"
                    className="rounded-lg border border-red-500/40 px-3 py-2 text-red-400 transition hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {coverMedia && (
          <p className="mt-4 text-sm text-yellow-300">
            Uma mídia está selecionada como capa da van.
          </p>
        )}
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="flex min-w-48 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
              Salvando...
            </>
          ) : (
            <>
              <Check size={19} />

              {isEditing
                ? "Salvar alterações"
                : "Cadastrar van"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const inputClassName =
  "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400";

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
};

function FormField({
  label,
  children,
}: FormFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-200">
        {label}
      </span>

      {children}
    </label>
  );
}

type DimensionInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function DimensionInput({
  label,
  value,
  onChange,
}: DimensionInputProps) {
  return (
    <FormField label={`${label} (cm)`}>
      <input
        type="number"
        min="1"
        step="0.1"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={inputClassName}
      />
    </FormField>
  );
}