import React from 'react'
import { Color, Icon, Layout, Text } from '@wings-software/uicore'
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
      <Layout.Horizontal spacing="xsmall">
        <Text>{getString('common.suggestionsLabel')}</Text>
        <Text>{renderRetryLinks(getString('retry'), props.callback)}</Text>
        <Text>{getString('or')}</Text>
        <Text>{renderRetryLinks(getString('common.refreshPage'))}</Text>
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
        {getString('projectsOrgs.apiError')}
      </Text>
      {getSuggestionText()}
    </Layout.Vertical>
  )
}

export default DashboardAPIErrorWidget
