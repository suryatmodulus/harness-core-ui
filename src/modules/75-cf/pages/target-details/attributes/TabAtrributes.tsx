/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { Target } from 'services/cf'
import { ItemContainer } from '@cf/components/ItemContainer/ItemContainer'

export const TabAttributes: React.FC<{ target?: Target | undefined | null }> = ({ target }) => {
  const { getString } = useStrings()
  const attributes = {
    [getString('identifier')]: target?.identifier,
    [getString('name')]: target?.name,
    ...target?.attributes
  }

  return (
    <Container padding={{ top: 'xsmall', right: 'xxlarge', left: 'xxlarge', bottom: 'xxlarge' }}>
      <Text
        style={{ color: '#6B6D85', fontSize: '12px', lineHeight: '150%' }}
        padding={{ bottom: 'xxlarge', left: 'small', right: 'small' }}
      >
        <span dangerouslySetInnerHTML={{ __html: getString('cf.targetDetail.learnMore') }} />
      </Text>
      <>
        <Layout.Vertical spacing="small">
          <Text style={{ color: '#4F5162', fontSize: '10px', fontWeight: 'bold' }} padding={{ left: 'medium' }}>
            {getString('cf.targetDetail.attribute')}
          </Text>

          {Object.entries(attributes || {}).map(([key, value]) => (
            <ItemContainer key={key}>
              <Text
                margin={{ bottom: 'xsmall' }}
                style={{ color: '#22222A', fontSize: '12px', fontWeight: 500, lineHeight: '16px' }}
              >
                {key}
              </Text>
              <Text style={{ color: '##22222ACC', lineHeight: '24px' }}>{value}</Text>
            </ItemContainer>
          ))}
        </Layout.Vertical>
      </>
    </Container>
  )
}
