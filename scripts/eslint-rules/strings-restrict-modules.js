const path = require('path')

const { get, flatten } = require('lodash')
const { getLayers, MODULE_REGEX } = require('../utils/HarnessModulesUtils.cjs')

const layers = getLayers()
const modulesPath = path.resolve(process.cwd(), 'src/modules')

function checkReferences({ node, restrictedModulesRefs, context }) {
  const valueType = get(node, 'value.type')

  switch (valueType) {
    case 'Literal':
      const value = get(node, 'value.value') || ''

      restrictedModulesRefs.forEach(ref => {
        if (value.startsWith(ref)) {
          context.report({
            node,
            message: 'Using a string from restricted module is not allowed'
          })
        }
      })
      break
    case 'JSXExpressionContainer':
      break
    default:
      break
  }
}

module.exports = {
  meta: {
    docs: {
      description: `Restrict usage of string accroding to modules`
    }
  },

  create: function (context) {
    const file = context.getFilename()
    const relativePath = path.relative(modulesPath, file)
    const isFileInsideAModule = !relativePath.startsWith('.')
    const match = relativePath.match(MODULE_REGEX)
    const layerIndex = match ? layers.findIndex(layer => layer.find(mod => mod.dirName === match[0])) : -1
    const restrictedModules = layerIndex > -1 ? layers.slice(layerIndex) : []
    const restrictedModulesRefs = match
      ? flatten(restrictedModules)
          .filter(({ dirName }) => dirName !== match[0])
          .map(({ moduleRef }) => moduleRef)
      : []

    return {
      JSXElement(node) {
        if (!isFileInsideAModule || !match) return null

        if (get(node, 'openingElement.name.name') === 'String') {
          const attrs = get(node, 'openingElement.attributes') || []
          const stringIdAttr = attrs.find(attr => get(attr, 'name.name') === 'stringID')

          if (stringIdAttr) {
            checkReferences({ node: stringIdAttr, restrictedModulesRefs, context })
          }
        }
        return null
      },
      CallExpression(node) {
        if (!isFileInsideAModule || !match) return null

        if (get(node, 'callee.name') === 'getString') {
          const idNode = get(node, 'arguments[0]')

          if (idNode) {
            checkReferences({ node: idNode, restrictedModulesRefs, context })
          }
        }
      }
    }
  }
}
