import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    const res = await fetch(
      `${process.env.HOUSEFINDER_API_URL}/api/leads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.HOUSEFINDER_API_KEY!,
        },
        body: JSON.stringify({
          name: body.name,
          phone: body.phone,
          address: body.address,
          city: body.city,
          state: body.state,
          zip: body.zip,
          message: body.message ?? "",
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Lead creation failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Lead service unavailable" }, { status: 502 });
  }
}
