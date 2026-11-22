export default function SkeletonPaqueteCard() {
  return (
    <div className="flex min-h-[340px] w-full max-w-sm flex-col overflow-hidden rounded-2xl border-0 bg-gray-100 shadow-lg mx-auto aspect-4/5 animate-pulse">
      {/* Área de imagen */}
      <div className="flex-1 bg-gray-100" />

      {/* Bloque inferior: barras que simulan contenido */}
      <div className="space-y-3 p-4">
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-3 w-16 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-5/6 rounded bg-gray-200" />
        </div>
        <div className="flex gap-1">
          <div className="h-6 w-6 rounded-md bg-gray-200" />
          <div className="h-6 w-6 rounded-md bg-gray-200" />
          <div className="h-6 w-6 rounded-md bg-gray-200" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-28 rounded bg-gray-200" />
          <div className="h-9 w-24 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
