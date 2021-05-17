import { cloneDeep } from 'lodash-es'
import { sanitize } from '@common/utils/JSONUtils'
import {
  obj,
  response1,
  response2,
  response3,
  response4,
  response5
} from '@common/utils/__tests__/mocks/JSONUtils.mock'

describe('YamlUtils Test', () => {
  test('should remove null and undefined values irrespective of the options', () => {
    const response = sanitize(cloneDeep(obj), {
      removeEmptyString: false,
      removeEmptyArray: false,
      removeEmptyObject: false
    })
    expect(response).toEqual(response1)
  })

  test('should remove empty strings', () => {
    const response = sanitize(cloneDeep(obj), {
      removeEmptyString: true,
      removeEmptyArray: false,
      removeEmptyObject: false
    })
    expect(response).toEqual(response2)
  })

  test('should remove empty arrays', () => {
    const response = sanitize(cloneDeep(obj), {
      removeEmptyString: false,
      removeEmptyArray: true,
      removeEmptyObject: false
    })
    expect(response).toEqual(response3)
  })

  test('should remove empty objects', () => {
    const response = sanitize(cloneDeep(obj), {
      removeEmptyString: false,
      removeEmptyArray: false,
      removeEmptyObject: true
    })
    expect(response).toEqual(response4)
  })

  test('should remove empty strings, arrays and objects', () => {
    const response = sanitize(cloneDeep(obj), {
      removeEmptyString: true,
      removeEmptyArray: true,
      removeEmptyObject: true
    })
    expect(response).toEqual(response5)
  })
})
