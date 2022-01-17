/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const { get } = require('lodash')

module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        properties: {
          module: {
            type: 'object'
          }
        },
        additionalProperties: false
      }
    ],
    docs: {
      description: `Restrict some properties from being mocked in jest`
    }
  },

  create: function (context) {
    return {
      CallExpression(node) {
        const moduleList = context.options[0].module
        if (
          get(node, 'callee.type') === 'MemberExpression' &&
          get(node, 'callee.object.type') === 'Identifier' &&
          get(node, 'callee.object.name') === 'jest' &&
          get(node, 'callee.property.name') === 'mock' &&
          get(node, 'arguments[0].type') === 'Literal' &&
          moduleList.hasOwnProperty(get(node, 'arguments[0].value'))
        ) {
          const errorMessage = moduleList[get(node, 'arguments[0].value')]
          return context.report({
            node,
            message: errorMessage
          })
        }
        return null
      }
    }
  }
}
