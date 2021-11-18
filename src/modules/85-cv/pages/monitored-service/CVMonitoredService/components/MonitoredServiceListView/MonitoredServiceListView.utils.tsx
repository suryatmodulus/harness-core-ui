import type { UseStringsReturn } from 'framework/strings'
import { FilterTypes } from '../../CVMonitoredService.types'

export const getListTitle = (
  getString: UseStringsReturn['getString'],
  type: FilterTypes,
  serviceCount: number
): string => {
  // Replace if with switch while adding more cases
  if (type === FilterTypes.RISK) {
    return getString('cv.monitoredServices.showingServiceAtRisk', { serviceCount })
  }

  return getString('cv.monitoredServices.showingAllServices', { serviceCount })
}
