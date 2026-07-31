import { useEffect } from 'react'

type PageMeta = {
  title: string
  description: string
}

export function usePageMeta({ title, description }: PageMeta) {
  useEffect(() => {
    document.title = title

    let descriptionMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    )

    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta')
      descriptionMeta.name = 'description'
      document.head.appendChild(descriptionMeta)
    }

    descriptionMeta.content = description
  }, [description, title])
}
