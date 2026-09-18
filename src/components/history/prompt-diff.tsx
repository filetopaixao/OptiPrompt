import { diffWords } from "diff";
import { cn } from "@/lib/utils";

/** Diff palavra-a-palavra entre duas versões de um mesmo campo de prompt. */
export function PromptDiff({ before, after }: { before: string; after: string }) {
  if (before === after) {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed">{after || "(vazio)"}</p>;
  }

  const changes = diffWords(before, after);

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">
      {changes.map((change, index) => (
        <span
          key={index}
          className={cn(
            change.added && "bg-emerald-200/70 text-emerald-950 dark:bg-emerald-500/25 dark:text-emerald-300",
            change.removed &&
              "bg-rose-200/70 text-rose-950 line-through dark:bg-rose-500/25 dark:text-rose-300",
          )}
        >
          {change.value}
        </span>
      ))}
    </p>
  );
}
