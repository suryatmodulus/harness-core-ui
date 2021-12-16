import { HTTPRequestMethod } from '@cv/pages/health-source/common/HealthSourceHTTPRequestMethod/HealthSourceHTTPRequestMethod.types'

const getKeyValuePairs = (name: string, formData: any) => {
  console.log(
    'data',
    Object.keys(formData).filter(key => key.includes(`${name}_key_`))
  )
  const resp = Object.keys(formData)
    .filter(key => key.includes(`${name}_key_`))
    .map(item => +item[item.length - 1])

  return resp.length ? resp : [1]
}

export const prepareCustomConnectorInfo = (
  initProps: any,
  accountId: any,
  projectIdentifier: any,
  orgIdentifier: any,
  name: string
) => ({
  requestMethod: HTTPRequestMethod.GET,
  projectIdentifier,
  orgIdentifier,
  headers_value_1_fieldType: 'TEXT',
  parameters_value_1_fieldType: 'TEXT',
  ...initProps,
  accountId,
  [name]: getKeyValuePairs(name, initProps)
})
