import { HTTPRequestMethod } from '../components/HTTPRequestMethod/HTTPRequestMethod.types'
import { CustomHealthValidationPathFieldNames } from '../CustomHealthValidationPath.constants'
import { transformDataToStepData } from '../CustomHealthValidationPath.utils'

describe('Uniit tests for CustomHealthValidationUtils', () => {
  test('Ensure transformDataToStepData works for no api data', () => {
    expect(transformDataToStepData({})).toEqual({
      validationPath: '',
      requestMethod: HTTPRequestMethod.GET
    })
  })
  test('Ensure transformDataToStepData works when api data is available', () => {
    expect(
      transformDataToStepData({
        spec: {
          [CustomHealthValidationPathFieldNames.VALIDATION_PATH]: '/login',
          method: HTTPRequestMethod.GET
        }
      })
    ).toEqual({
      [CustomHealthValidationPathFieldNames.VALIDATION_PATH]: '/login',
      [CustomHealthValidationPathFieldNames.REQUEST_BODY]: undefined,
      [CustomHealthValidationPathFieldNames.REQUEST_METHOD]: HTTPRequestMethod.GET
    })

    expect(
      transformDataToStepData({
        spec: {
          [CustomHealthValidationPathFieldNames.VALIDATION_PATH]: '/login',
          method: HTTPRequestMethod.POST,
          validationBody: "{'solo': 'dolo'}"
        }
      })
    ).toEqual({
      [CustomHealthValidationPathFieldNames.VALIDATION_PATH]: '/login',
      [CustomHealthValidationPathFieldNames.REQUEST_METHOD]: HTTPRequestMethod.POST,
      [CustomHealthValidationPathFieldNames.REQUEST_BODY]: "{'solo': 'dolo'}"
    })
  })

  test('Ensure cached data is taken over api data', () => {
    expect(
      transformDataToStepData({
        [CustomHealthValidationPathFieldNames.VALIDATION_PATH]: '/tele',
        [CustomHealthValidationPathFieldNames.REQUEST_BODY]: '{solo: dolo}',
        [CustomHealthValidationPathFieldNames.REQUEST_METHOD]: HTTPRequestMethod.POST,
        spec: {
          [CustomHealthValidationPathFieldNames.VALIDATION_PATH]: '/login',
          method: HTTPRequestMethod.GET
        }
      })
    ).toEqual({
      [CustomHealthValidationPathFieldNames.VALIDATION_PATH]: '/tele',
      [CustomHealthValidationPathFieldNames.REQUEST_BODY]: '{solo: dolo}',
      [CustomHealthValidationPathFieldNames.REQUEST_METHOD]: HTTPRequestMethod.POST
    })
  })
})
