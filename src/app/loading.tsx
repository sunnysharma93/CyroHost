export default function Loading() {
  return (
    <div className="shell py-24" role="status" aria-live="polite">
      <p className="kicker">Loading</p>
      <div className="mt-6 h-10 max-w-md bg-panel" />
      <div className="mt-4 h-4 max-w-xl bg-panel" />
      <div className="mt-3 h-4 max-w-lg bg-panel" />
    </div>
  );
}
