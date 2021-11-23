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
  'restful-react'
]

module.exports = ({ enableGitOpsUI }) => {
  const remotes = {}

  if (enableGitOpsUI) {
    // use of single quotes within function call is required to make this work
    remotes.gitopsui = "gitopsui@[window.getApiBaseUrl('gitops/remoteEntry.js')]"
  }

  remotes.governance = "governance@[window.getApiBaseUrl('pm/remoteEntry.js')]"

  return {
    name: 'nextgenui',
    remotes,
    shared: Object.assign(
      {},
      mapValues(pick(packageJSON.dependencies, ExactSharedPackages), version => ({
        singleton: true,
        requiredVersion: version
      }))
    )
  }
}
