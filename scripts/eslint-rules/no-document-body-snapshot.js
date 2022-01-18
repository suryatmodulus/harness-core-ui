/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const { get } = require('lodash')

module.exports = {
  meta: {
    docs: {
      description: `Give warning for statements 'expect(document.body).toMatchSnapshot()'`
    }
  },

  create: function (context) {
    return {
      CallExpression(node) {
        if (
          get(node, 'callee.object.callee.name') === 'expect' &&
          get(node, 'callee.object.arguments[0].object.name') === 'document' &&
          get(node, 'callee.object.arguments[0].property.name') === 'body' &&
          get(node, 'callee.property.name') === 'toMatchSnapshot'
        ) {
          return context.report({
            node,
            message: 'document.body match snapshot not allowed'
          })
        }
        return null
      }
    }
  }
}
