export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 h-5 w-3/4 rounded bg-border" />
      <div className="mb-3 h-4 w-full rounded bg-border" />
      <div className="flex items-center justify-between">
        <div className="h-5 w-1/3 rounded bg-border" />
        <div className="h-6 w-16 rounded bg-border" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-5 text-center">
      <div className="mx-auto mb-2 h-8 w-16 rounded bg-border" />
      <div className="mx-auto h-4 w-20 rounded bg-border" />
    </div>
  );
}

export function SkeletonBookingCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex-1">
          <div className="mb-2 h-5 w-1/3 rounded bg-border" />
          <div className="mb-1 h-4 w-2/3 rounded bg-border" />
          <div className="h-4 w-1/2 rounded bg-border" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-lg bg-border" />
          <div className="h-9 w-20 rounded-lg bg-border" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonSlotButton() {
  return (
    <div className="h-11 w-24 animate-pulse rounded-lg bg-border" />
  );
}

export function SkeletonDayCell() {
  return (
    <div className="min-h-[40px] animate-pulse rounded-lg bg-border md:min-h-[60px]" />
  );
}
