const packageJSON = require('../package.json')
const { pick, omit, mapValues } = require('lodash')

/**
 * These packages must be stricly shared with exact versions
 */
const ExactSharedPackages = ['formik', 'react-dom', 'react']

module.exports = {
  name: 'nextgenui',
  remotes: {
    // use of single quotes within function call is required to make this work
    gitopsui: "gitopsui@[window.getApiBaseUrl('gitops-ui/remoteEntry.js')]"
  },
  shared: Object.assign(
    {},
    mapValues(pick(packageJSON.dependencies, ExactSharedPackages), version => ({
      singleton: true,
      requiredVersion: version
    })),
    mapValues(omit(packageJSON.dependencies, ExactSharedPackages), version => ({
      requiredVersion: version
    }))
  )
}
