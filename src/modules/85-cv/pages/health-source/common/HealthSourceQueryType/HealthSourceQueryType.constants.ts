import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'

export const queryTypeValidation = (getString: UseStringsReturn['getString']) => {
  return Yup.string().trim().required(getString('cv.componentValidations.queryType'))
}
