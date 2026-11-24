export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-16 animate-pulse rounded-full bg-stone-200" />
      </div>
      <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-5 w-20 animate-pulse rounded bg-stone-200" />
        <div className="h-3 w-16 animate-pulse rounded bg-stone-100" />
      </div>
      <div className="h-9 w-full animate-pulse rounded-md bg-stone-200" />
    </div>
  )
}
