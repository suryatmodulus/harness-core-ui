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
