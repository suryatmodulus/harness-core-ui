import React from 'react'
import { Color, FontVariation, Icon, Layout, Text } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { useStrings } from 'framework/strings'

interface DashboardAPIErrorWidgetProps {
  className?: string
  iconProps?: Omit<IconProps, 'name'>
  callback?: (options?: Record<string, any>) => Promise<void>
}

const renderRetryLinks = (label: string, callback?: DashboardAPIErrorWidgetProps['callback']): JSX.Element => {
  return (
    <Text color={Color.PRIMARY_7} onClick={callback ?? (() => location.reload())}>
      {label}
    </Text>
  )
}

const DashboardAPIErrorWidget: React.FC<DashboardAPIErrorWidgetProps> = props => {
  const { getString } = useStrings()

  const getSuggestionText = (): JSX.Element => {
    return (
      <Layout.Horizontal>
        <Text padding="xsmall">{'Suggestions: '}</Text>
        <Text padding="xsmall">{renderRetryLinks('Retry', props.callback)}</Text>
        <Text padding={{ top: 'xsmall' }}>{'or'}</Text>
        <Text padding="xsmall">{renderRetryLinks('refresh your page.')}</Text>
      </Layout.Horizontal>
    )
  }

  return (
    <Layout.Vertical className={props.className} background={Color.YELLOW_50} flex={{ justifyContent: 'center' }}>
      <Icon name="data-fetch-error" size={120} {...props.iconProps} margin={{ bottom: 'large' }}></Icon>
      <Text
        icon="warning-sign"
        iconProps={{ color: Color.ORANGE_700 }}
        color={Color.ORANGE_700}
        font={{ size: 'medium' }}
      >
        {'Unable to fetch data due to a network error.'}
      </Text>
      {getSuggestionText()}
    </Layout.Vertical>
  )
}

export default DashboardAPIErrorWidget
