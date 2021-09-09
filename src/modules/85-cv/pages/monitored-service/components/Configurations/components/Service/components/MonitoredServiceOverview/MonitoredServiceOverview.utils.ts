import type { FormikProps } from 'formik'
import type { SelectOption } from '@wings-software/uicore'

export function generateMonitoredServiceName(serviceIdentifier?: string, envIdentifier?: string): string {
  let name = ''
  if (serviceIdentifier?.length) {
    name += serviceIdentifier
  }
  if (envIdentifier?.length) {
    name += name?.length ? `_${envIdentifier}` : envIdentifier
  }

  return name
}

export function updatedMonitoredServiceNameForEnv(formik: FormikProps<any>, environment?: SelectOption): void {
  const { values } = formik || {}
  const monitoredServiceName = generateMonitoredServiceName(values.serviceRef, environment?.value as string)
  formik.setValues({
    ...values,
    environmentRef: environment?.value,
    name: monitoredServiceName,
    identifier: monitoredServiceName
  })
}

export function updateMonitoredServiceNameForService(formik: FormikProps<any>, service?: SelectOption): void {
  const { values } = formik || {}
  const monitoredServiceName = generateMonitoredServiceName(service?.value as string, values.environmentRef)
  formik.setValues({
    ...values,
    serviceRef: service?.value,
    name: monitoredServiceName,
    identifier: monitoredServiceName
  })
}
