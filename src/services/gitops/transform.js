const { mapValues, camelCase } = require('lodash')

module.exports = inputSchema => {
  const pathEntries = Object.entries(inputSchema.paths).map(([path, operations]) => {
    let newPath = path

    /**
     * some paths in the spec have path variables like `agent.identifier`.
     * These are not valid while using restful-react.
     *
     * So we modify the spec and turn the variable to `agentIdentifier`
     */
    if (path.includes('.')) {
      const newPath = path.replace(/\{(.*?)\}/g, (_, val) => {
        return `{${camelCase(val)}}`
      })

      const newOperations = mapValues(operations, operation => {
        return {
          ...operation,
          parameters: (operation.parameters || []).map(param => {
            // only change path params
            if (param.in === 'path' && param.name.includes('.')) {
              return {
                ...param,
                name: camelCase(param.name)
              }
            }

            return param
          })
        }
      })

      return [newPath, newOperations]
    }

    return [path, operations]
  })

  return {
    ...inputSchema,
    paths: Object.fromEntries(pathEntries)
  }
}
