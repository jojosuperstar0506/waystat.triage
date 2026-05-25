import { humanizeFieldKey } from "@/lib/format";

interface ExtractedFieldsProps {
  fields: Record<string, unknown> | null;
}

export function ExtractedFields({ fields }: ExtractedFieldsProps) {
  if (!fields || Object.keys(fields).length === 0) {
    return (
      <p className="text-sm text-zinc-500 italic">No structured fields extracted.</p>
    );
  }
  const entries = Object.entries(fields);
  return (
    <dl className="divide-y divide-zinc-100">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-[10rem_1fr] gap-4 py-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {humanizeFieldKey(key)}
          </dt>
          <dd className="text-sm text-zinc-800">{renderValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderValue(value: unknown): React.ReactNode {
  if (value == null || value === "") {
    return <span className="text-zinc-400">—</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-zinc-400">—</span>;
    return (
      <ul className="flex flex-wrap gap-1.5">
        {value.map((v, i) => (
          <li
            key={i}
            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
          >
            {String(v)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "boolean") {
    return (
      <span
        className={
          value
            ? "rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200"
            : "rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200"
        }
      >
        {String(value)}
      </span>
    );
  }
  if (typeof value === "object") {
    return (
      <pre className="overflow-x-auto rounded-md bg-zinc-50 p-2 text-xs text-zinc-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return String(value);
}
