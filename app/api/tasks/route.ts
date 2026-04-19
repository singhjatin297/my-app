import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { createClient } from "@/utils/supabase/server";

type TaskStatus = "todo" | "in-progress" | "done";

type CreateTaskBody = {
  title?: unknown;
  status?: unknown;
};

type UpdateTaskBody = {
  id?: unknown;
  title?: unknown;
  status?: unknown;
};

const VALID_STATUSES: TaskStatus[] = ["todo", "in-progress", "done"];

const isTaskStatus = (value: unknown): value is TaskStatus =>
  typeof value === "string" && VALID_STATUSES.includes(value as TaskStatus);

const getSupabase = async () => {
  const cookieStore = await cookies();
  return createClient(cookieStore);
};

const parseJson = async <T>(request: Request): Promise<T | null> => {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
};

const getUserEmail = async (request: Request) => {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length);
  const accessSecret = process.env.NEXT_LOGIN_ACCESS_SECRET;

  if (!accessSecret) {
    throw new Error("Missing access token secret");
  }

  const secret = new TextEncoder().encode(accessSecret);
  const { payload } = await jwtVerify(token, secret);

  return typeof payload.email === "string" ? payload.email : null;
};

export async function GET(request: Request) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseJson<CreateTaskBody>(request);

    if (!body || typeof body.title !== "string" || body.title.trim() === "") {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 },
      );
    }

    if (body.status !== undefined && !isTaskStatus(body.status)) {
      return NextResponse.json(
        { error: "status must be todo, in-progress, or done" },
        { status: 400 },
      );
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_email: userEmail,
        title: body.title.trim(),
        status: body.status ?? "todo",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseJson<UpdateTaskBody>(request);

    if (!body || typeof body.id !== "string" || body.id.trim() === "") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updates: Record<string, string> = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || body.title.trim() === "") {
        return NextResponse.json(
          { error: "title must be a non-empty string" },
          { status: 400 },
        );
      }

      updates.title = body.title.trim();
    }

    if (body.status !== undefined) {
      if (!isTaskStatus(body.status)) {
        return NextResponse.json(
          { error: "status must be todo, in-progress, or done" },
          { status: 400 },
        );
      }

      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Provide at least one field to update" },
        { status: 400 },
      );
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", body.id)
      .eq("user_email", userEmail)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseJson<{ id?: unknown }>(request);

    if (!body || typeof body.id !== "string" || body.id.trim() === "") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = await getSupabase();
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", body.id)
      .eq("user_email", userEmail);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
