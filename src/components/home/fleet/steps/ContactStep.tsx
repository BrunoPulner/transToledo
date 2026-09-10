"use client";

import {
  CheckCircle2,
  LoaderCircle,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import type {
  QuoteContact,
} from "@/types/quote";

type ContactStepProps = {
  contact: QuoteContact;
  onContactChange: (
    contact: QuoteContact,
  ) => void;
};

type FormErrors = Partial<
  Record<
    "name" | "email" | "phone",
    string
  >
>;

type Verification = {
  verificationId: string;
  challengeToken: string;
  code: string;
  whatsappUrl: string;
};

type CheckResult = {
  success?: boolean;
  verified?: boolean;
  expired?: boolean;
  message?: string;
  verificationToken?: string;
};

function formatPhone(value: string) {
  const digits = value
    .replace(/\D/g, "")
    .slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function ContactStep({
  contact,
  onContactChange,
}: ContactStepProps) {
  const [errors, setErrors] =
    useState<FormErrors>({});

  const [verification, setVerification] =
    useState<Verification | null>(
      null,
    );

  const [requestError, setRequestError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const completingVerification =
    useRef(false);

  const phoneVerified = Boolean(
    contact.phoneVerificationToken,
  );

  const completeVerification =
    useCallback(
      (verificationToken: string) => {
        if (
          completingVerification.current
        ) {
          return;
        }

        completingVerification.current =
          true;

        onContactChange({
          ...contact,
          name: contact.name.trim(),
          email: contact.email
            .trim()
            .toLowerCase(),
          phoneVerificationToken:
            verificationToken,
        });

        setVerification(null);
        setRequestError("");
        setSubmitting(false);

        console.info(
          "Telefone verificado com sucesso",
          {
            phone: contact.phone,
          },
        );
      },
      [contact, onContactChange],
    );

  const checkVerification =
    useCallback(async () => {
      if (!verification) {
        return false;
      }

      const response = await fetch(
        "/api/public/phone-verification/check",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            verificationId:
              verification.verificationId,
            challengeToken:
              verification.challengeToken,
          }),
        },
      );

      const result =
        (await response.json()) as CheckResult;

      if (
        result.verified &&
        result.verificationToken
      ) {
        completeVerification(
          result.verificationToken,
        );
        return true;
      }

      if (
        !response.ok ||
        result.expired
      ) {
        throw new Error(
          result.message ??
            "Esta confirmação expirou.",
        );
      }

      return false;
    }, [
      completeVerification,
      verification,
    ]);

  useEffect(() => {
    if (!verification) {
      return;
    }

    const interval =
      window.setInterval(() => {
        void checkVerification().catch(
          (error: unknown) => {
            setRequestError(
              error instanceof Error
                ? error.message
                : "Não foi possível consultar a confirmação.",
            );
          },
        );
      }, 2500);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    checkVerification,
    verification,
  ]);

  function updateField(
    field: "name" | "email",
    value: string,
  ) {
    onContactChange({
      ...contact,
      [field]: value,
    });

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function updatePhone(value: string) {
    completingVerification.current =
      false;

    setVerification(null);
    setRequestError("");

    onContactChange({
      ...contact,
      phone: formatPhone(value),
      phoneVerificationToken: "",
    });

    setErrors((current) => ({
      ...current,
      phone: undefined,
    }));
  }

  function validate() {
    const nextErrors: FormErrors = {};
    const phoneDigits =
      contact.phone.replace(/\D/g, "");

    if (contact.name.trim().length < 3) {
      nextErrors.name =
        "Informe seu nome completo.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        contact.email.trim(),
      )
    ) {
      nextErrors.email =
        "Informe um e-mail válido.";
    }

    if (
      phoneDigits.length !== 10 &&
      phoneDigits.length !== 11
    ) {
      nextErrors.phone =
        "Informe um telefone com DDD.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length ===
      0
    );
  }

  async function startVerification() {
    const response = await fetch(
      "/api/public/phone-verification/start",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          phone: contact.phone,
        }),
      },
    );

    const result =
      (await response.json()) as Partial<
        Verification & {
          success: boolean;
          message: string;
        }
      >;

    if (
      !response.ok ||
      !result.success ||
      !result.verificationId ||
      !result.challengeToken ||
      !result.code ||
      !result.whatsappUrl
    ) {
      throw new Error(
        result.message ??
          "Não foi possível iniciar a confirmação.",
      );
    }

    return {
      verificationId:
        result.verificationId,
      challengeToken:
        result.challengeToken,
      code: result.code,
      whatsappUrl:
        result.whatsappUrl,
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (phoneVerified) {
      return;
    }

    if (!verification && !validate()) {
      return;
    }

    setSubmitting(true);
    setRequestError("");

    let whatsappWindow: Window | null =
      null;

    try {
      if (!verification) {
        whatsappWindow = window.open(
          "about:blank",
          "_blank",
        );

        if (whatsappWindow) {
          whatsappWindow.opener = null;
        }

        const createdVerification =
          await startVerification();

        setVerification(
          createdVerification,
        );

        if (whatsappWindow) {
          whatsappWindow.location.href =
            createdVerification.whatsappUrl;
        } else {
          setRequestError(
            "O navegador bloqueou a abertura do WhatsApp. Use o botão abaixo para abri-lo novamente.",
          );
        }

        return;
      }

      const verified =
        await checkVerification();

      if (!verified) {
        setRequestError(
          "Ainda não recebemos a mensagem. Envie o código pelo mesmo número informado e tente novamente em alguns segundos.",
        );
      }
    } catch (error) {
      whatsappWindow?.close();

      setRequestError(
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar o telefone.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <header>
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
            <UserRound size={18} />
          </span>

          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-400">
            Terceira etapa
          </p>
        </div>

        <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">
          Informe seus dados
        </h3>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-white/45">
          Preencha seus dados de contato e confirme seu número pelo WhatsApp.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/15 p-4 sm:p-5">
          <Field
            icon={UserRound}
            label="Nome completo"
            name="name"
            autoComplete="name"
            placeholder="Digite seu nome completo"
            value={contact.name}
            error={errors.name}
            onChange={(value) =>
              updateField("name", value)
            }
          />

          <Field
            icon={Mail}
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seuemail@exemplo.com"
            value={contact.email}
            error={errors.email}
            onChange={(value) =>
              updateField("email", value)
            }
          />

          <Field
            icon={Phone}
            label="WhatsApp com DDD"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="(42) 99999-9999"
            value={contact.phone}
            error={errors.phone}
            disabled={phoneVerified}
            onChange={updatePhone}
          />

          {phoneVerified && (
            <button
              type="button"
              onClick={() =>
                updatePhone("")
              }
              className="text-xs font-semibold text-yellow-400 transition hover:text-yellow-300"
            >
              Usar outro número
            </button>
          )}
        </div>

        <aside
          className={`rounded-2xl border p-5 ${
            phoneVerified
              ? "border-emerald-400/25 bg-emerald-400/8"
              : "border-white/10 bg-white/3"
          }`}
        >
          {phoneVerified ? (
            <VerifiedStatus />
          ) : verification ? (
            <WaitingStatus
              phone={contact.phone}
              verification={verification}
              submitting={submitting}
              onChangePhone={() => {
                setVerification(null);
                setRequestError("");
              }}
              onOpenWhatsApp={() =>
                window.open(
                  verification.whatsappUrl,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            />
          ) : (
            <VerificationIntroduction />
          )}

          {requestError && (
            <p className="mt-4 rounded-xl border border-red-400/15 bg-red-400/8 px-3 py-2.5 text-[11px] leading-5 text-red-300">
              {requestError}
            </p>
          )}

          {!phoneVerified && (
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={15}
                    className="animate-spin"
                  />
                  Aguarde...
                </>
              ) : verification ? (
                "Já enviei, verificar agora"
              ) : (
                <>
                  <MessageCircle size={16} />
                  Confirmar pelo WhatsApp
                </>
              )}
            </button>
          )}
        </aside>
      </form>
    </div>
  );
}

function VerificationIntroduction() {
  return (
    <div>
      <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
        <ShieldCheck size={22} />
      </span>

      <h4 className="mt-4 text-base font-bold text-white">
        Confirme seu telefone
      </h4>

      <p className="mt-2 text-xs leading-5 text-white/45">
        Vamos gerar um código e abrir o WhatsApp com a mensagem pronta. Envie a mensagem para comprovar que este número pertence a você.
      </p>
    </div>
  );
}

function WaitingStatus({
  phone,
  verification,
  submitting,
  onChangePhone,
  onOpenWhatsApp,
}: {
  phone: string;
  verification: Verification;
  submitting: boolean;
  onChangePhone: () => void;
  onOpenWhatsApp: () => void;
}) {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
        <MessageCircle size={22} />
      </span>

      <h4 className="mt-4 text-base font-bold text-white">
        Envie o código pelo WhatsApp
      </h4>

      <p className="mt-2 text-xs leading-5 text-white/45">
        Envie a mensagem pelo número{" "}
        <strong className="text-white/75">
          {phone}
        </strong>
        .
      </p>

      <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/8 px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">
          Código temporário
        </p>
        <p className="mt-1 text-xl font-black tracking-[0.16em] text-yellow-300">
          {verification.code}
        </p>
      </div>

      <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-white/40">
        <LoaderCircle
          size={13}
          className="animate-spin"
        />
        Aguardando a mensagem chegar...
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
        <button
          type="button"
          disabled={submitting}
          onClick={onChangePhone}
          className="text-white/45 transition hover:text-white"
        >
          Alterar número
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={onOpenWhatsApp}
          className="text-yellow-400 transition hover:text-yellow-300"
        >
          Abrir WhatsApp novamente
        </button>
      </div>
    </div>
  );
}

function VerifiedStatus() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
        <CheckCircle2 size={27} />
      </span>

      <h4 className="mt-4 text-lg font-bold text-white">
        Telefone confirmado
      </h4>

      <p className="mt-2 max-w-xs text-xs leading-5 text-emerald-100/60">
        Seu número foi verificado com sucesso. Agora você pode continuar para revisar o orçamento.
      </p>
    </div>
  );
}

type FieldProps = {
  icon: typeof UserRound;
  label: string;
  name: string;
  value: string;
  placeholder: string;
  error?: string;
  type?: "text" | "email" | "tel";
  inputMode?: "numeric";
  autoComplete?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function Field({
  icon: Icon,
  label,
  error,
  onChange,
  ...inputProps
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.11em] text-white/45">
        {label}
      </span>

      <span className="relative block">
        <Icon
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
        />

        <input
          {...inputProps}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`h-12 w-full rounded-xl border bg-black/20 pl-11 pr-3 text-sm text-white outline-none transition placeholder:text-white/20 disabled:cursor-not-allowed disabled:text-white/50 ${
            error
              ? "border-red-400/45 focus:border-red-400"
              : "border-white/10 focus:border-yellow-400/55"
          }`}
        />
      </span>

      {error && (
        <span className="mt-1 block text-[10px] text-red-300">
          {error}
        </span>
      )}
    </label>
  );
}
