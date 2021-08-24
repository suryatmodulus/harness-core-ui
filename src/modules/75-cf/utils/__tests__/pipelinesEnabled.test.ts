import { isFFPipelinesEnabled } from '@cf/utils/pipelinesEnabled'

describe('isFFPipelinesEnabled', () => {
  beforeEach(() => localStorage.clear())

  test('it should return true when FF_PIPELINES set to true in localStorage', async () => {
    localStorage.setItem('FF_PIPELINES', 'true')
    expect(isFFPipelinesEnabled()).toBeTruthy()
  })

  test('it should return true when FF_PIPELINES set to a random string in localStorage', async () => {
    localStorage.setItem('FF_PIPELINES', 'dsfgkjhdsarfgjklhasdfg')
    expect(isFFPipelinesEnabled()).toBeTruthy()
  })

  test('it should return false when FF_PIPELINES set to false in localStorage', async () => {
    localStorage.setItem('FF_PIPELINES', 'false')
    expect(isFFPipelinesEnabled()).toBeFalsy()
  })

  test('it should return false when FF_PIPELINES is not set in localStorage', async () => {
    localStorage.removeItem('FF_PIPELINES')
    expect(isFFPipelinesEnabled()).toBeFalsy()
  })
})
