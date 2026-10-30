// import Image from "next/image";

// export default function TheLookSkeleton() {
//   return (
//     <section
//       aria-label="Loading The Look"
//       aria-busy="true"
//       className="overflow-hidden sm:px-5 md:px-6 xl:px-10 sm:py-10"
//     >
//       <div className="mx-auto grid min-h-[78svh] max-w-450 lg:grid-cols-[1.45fr_1fr] xl:grid-cols-[1fr_1.30fr]">
//         {/* Model skeleton */}
//         <div className="relative flex min-h-[72svh] items-center justify-center overflow-hidden bg-surface xl:min-h-[78svh]">
//           <Image
//             src="/images/brand/sepy-logo.svg"
//             alt=""
//             width={85}
//             height={85}
//             aria-hidden="true"
//             className="h-95 w-auto max-w-[85%] object-contain opacity-20"
//           />
//         </div>

//         {/* Products skeleton */}
//         <div className="flex w-full min-w-0 flex-col justify-center px-2 py-10 md:px-0 lg:pl-10 xl:pl-14">
//           <div className="mb-9 text-center lg:text-left">
//             <div className="mx-auto h-2.5 w-16 animate-pulse bg-surface-muted motion-reduce:animate-none lg:mx-0" />

//             <div className="mx-auto mt-4 h-9 w-3/4 animate-pulse bg-surface motion-reduce:animate-none lg:mx-0" />
//           </div>

//           <div className="flex gap-1 overflow-hidden sm:gap-2">
//             {Array.from({ length: 4 }, (_, index) => (
//               <div
//                 key={index}
//                 aria-hidden="true"
//                 className="w-[calc((100vw-3rem)/2)] shrink-0 sm:w-[calc((100vw-5rem)/2)] lg:w-[calc((100%-0.75rem)/2)]"
//               >
//                 <div className="relative aspect-3/4 overflow-hidden bg-surface">
//                   <div className="absolute inset-0 animate-pulse bg-surface-muted motion-reduce:animate-none" />
//                 </div>

//                 <div className="mx-auto mt-3 h-2.5 w-3/4 animate-pulse bg-surface-muted motion-reduce:animate-none" />
//               </div>
//             ))}
//           </div>

//           <div className="mt-7 flex justify-center">
//             <div className="h-px w-40 bg-surface-muted sm:w-50" />
//           </div>

//           <div className="mx-auto mt-7 h-3 w-28 animate-pulse bg-surface-muted motion-reduce:animate-none" />
//         </div>
//       </div>

//       <span className="sr-only">Loading The Look...</span>
//     </section>
//   );
// }


import Image from "next/image";

export default function TheLookSkeleton() {
  return (
    <section
      aria-label="Loading The Look"
      aria-busy="true"
      className="overflow-hidden sm:px-5 md:px-6 xl:px-10 sm:py-10"
    >
      <div className="mx-auto grid min-h-[78svh] max-w-450 lg:grid-cols-[1.45fr_1fr] xl:grid-cols-[1fr_1.30fr]">
        {/* Model skeleton */}
        <div className="relative flex min-h-[72svh] items-center justify-center overflow-hidden bg-surface xl:min-h-[78svh]">
          <Image
            src="/images/brand/sepy-logo.svg"
            alt=""
            width={85}
            height={85}
            aria-hidden="true"
            className="h-95 w-auto max-w-[85%] object-contain opacity-20"
          />
        </div>

        {/* Products skeleton */}
        <div className="flex w-full min-w-0 flex-col justify-center px-2 py-10 md:px-0 lg:pl-10 xl:pl-14">
          {/* Heading */}
          <div className="mb-9 text-center lg:text-left">
            <div className="mx-auto h-2.5 w-16 animate-pulse bg-surface-muted motion-reduce:animate-none lg:mx-0" />

            <div className="mx-auto mt-4 h-9 w-3/4 animate-pulse bg-surface motion-reduce:animate-none lg:mx-0" />
          </div>

          {/* Product cards */}
          <div className="overflow-hidden">
            <div className="flex w-max gap-1 sm:gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <article
                  key={index}
                  aria-hidden="true"
                  className="w-[calc((100vw-3rem)/2)] shrink-0 sm:w-[calc((100vw-5rem)/2)] lg:w-[calc((100%-0.75rem)/2)]"
                >
                  <div className="relative flex aspect-3/4 items-center justify-center overflow-hidden bg-surface">
                    <div className="absolute inset-0 animate-pulse bg-surface-muted motion-reduce:animate-none" />

                    <Image
                      src="/images/brand/sepy-logo.svg"
                      alt=""
                      width={48}
                      height={48}
                      className="relative h-48 w-auto max-w-[85%] object-contain opacity-20"
                    />
                  </div>

                  <div className="mx-auto mt-3 h-2.5 w-3/4 animate-pulse bg-surface-muted motion-reduce:animate-none" />
                </article>
              ))}
            </div>
          </div>

          {/* Progress skeleton */}
          <div className="mt-7 flex justify-center">
            <div className="h-px w-40 bg-surface-muted sm:w-50" />
          </div>

          {/* Explore link skeleton */}
          <div className="mx-auto mt-7 h-3 w-28 animate-pulse bg-surface-muted motion-reduce:animate-none" />
        </div>
      </div>

      <span className="sr-only">Loading The Look...</span>
    </section>
  );
}
