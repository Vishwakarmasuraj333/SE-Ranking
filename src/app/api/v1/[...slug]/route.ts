import { NextRequest, NextResponse } from "next/server";

const API_SERVER_URL = process.env.API_SERVER_URL || "http://localhost:5000";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join("/");
  const url = `${API_SERVER_URL}/api/v1/${path}${request.nextUrl.search}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
        "X-Correlation-ID": request.headers.get("X-Correlation-ID") || crypto.randomUUID(),
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        errors: [`Backend Node.js API connection failed: ${(error as Error).message}`],
      },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join("/");
  const url = `${API_SERVER_URL}/api/v1/${path}`;

  try {
    const body = await request.text();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
        "X-Correlation-ID": request.headers.get("X-Correlation-ID") || crypto.randomUUID(),
      },
      body,
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        errors: [`Backend Node.js API connection failed: ${(error as Error).message}`],
      },
      { status: 502 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join("/");
  const url = `${API_SERVER_URL}/api/v1/${path}`;

  try {
    const body = await request.text();
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
        "X-Correlation-ID": request.headers.get("X-Correlation-ID") || crypto.randomUUID(),
      },
      body,
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        errors: [`Backend Node.js API connection failed: ${(error as Error).message}`],
      },
      { status: 502 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join("/");
  const url = `${API_SERVER_URL}/api/v1/${path}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
        "X-Correlation-ID": request.headers.get("X-Correlation-ID") || crypto.randomUUID(),
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        errors: [`Backend Node.js API connection failed: ${(error as Error).message}`],
      },
      { status: 502 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join("/");
  const url = `${API_SERVER_URL}/api/v1/${path}`;

  try {
    const body = await request.text();
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
        "X-Correlation-ID": request.headers.get("X-Correlation-ID") || crypto.randomUUID(),
      },
      body: body || undefined,
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        errors: [`Backend Node.js API connection failed: ${(error as Error).message}`],
      },
      { status: 502 }
    );
  }
}
