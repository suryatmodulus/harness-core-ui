import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { MapCustomHealthToService } from '../../CustomHealthSource.types'

export function initializeGroupNames(
  mappedMetrics: Map<string, MapCustomHealthToService>,
  getString: UseStringsReturn['getString']
): SelectOption[] {
  const groupNames = Array.from(mappedMetrics?.entries())
    .map(metric => {
      const { groupName } = metric?.[1] || {}
      return groupName || null
    })
    .filter(groupItem => groupItem !== null) as SelectOption[]
  return [{ label: getString('cv.addNew'), value: '' }, ...groupNames]
}
