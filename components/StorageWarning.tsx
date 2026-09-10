export function StorageWarning({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <span aria-hidden className="mt-0.5 font-bold">
        ⚠
      </span>
      <p>
        {message} You can keep using the app, but your data won&apos;t survive a
        page reload.
      </p>
    </div>
  );
}
