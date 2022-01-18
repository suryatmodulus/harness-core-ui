/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

export const NoApprovalInstance = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical height="100%">
      <Text intent="warning" padding="huge" font={{ align: 'center' }}>
        {getString('pipeline.noApprovalInstanceCreated')}
      </Text>
    </Layout.Vertical>
  )
}
