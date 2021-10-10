import type { ChangeEventDTO } from 'services/cv'

export const createDetailsTitle = (type?: string, category?: string) => {
  switch (category) {
    case category:
      return `${type} ${category} `
    default:
      return ''
  }
}

export const onClickEvent = (detailsItem: { name: string; url?: string } | ChangeEventDTO['type']) => {
  if (typeof detailsItem !== 'string' && detailsItem?.url) {
    return {
      onClick: () => window.open(detailsItem?.url, '_blank')
    }
  }
  return {}
}
