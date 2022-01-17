/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const { get } = require('lodash')
const toolTipValuesMap = {}
module.exports = {
  meta: {
    docs: {
      description: `Give warning for duplicate tooltip id's'`
    }
  },

  create: function (context) {
    return {
      JSXAttribute(node) {
        if (get(node, 'name.name') === 'data-tooltip-id' && get(node, 'value.type') === 'Literal') {
          if (toolTipValuesMap[get(node, 'value.value')]) {
            return context.report({
              node,
              message: 'Duplicate tooltip id'
            })
          } else {
            toolTipValuesMap[get(node, 'value.value')] = true
          }
        }
        return null
      }
    }
  }
}
