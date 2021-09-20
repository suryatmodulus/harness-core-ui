import type { FormikContext } from 'formik'
import { isEqual, omit } from 'lodash-es'
import type { MonitoredServiceDTO } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { MonitoredServiceType } from './components/MonitoredServiceOverview/MonitoredServiceOverview.constants'
import type { MonitoredServiceForm } from './Service.types'

export const getInitFormData = (
  data: MonitoredServiceDTO | undefined,
  defaultMonitoredService: MonitoredServiceDTO | undefined,
  isEdit: boolean
): MonitoredServiceForm => {
  const monitoredServiceData = isEdit ? data : defaultMonitoredService

  const {
    name = '',
    identifier = '',
    description = '',
    tags = {},
    serviceRef = '',
    environmentRef = '',
    sources,
    dependencies = [],
    type
  } = monitoredServiceData || {}

  return {
    isEdit,
    name,
    identifier,
    description,
    tags,
    serviceRef,
    type: (type as MonitoredServiceForm['type']) || MonitoredServiceType.APPLICATION,
    environmentRef,
    sources,
    dependencies
  }
}

export const isCacheUpdated = (
  initialValues: MonitoredServiceForm | null | undefined,
  cachedInitialValues: MonitoredServiceForm | null | undefined
): boolean => {
  if (!cachedInitialValues) {
    return false
  }
  return !isEqual(omit(cachedInitialValues, 'dependencies'), omit(initialValues, 'dependencies'))
}

export const onSave = async ({
  formik,
  isEdit,
  getString,
  onSuccess,
  showSuccess,
  showError
}: {
  formik: FormikContext<any>
  isEdit: boolean
  getString: UseStringsReturn['getString']
  onSuccess: (val: MonitoredServiceForm) => Promise<void>
  showSuccess: (val: string) => void
  showError: (val: string) => void
}): Promise<void> => {
  const validResponse = await formik?.validateForm()
  if (!Object.keys(validResponse).length) {
    try {
      await onSuccess(formik?.values)
      showSuccess(
        getString(
          isEdit ? 'cv.monitoredServices.monitoredServiceUpdated' : 'cv.monitoredServices.monitoredServiceCreated'
        )
      )
    } catch (error) {
      showError(getErrorMessage(error) || '')
    }
  } else {
    formik?.submitForm()
  }
}

export function updateMonitoredServiceDTOOnTypeChange(
  type: MonitoredServiceDTO['type'],
  monitoredServiceForm: MonitoredServiceForm
): MonitoredServiceDTO {
  const monitoredServiceDTO: MonitoredServiceDTO = omit(monitoredServiceForm, ['isEdit']) as MonitoredServiceDTO

  if (!monitoredServiceDTO.sources) {
    monitoredServiceDTO.sources = { changeSources: [], healthSources: [] }
  }

  monitoredServiceDTO.sources.changeSources =
    monitoredServiceDTO.sources.changeSources?.filter(source => {
      if (type === 'Application' && source.type !== 'K8sCluster') {
        return true
      }
      if (type === 'Infrastructure' && source.type !== 'HarnessCD') {
        return true
      }
      return false
    }) || []

  monitoredServiceDTO.type = type
  return monitoredServiceDTO
}
