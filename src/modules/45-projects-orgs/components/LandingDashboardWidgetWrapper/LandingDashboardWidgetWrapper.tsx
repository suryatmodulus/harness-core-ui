import React from 'react'

import { Color, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useStrings } from 'framework/strings'

interface LandingDashboardWidgetWrapperProps {
  title?: keyof StringsMap
  icon?: IconName
  iconProps?: Omit<IconProps, 'name'>
}

const LandingDashboardWidgetWrapper: React.FC<LandingDashboardWidgetWrapperProps> = props => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="large">
      {props.title ? (
        <Layout.Horizontal spacing="small">
          {props.icon ? <Icon flex={{ align: 'center-center' }} {...props.iconProps} name={props.icon} /> : null}
          <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
            {getString(props.title)}
          </Text>
        </Layout.Horizontal>
      ) : null}
      {props.children}
    </Layout.Vertical>
  )
}

export default LandingDashboardWidgetWrapper
