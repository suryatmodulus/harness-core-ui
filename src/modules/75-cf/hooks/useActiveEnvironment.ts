import { useQueryParams } from '@common/hooks'

const useActiveEnvironment = (): {
  activeEnvironment: string
  withActiveEnvironment: (url: string, envOverride?: string) => string
} => {
  const activeEnvironment = useQueryParams<Record<string, string>>()?.activeEnvironment || ''

  const withActiveEnvironment = (url: string, envOverride?: string): string => {
    const env = envOverride ?? activeEnvironment
    if (!env || url.includes(`activeEnvironment=${env}`)) return url

    if (url.includes('activeEnvironment')) return url.replace(/activeEnvironment=[^&]+/gi, `activeEnvironment=${env}`)

    return `${url}${url.includes('?') ? '&' : '?'}activeEnvironment=${env}`
  }

  return {
    activeEnvironment: activeEnvironment !== 'undefined' ? activeEnvironment : '',
    withActiveEnvironment
  }
}

export default useActiveEnvironment
