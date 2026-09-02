import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { adminAuth } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get(
      "transtoledo_session"
    )?.value;

    if (!sessionCookie) {
      return NextResponse.json({
        authenticated: false,
      });
    }

    const decodedToken =
      await adminAuth.verifySessionCookie(
        sessionCookie,
        true
      );

    return NextResponse.json({
      authenticated: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email ?? null,
      },
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
    });
  }
}