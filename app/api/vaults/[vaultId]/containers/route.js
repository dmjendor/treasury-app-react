import { createContainerInDb } from "@/app/_lib/data/containers.data";
import { NextResponse } from "next/server";

function toBool(v) {
  return v === true || v === "true" || v === "on" || v === "1";
}

// Replace this with your real Supabase insert
export async function POST(req, { params }) {
  try {
    const { vaultId } = await params;
    const body = await req.json();

    const name = body?.name?.toString().trim();
    const is_hidden = toBool(body?.is_hidden);

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const created = await createContainerInDb({
      name,
      is_hidden,
      vault_id: vaultId,
    });
    return NextResponse.json({ container: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Failed to create container" },
      { status: 500 },
    );
  }
}
