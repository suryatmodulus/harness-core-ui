import type { IconName } from '@wings-software/uicore'
import { getIconBySourceType } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { DropdownData } from './HealthSourceDropDown.types'

export const getDropdownOptions = (
  { loading, error, data, verificationType }: DropdownData,
  getString: UseStringsReturn['getString']
): SelectOption[] | [] => {
  if (loading) {
    return [{ value: '', label: getString('loading') }]
  }
  if (error) {
    return []
  }

  const options = []
  for (const source of data?.resource || []) {
    if (source?.identifier && source?.name && source?.verificationType === verificationType) {
      options.push({
        label: source.name,
        value: source.identifier as string,
        icon: { name: getIconBySourceType(source?.type as string) as IconName }
      })
    }
  }

  if (options.length > 1) {
    options.unshift({ label: getString('all'), value: 'all' })
  }

  return options
}
