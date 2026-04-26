"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useApiClient } from "@/APIClient";
import TaskCard from "@/components/TaskCard";
import { useAuth } from "@/context/auth";

type TaskStatus = "STARTED" | "IN_PROGRESS" | "COMPLETED";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
};

type TaskForm = {
  id: string;
  title: string;
  status: TaskStatus;
};

const defaultForm: TaskForm = {
  id: "",
  title: "",
  status: "STARTED",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  return fallback;
};

const isStatus = (value: string): value is TaskStatus => {
  return value === "STARTED" || value === "IN_PROGRESS" || value === "FINISHED";
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const readError = (payload: unknown) => {
  if (isObject(payload) && typeof payload.error === "string") {
    return payload.error;
  }

  return null;
};

const readTasks = (payload: unknown) => {
  if (!isObject(payload) || !Array.isArray(payload.tasks)) {
    return [];
  }

  const { tasks: data } = payload;

  console.log("Inside Read Tasks", data);

  return data?.filter((item): item is Task => {
    if (!isObject(item)) {
      debugger;
      return false;
    }

    return (
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.status === "string" &&
      isStatus(item.status)
    );
  });
};

const readTask = (payload: unknown) => {
  if (!isObject(payload) || !isObject(payload.data)) {
    return null;
  }

  const value = payload.data;
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.status !== "string" ||
    !isStatus(value.status)
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    status: value.status,
  };
};

export default function Dashboard() {
  const apiClient = useApiClient();
  const { logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [isPending, startTransition] = useTransition();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const payload = await apiClient("/api/tasks", {
          method: "GET",
          cache: "no-store",
        });

        if (!payload) {
          throw new Error("Failed to fetch tasks");
        }

        const message = readError(payload);
        if (message) {
          throw new Error(message);
        }

        console.log("TASKS Data", readTasks(payload));

        setTasks(readTasks(payload));
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, "Failed to fetch tasks"));
      } finally {
        setIsLoading(false);
      }
    };

    void loadTasks();
  }, [apiClient]);

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setForm(defaultForm);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setForm(defaultForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setIsEditing(true);
    setForm({
      id: task.id,
      title: task.title,
      status: task.status,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        setError(null);

        const payload = await apiClient("/api/tasks", {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify(
            isEditing
              ? {
                  id: form.id,
                  title: form.title,
                  status: form.status,
                }
              : {
                  title: form.title,
                  status: form.status,
                },
          ),
        });

        if (!payload) {
          throw new Error("Failed to save task");
        }

        const message = readError(payload);
        if (message) {
          throw new Error(message);
        }

        const savedTask = readTask(payload);
        if (!savedTask) {
          throw new Error("Invalid task response");
        }

        if (isEditing) {
          setTasks((currentTasks) =>
            currentTasks.map((task) =>
              task.id === savedTask.id ? savedTask : task,
            ),
          );
        } else {
          setTasks((currentTasks) => [savedTask, ...currentTasks]);
        }

        closeModal();
      } catch (submitError) {
        setError(getErrorMessage(submitError, "Failed to save task"));
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        setDeletingId(id);
        setError(null);

        const payload = await apiClient("/api/tasks", {
          method: "DELETE",
          body: JSON.stringify({ id }),
        });

        const message = readError(payload);
        if (message) {
          throw new Error(message);
        }

        setTasks((currentTasks) =>
          currentTasks.filter((task) => task.id !== id),
        );
      } catch (deleteError) {
        setError(getErrorMessage(deleteError, "Failed to delete task"));
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setError(null);
      await logout();
      router.push("/login");
    } catch (logoutError) {
      setError(getErrorMessage(logoutError, "Failed to log out"));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">
            Manage your Supabase tasks from one place.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            {isLoggingOut ? "Logging Out..." : "Logout"}
          </button>
          <button
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            onClick={openCreateModal}
            type="button"
          >
            Add Task
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          No tasks found. Create your first task.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              isDeleting={deletingId === task.id}
              onDelete={() => handleDelete(task.id)}
              onEdit={() => openEditModal(task)}
              statusBadge={task.status}
              title={task.title}
            />
          ))}
        </div>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">
                {isEditing ? "Edit Task" : "Create Task"}
              </h2>
              <p className="text-sm text-slate-500">
                Update the title and status, then save the task.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="title"
                >
                  Title
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  id="title"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Enter task title"
                  required
                  type="text"
                  value={form.title}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="status"
                >
                  Status
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  id="status"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: isStatus(event.target.value)
                        ? event.target.value
                        : "STARTED",
                    }))
                  }
                  value={form.status}
                >
                  <option value="STARTED">STARTED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  onClick={closeModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
