import type { IOptionProps } from '@blueprintjs/core'
import type { SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { ResponseListMonitoredServiceWithHealthSources } from 'services/cv'
import type { SLOForm } from '../../CreateSLO.types'
import { SLIMetricEnum, SLITypeEnum } from './SLI.constants'

export function updateMonitoredServiceForUserJourney(
  formik: FormikProps<SLOForm>,
  monitoredServiceRef?: SelectOption
): void {
  const { values } = formik || {}
  formik.setValues({
    ...values,
    monitoredServiceRef: monitoredServiceRef?.value as string
  })
}

export function getMonitoredServicesOptions(
  monitoredServicesData: ResponseListMonitoredServiceWithHealthSources | null
): SelectOption[] {
  return (monitoredServicesData?.data?.map(monitoredService => ({
    label: monitoredService?.name,
    value: monitoredService?.identifier
  })) || []) as SelectOption[]
}

export function getHealthSourcesOptions(
  monitoredServicesData: ResponseListMonitoredServiceWithHealthSources | null,
  monitoredServiceRef?: string
): SelectOption[] {
  let healthSourceOptions: SelectOption[] = []
  if (monitoredServiceRef && !isEmpty(monitoredServicesData?.data)) {
    const healthSourcesForMonitoredService = monitoredServicesData?.data?.find(
      monitoredService => monitoredService?.identifier === monitoredServiceRef
    )
    healthSourceOptions = healthSourcesForMonitoredService?.healthSources?.map(healthSource => ({
      label: healthSource?.name,
      value: healthSource?.identifier
    })) as SelectOption[]
  }
  return healthSourceOptions
}

export const getSliTypeOptions = (getString: UseStringsReturn['getString']): IOptionProps[] => {
  return [
    { label: getString('cv.slos.slis.type.availability'), value: SLITypeEnum.AVAILABILITY },
    { label: getString('cv.slos.slis.type.latency'), value: SLITypeEnum.LATENCY }
  ]
}

export const getSliMetricOptions = (getString: UseStringsReturn['getString']): IOptionProps[] => {
  return [
    { label: getString('cv.slos.slis.metricOptions.thresholdBased'), value: SLIMetricEnum.THRESHOLD },
    { label: getString('cv.slos.slis.metricOptions.ratioBased'), value: SLIMetricEnum.RATIO }
  ]
}
