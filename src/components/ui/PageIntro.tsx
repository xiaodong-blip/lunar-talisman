import type { ReactNode } from 'react'

type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
  accentClass?: string
  children?: ReactNode
}

export function PageIntro({
  eyebrow,
  title,
  description,
  accentClass = 'text-chakra-crown',
  children,
}: PageIntroProps) {
  return (
    <section className="content-wrap px-4 pb-12 pt-28 md:px-6 md:pb-16 md:pt-32">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-end">
        <div>
          <p
            className={`text-sm font-medium uppercase tracking-[0.3em] ${accentClass}`}
          >
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
            {description}
          </p>
        </div>
        {children ? <div className="lg:justify-self-end">{children}</div> : null}
      </div>
    </section>
  )
}
