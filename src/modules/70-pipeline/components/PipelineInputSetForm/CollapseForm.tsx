/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Icon, Text } from '@wings-software/uicore'
import type { TextProps } from '@wings-software/uicore/dist/components/Text/Text'

export const CollapseForm: React.FC<{
  header: string
  children: React.ReactNode
  headerProps?: TextProps
  headerColor?: string
  open?: boolean
}> = ({
  header,
  children,
  headerProps = { font: { size: 'medium' } },
  headerColor = 'var(--pipeline-form-blue)',
  open = true
}): JSX.Element => {
  const [isOpen, setOpen] = React.useState(open)
  return (
    <div style={{ width: '100%' }}>
      <Layout.Horizontal
        flex={{ distribution: 'space-between' }}
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen(prev => !prev)}
      >
        <Text {...headerProps} style={{ color: headerColor }}>
          {header}
        </Text>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} style={{ color: 'var(--pipeline-form-blue)' }} />
      </Layout.Horizontal>
      {isOpen && <Layout.Vertical padding={{ top: 'medium', bottom: 'medium' }}> {children}</Layout.Vertical>}
    </div>
  )
}
