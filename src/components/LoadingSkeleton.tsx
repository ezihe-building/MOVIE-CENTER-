export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] bg-dark-800">
      <div className="absolute inset-0 skeleton" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl space-y-4">
            <div className="w-24 h-6 skeleton rounded-full" />
            <div className="w-96 h-12 skeleton rounded-lg" />
            <div className="w-full h-20 skeleton rounded-lg" />
            <div className="flex gap-3">
              <div className="w-36 h-12 skeleton rounded-xl" />
              <div className="w-36 h-12 skeleton rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <section className="mb-10 md:mb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-48 h-8 skeleton rounded-lg mb-5" />
        <div className="flex gap-3 md:gap-4 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[185px] lg:w-[200px]">
              <div className="aspect-[2/3] skeleton rounded-xl mb-3" />
              <div className="w-3/4 h-4 skeleton rounded mb-2" />
              <div className="w-1/2 h-3 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GridSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
      <div className="w-48 h-8 skeleton rounded-lg mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[2/3] skeleton rounded-xl mb-3" />
            <div className="w-3/4 h-4 skeleton rounded mb-2" />
            <div className="w-1/2 h-3 skeleton rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-dark-900">
      <div className="relative h-[50vh] md:h-[60vh] skeleton" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-64 aspect-[2/3] skeleton rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-4 pt-4">
            <div className="w-96 h-10 skeleton rounded-lg" />
            <div className="w-64 h-6 skeleton rounded-lg" />
            <div className="w-full h-32 skeleton rounded-lg" />
            <div className="flex gap-3">
              <div className="w-40 h-12 skeleton rounded-xl" />
              <div className="w-40 h-12 skeleton rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
