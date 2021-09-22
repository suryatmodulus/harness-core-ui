import type { SelectOption } from '@wings-software/uicore'
import type { UseStringsReturn } from 'framework/strings'

export function getSelectPlaceholder({
  loading,
  error,
  options,
  getString,
  isNamespace
}: {
  loading: boolean
  error: boolean
  options: SelectOption[]
  getString: UseStringsReturn['getString']
  isNamespace?: boolean
}): string {
  if (loading) {
    return getString('loading')
  }
  if (error || !options?.length) {
    return ''
  }

  return isNamespace ? getString('cv.selectNamespace') : getString('cv.selectWorkload')
}

export function getWorkloadNamespaceOptions({
  error,
  loading,
  list
}: {
  error: boolean
  loading: boolean
  list?: string[]
}): SelectOption[] {
  if (error || loading || !list?.length) return []
  return list.map(k8Entity => ({ label: k8Entity, value: k8Entity }))
}
