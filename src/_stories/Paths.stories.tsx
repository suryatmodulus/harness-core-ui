/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { useParams } from 'react-router-dom'

import { TestWrapper } from '@common/utils/testUtils'

export interface PathParamProps {
  path: string
  pathParams: Record<string, string>
  queryParams: Record<string, unknown>
  enableBrowserView: boolean
}

function PathParams(): React.ReactElement {
  const params = useParams<Record<string, string>>()

  return (
    <div>
      The following are path params:
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  )
}

export default {
  title: 'Example / Using Path Params',
  component: PathParams
} as Meta

export const Basic: Story<PathParamProps> = args => {
  return (
    <TestWrapper {...args}>
      <PathParams />
    </TestWrapper>
  )
}

Basic.args = {
  path: '/account/:accountId/module/:module/home',
  pathParams: { accountId: 'TEST_ACCOUNT_ID', module: 'cd' },
  queryParams: {},
  enableBrowserView: true
}
