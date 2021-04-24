import type { FormikProps } from 'formik'
import type { FilterDTO } from 'services/cd-ng'

export interface FilterInterface {
  name: string
  filterVisibility?: FilterDTO['filterVisibility']
  identifier: string
  filterProperties?: any
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface FilterDataInterface<T, U> {
  formValues: FormikProps<T>['initialValues']
  metadata: U
}
