import { Connectors } from '@connectors/constants'
import { ValueType } from '@secrets/components/TextReference/TextReference'

const prepareOptionsFromProps = (formData: any, names: string[]) => {
  const data = {} as any
  names.forEach((name: string) => {
    const proptypes: any = []
    Object.keys(formData)
      .filter(reqHeaders => reqHeaders.includes(`${name}_key_`))
      .forEach((propType: string) => {
        const propIndex = propType[propType.length - 1]
        if (
          formData[`${name}_value_${propIndex}_fieldType`] &&
          formData[`${name}_value_${propIndex}_fieldType`] === ValueType.ENCRYPTED
        ) {
          proptypes.push({
            key: formData[`${name}_key_${propIndex}`],
            isValueEncrypted: true,
            encryptedValueRef: formData[`${name}_value_${propIndex}_secretField`].referenceString
          })
        } else {
          proptypes.push({
            key: formData[`${name}_key_${propIndex}`],
            isValueEncrypted: false,
            value: formData[`${name}_value_${propIndex}_textField`]
          })
        }
      })
    if (name === 'parameters') {
      data['params'] = proptypes
    } else {
      data[name] = proptypes
    }
  })
  console.log('propsssssData', data)
  return data
}
export const builstCustomHealthPayload = (formData: any) => {
  const { name, identifier, projectIdentifier, orgIdentifier, accountId } = formData
  const resp = {
    name,
    identifier,
    projectIdentifier,
    orgIdentifier,
    accountId,
    type: Connectors.CUSTOM,
    spec: {
      ...prepareOptionsFromProps(formData, ['headers', 'parameters']),
      delegateSelectors: formData.delegateSelectors,
      baseURL: formData.url,
      validationPath: formData.validationpath,
      validationBody: formData.validationBody,
      method: formData.requestMethod,
      accountId
    }
  }
  console.log('Prrrrrrrrrrrrrrr', resp)
  return { connector: resp }
}
