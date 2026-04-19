type TaskCardProps = {
  title: string;
  statusBadge: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
};

const TaskCard = ({
  title,
  statusBadge,
  onEdit,
  onDelete,
  isDeleting = false,
}: TaskCardProps) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
            {statusBadge}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          onClick={onEdit}
          type="button"
        >
          Edit
        </button>
        <button
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDeleting}
          onClick={onDelete}
          type="button"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
};

export default TaskCard;
