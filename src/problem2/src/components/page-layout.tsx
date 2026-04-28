import type { ReactNode } from 'react'

type Props = {
  header: ReactNode
  children: ReactNode
}

export function PageLayout({ header, children }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      {/* Gradient blooms — three layers for depth, slowly drifting */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="bloom-drift-a absolute -left-40 -top-40 size-[560px] rounded-full bg-[radial-gradient(circle,_oklch(0.65_0.22_286_/_0.55)_0%,_oklch(0.7_0.22_286_/_0.3)_35%,_transparent_70%)] blur-3xl will-change-transform dark:bg-[radial-gradient(circle,_oklch(0.55_0.28_286_/_0.7)_0%,_oklch(0.55_0.28_286_/_0.35)_35%,_transparent_70%)]"
          style={{ animation: 'bloom-drift-a 18s ease-in-out infinite' }}
        />
        <div
          className="bloom-drift-b absolute -right-40 -bottom-32 size-[560px] rounded-full bg-[radial-gradient(circle,_oklch(0.7_0.22_340_/_0.55)_0%,_oklch(0.75_0.22_340_/_0.3)_35%,_transparent_70%)] blur-3xl will-change-transform dark:bg-[radial-gradient(circle,_oklch(0.6_0.28_340_/_0.7)_0%,_oklch(0.6_0.28_340_/_0.35)_35%,_transparent_70%)]"
          style={{ animation: 'bloom-drift-b 22s ease-in-out infinite' }}
        />
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2">
          <div
            className="bloom-drift-c size-[480px] rounded-full bg-[radial-gradient(circle,_oklch(0.72_0.18_200_/_0.45)_0%,_oklch(0.75_0.18_200_/_0.25)_40%,_transparent_70%)] blur-3xl will-change-transform dark:bg-[radial-gradient(circle,_oklch(0.6_0.22_200_/_0.55)_0%,_oklch(0.6_0.22_200_/_0.25)_40%,_transparent_70%)]"
            style={{ animation: 'bloom-drift-c 26s ease-in-out infinite' }}
          />
        </div>
      </div>
      {/* Subtle grid for texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025] [background-image:linear-gradient(to_right,_currentColor_1px,_transparent_1px),linear-gradient(to_bottom,_currentColor_1px,_transparent_1px)] [background-size:48px_48px] dark:opacity-[0.04]"
      />
      {header}
      <main className="mx-auto flex w-full max-w-md flex-col items-stretch px-4 pb-16 pt-10 md:pt-20">
        {children}
      </main>
    </div>
  )
}
