import React from 'react'

import { Color, Container, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useStrings } from 'framework/strings'

interface LandingDashboardWidgetWrapperProps {
  title?: keyof StringsMap
  icon?: IconName
}

const LandingDashboardWidgetWrapper: React.FC<LandingDashboardWidgetWrapperProps> = props => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="large">
      {props.title ? (
        <Container>
          {props.icon ? <Icon name={props.icon} /> : null}
          <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
            {getString(props.title)}
          </Text>
        </Container>
      ) : null}
      {props.children}
    </Layout.Vertical>
  )
}

export default LandingDashboardWidgetWrapper
