import type { InputSetDTO } from '@pipeline/components/InputSetForm/InputSetForm'
export const changeEmptyValuesToRunTimeInput = (inputset: any): InputSetDTO => {
  Object.keys(inputset).map(key => {
    if (typeof inputset[key] === 'object') {
      changeEmptyValuesToRunTimeInput(inputset[key])
    } else if (inputset[key] === '') {
      inputset[key] = '<+input>'
    }
  })
  return inputset
}
