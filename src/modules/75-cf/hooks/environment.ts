import type { SelectOption } from '@wings-software/uicore'
import { useStrings, StringKeys } from 'framework/exports'
import { GetEnvironmentListForProjectQueryParams, useGetEnvironmentListForProject } from 'services/cd-ng'

export const useEnvironments = (queryParams: GetEnvironmentListForProjectQueryParams) => {
  const { data: environments, loading, error, refetch } = useGetEnvironmentListForProject({
    queryParams
  })

  const convertToSelectOptions: SelectOption[] =
    environments?.data?.content?.map<SelectOption>(elem => ({
      label: elem.name as string,
      value: elem.identifier as string
    })) || []

  return {
    data: convertToSelectOptions,
    loading,
    error,
    refetch
  }
}

/**
 * getEnvString prepends "cf.environments" to given argument
 * Provides base getString in case of needing it
 */
export const useEnvStrings = () => {
  const { getString } = useStrings()
  return {
    getEnvString: (key: string, vars?: Record<string, any>) =>
      getString(`cf.environments.${key}` as StringKeys /* TODO: fix this by using a map */, vars),
    getString
  }
}
