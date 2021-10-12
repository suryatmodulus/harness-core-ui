import React from 'react'
import { Color, FontVariation, Icon, Layout, Text } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { useStrings } from 'framework/strings'

interface LandingDashboardWidgetWrapperProps {
  className?: string
  iconProps?: Omit<IconProps, 'name'>
  callback?: (options?: Record<string, any>) => Promise<void>
}

const renderRetryLinks = (callback?: LandingDashboardWidgetWrapperProps.callback): JSX.Element => {
  return <Text>{`Suggestions: Retry or refresh your page.`}</Text>
}

const DashboardAPIErrorWidget: React.FC<LandingDashboardWidgetWrapperProps> = props => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical className={props.className} background={Color.YELLOW_50} flex={{ justifyContent: 'center' }}>
      <Icon name="data-fetch-error" size={120} {...props.iconProps} margin={{ bottom: 'large' }}></Icon>
      <Text icon="warning-sign" iconProps={{ color: Color.ORANGE_700 }} color={Color.ORANGE_700}>
        {'Unable to fetch data due to a network error.'}
      </Text>
      {renderRetryLinks(props.callback)}
    </Layout.Vertical>
  )
}

export default DashboardAPIErrorWidget
