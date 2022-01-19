import routes from '../RouteDefinitions'

const MODULES = ['ci', 'cd', 'ce', 'cf', 'cv']

describe('RouteDefinitions tests', () => {
  // eslint-disable-next-line jest/expect-expect
  test('module name is not hardcoded', () => {
    Object.values(routes).forEach(fn => {
      const path = fn({} as any)

      MODULES.forEach(m => {
        if (path.includes(`/${m}`)) {
          fail(`${path} should not include "/${m}"`)
        }
      })
    })
  })
})
