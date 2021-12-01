const packageJSON = require('../package.json')
const { pick, omit, mapValues } = require('lodash')

/**
 * These packages must be stricly shared with exact versions
 */
const ExactSharedPackages = [
  'formik',
  'react-dom',
  'react',
  'react-router-dom',
  '@wings-software/uicore',
  '@blueprintjs/core',
  '@blueprintjs/select',
  '@blueprintjs/datetime',
  'lodash-es',
  'restful-react'
]

module.exports = ({ enableGitOpsUI, enableGovernance }) => {
  const remotes = {}

  if (enableGitOpsUI) {
    // use of single quotes within function call is required to make this work
    remotes.gitopsui = "gitopsui@[window.getApiBaseUrl('gitops/remoteEntry.js')]"
  }

  if (enableGovernance) {
    remotes.governance = "governance@[window.getApiBaseUrl('pm/remoteEntry.js')]"
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
