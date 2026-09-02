import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const testRef = adminDb
      .collection("system")
      .doc("connection-test");

    await testRef.set(
      {
        connected: true,
        message: "Firebase conectado ao TransToledo",
        updatedAt: new Date(),
      },
      {
        merge: true,
      }
    );

    const snapshot = await testRef.get();

    return NextResponse.json({
      success: true,
      data: snapshot.data(),
    });
  } catch (error) {
    console.error(
      "Erro na conexão com Firebase:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Não foi possível conectar ao Firebase.",
      },
      {
        status: 500,
      }
    );
  }
}