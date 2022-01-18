/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { MultiSelectOption, SelectOption } from '@wings-software/uicore'

export function generateMonitoredServiceName(serviceIdentifier?: string, envIdentifier?: string): string {
  console.log('EEEEEEE', serviceIdentifier, envIdentifier)
  let name = ''
  if (serviceIdentifier?.length) {
    name += serviceIdentifier
  }
  if (envIdentifier?.length) {
    name += name?.length ? `_${envIdentifier}` : envIdentifier
  }

  console.log('FFFFFFFFFFFFFFF', serviceIdentifier, envIdentifier)
  return name
}

export function updatedMonitoredServiceNameForEnv(
  formik: FormikProps<any>,
  environment?: SelectOption | MultiSelectOption[],
  monitoredServiceType?: string
): void {
  const { values } = formik || {}
  const monitoredServiceName = generateMonitoredServiceName(
    values.serviceRef,
    monitoredServiceType === 'Infrastructure' ? undefined : ((environment as SelectOption)?.value as string)
  )
  formik.setValues({
    ...values,
    environmentRef: Array.isArray(environment) ? environment.map(env => env.value) : environment?.value,
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
