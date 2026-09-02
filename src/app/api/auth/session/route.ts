import { NextResponse } from "next/server";

import { adminAuth } from "@/lib/firebase/admin";

const SESSION_DURATION =
   1000 * 60 * 60 * 24 * 3;

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Token não informado.",
        },
        {
          status: 400,
        }
      );
    }

    await adminAuth.verifyIdToken(idToken);

    const sessionCookie =
      await adminAuth.createSessionCookie(
        idToken,
        {
          expiresIn: SESSION_DURATION,
        }
      );

    const response = NextResponse.json({
      success: true,
      message: "Sessão criada com sucesso.",
    });

    response.cookies.set({
      name: "transtoledo_session",
      value: sessionCookie,

      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge:
        SESSION_DURATION / 1000,
    });

    return response;
  } catch (error) {
    console.error(
      "Erro ao criar sessão administrativa:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Não foi possível criar a sessão.",
      },
      {
        status: 401,
      }
    );
  }
}