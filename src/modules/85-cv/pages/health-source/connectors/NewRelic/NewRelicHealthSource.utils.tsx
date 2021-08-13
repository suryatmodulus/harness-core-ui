import type { UseStringsReturn } from 'framework/strings'

export const validateNewRelic = (values: any, getString: UseStringsReturn['getString']): { [key: string]: string } => {
  const error: { [key: string]: string } = {}
  const metricValueList = Object.values(values?.metricData).filter(val => val)
  if (!metricValueList.length) {
    error['metricData'] = getString('cv.monitoringSources.appD.validations.selectMetricPack')
  }

  if (
    values?.newRelicApplication &&
    (!values?.newRelicApplication.value || values?.newRelicApplication.value === 'loading')
  ) {
    error['newRelicApplication'] = getString('cv.healthSource.connectors.AppDynamics.validation.application')
  }

  return error
}
