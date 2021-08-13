import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'
import { Card, Color, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import { String } from 'framework/strings'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import css from './ResourceCardList.module.scss'

interface ResourceOption {
  label: JSX.Element
  icon: IconName
  route: string
  colorClass: string
}
interface ResourceCardListProps {
  items?: ResourceOption[]
}

const ResourceCardList: React.FC<ResourceCardListProps> = ({ items }) => {
  const { accountId, orgIdentifier } = useParams<OrgPathProps>()
  const history = useHistory()
  const options: ResourceOption[] = items || [
    {
      label: <String stringID="connectorsLabel" />,
      icon: 'connectors-icon',
      route: routes.toConnectors({ accountId, orgIdentifier }),
      colorClass: css.connectors
    },
    {
      label: <String stringID="delegate.delegates" />,
      icon: 'delegates-icon' as IconName,
      route: routes.toDelegates({ accountId, orgIdentifier }),
      colorClass: css.delegates
    },
    {
      label: <String stringID="common.secrets" />,
      icon: 'secrets-icon',
      route: routes.toSecrets({ accountId, orgIdentifier }),
      colorClass: css.secrets
    }
  ]

  return (
    <Layout.Horizontal spacing="xxlarge">
      {options.map(option => (
        <Card
          key={option.icon}
          className={cx(css.card, option.colorClass)}
          onClick={() => {
            history.push(option.route)
          }}
        >
          <Layout.Vertical flex spacing="small">
            <Icon name={option.icon} size={70} />
            <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
              {option.label}
            </Text>
          </Layout.Vertical>
        </Card>
      ))}
    </Layout.Horizontal>
  )
}

export default ResourceCardList
