/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, Icon, Layout, Text } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { NavLink } from 'react-router-dom'
import { useStrings } from 'framework/strings'

interface DashboardNoDataWidgetProps {
  className?: string
  iconProps?: Omit<IconProps, 'name'>
  label: JSX.Element
  getStartedLink: string
}

const DashboardNoDataWidget: React.FC<DashboardNoDataWidgetProps> = props => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical className={props.className} background={Color.YELLOW_50} flex={{ justifyContent: 'center' }}>
      <Icon name="no-deployments" size={215} {...props.iconProps} />
      {props.label}
      <NavLink to={props.getStartedLink}>
        <Text color={Color.PRIMARY_7}>{getString('getStarted')}</Text>
      </NavLink>
    </Layout.Vertical>
  )
}

export default DashboardNoDataWidget
