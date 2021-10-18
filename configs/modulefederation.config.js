const packageJSON = require('../package.json')
const { pick, omit, mapValues } = require('lodash')

/**
 * These packages must be stricly shared with exact versions
 */
const ExactSharedPackages = ['formik', 'react-dom', 'react']

module.exports = ({ enableGitOpsUI, enableGovernance }) => {
  const remotes = {}

  if (enableGitOpsUI) {
    // use of single quotes within function call is required to make this work
    remotes.gitopsui = "gitopsui@[window.getApiBaseUrl('gitops-ui/remoteEntry.js')]"
  }

  if (enableGovernance) {
    remotes.governance = "opa@[window.getApiBaseUrl('pm/remoteEntry.js')]"
  }

  return {
    name: 'nextgenui',
    remotes,
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
}
