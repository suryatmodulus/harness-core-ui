import type React from 'react'
import { clone } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { MonitoredServiceForm } from '../Service/Service.types'

export const dependencyExits = (dependencyArray: MonitoredServiceForm['dependencies'], id: string): boolean =>
  !!dependencyArray?.map(item => item.monitoredServiceIdentifier).includes(id)

export const onServiceChange = (
  data: React.FormEvent<HTMLInputElement>,
  formik: FormikProps<MonitoredServiceForm>
): void => {
  const id = data?.currentTarget?.id
  const status = data?.currentTarget?.checked
  const dependenciesClone = clone(formik.values.dependencies)

  if (status) {
    dependenciesClone?.push({
      monitoredServiceIdentifier: id
    })

    formik.setFieldValue('dependencies', dependenciesClone)
  } else if (status === false && dependencyExits(dependenciesClone, id)) {
    const removedDependenceis = dependenciesClone?.filter(item => item.monitoredServiceIdentifier !== id)
    formik.setFieldValue('dependencies', removedDependenceis)
  }
}
