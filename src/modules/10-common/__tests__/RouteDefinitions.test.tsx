import routes from '../RouteDefinitions'

const MODULES = ['ci', 'cd', 'ce', 'cf', 'cv']

describe('RouteDefinitions tests', () => {
  test('module name is not hardcoded', () => {
    Object.values(routes).forEach(fn => {
      const path = fn({})

      MODULES.forEach(m => {
        if (path.includes(`/${m}`)) {
          fail(`${path} should not include "/${m}"`)
        }
      })
    })
  })
})
