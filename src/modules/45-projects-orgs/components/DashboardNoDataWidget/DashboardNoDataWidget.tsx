import React from 'react'
import { Color, FontVariation, Icon, Layout, Text } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { useStrings } from 'framework/strings'

interface DashboardNoDataWidgetProps {
  className?: string
  iconProps?: Omit<IconProps, 'name'>
  label: string
  getStartedLink?: string
}

const DashboardNoDataWidget: React.FC<DashboardNoDataWidgetProps> = props => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical className={props.className} background={Color.YELLOW_50} flex={{ justifyContent: 'center' }}>
      <Icon name="no-deployments" size={120} {...props.iconProps} margin={{ bottom: 'large' }}></Icon>
      <Text>{props.label}</Text>
      <Text>{'Get Started'}</Text>
    </Layout.Vertical>
  )
}

export default DashboardNoDataWidget
