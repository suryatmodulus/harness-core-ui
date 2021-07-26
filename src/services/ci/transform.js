const _ = require('lodash')

module.exports = inputSchema => {
  return {
    ...inputSchema,
    components: {
      ...inputSchema.components,
      schemas: _.mapValues(inputSchema.components.schemas, (value, key) => {
        if (key === 'ParallelStageElementConfig' || key === 'ParallelStepElementConfig') {
          return value.properties.sections
        }

        return value
      })
    }
  }
}
