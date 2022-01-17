/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Classes } from '@blueprintjs/core'
import { Layout, Container, Text, Color, FontVariation } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ToolbarProps } from '../MonitoredServicePage.types'

const DetailsToolbar: React.FC<ToolbarProps> = ({ loading, monitoredService, lastModifiedAt }) => {
  const { getString } = useStrings()

  if (loading) {
    return (
      <Layout.Vertical spacing="xsmall">
        <Container height={15} width={220} className={Classes.SKELETON} />
        <Container height={15} width={220} className={Classes.SKELETON} />
        <Container height={15} width={220} className={Classes.SKELETON} />
      </Layout.Vertical>
    )
  }

  return (
    <Layout.Vertical spacing="xsmall">
      <Text color={Color.BLACK} font={{ variation: FontVariation.SMALL_SEMI }}>
        {`${getString('lastUpdated')}: ${moment(lastModifiedAt).format('lll')}`}
      </Text>
      <Text color={Color.BLACK} font={{ variation: FontVariation.SMALL_SEMI }}>
        {`${getString('environment')}: ${monitoredService?.environmentRef}`}
      </Text>
      <Text color={Color.BLACK} font={{ variation: FontVariation.SMALL_SEMI }}>
        {`${getString('typeLabel')}: ${monitoredService?.type}`}
      </Text>
    </Layout.Vertical>
  )
}

export default DetailsToolbar
