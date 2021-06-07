import React from 'react'
import { Color, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import { Card } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import css from './OrgNavCardRenderer.module.scss'

interface OrgNavCardProps {
  icon: IconName
  title: string
  description: string
  route: string
}

const OrgNavCardRenderer: React.FC = () => {
  const { orgIdentifier, accountId } = useParams<OrgPathProps>()
  const { NG_RBAC_ENABLED } = useFeatureFlags()
  const history = useHistory()
  const { getString } = useStrings()

  const getOptions = (): OrgNavCardProps[] => {
    //TODO: ENABLE ONCE READY
    const options: OrgNavCardProps[] = [
      // {
      //   icon: 'resources-icon',
      //   title: getString('governance'),
      //   description: getString('orgDetails.governanceDescription'),
      //   route: routes.toGovernance({ orgIdentifier, accountId })
      // },
      // {
      //   icon: 'resources-icon',
      //   title: getString('resources'),
      //   description: getString('orgDetails.resourcesDescription'),
      //   route: routes.toResources({ orgIdentifier, accountId })
      // }
      // {
      //   icon: 'resources-icon',
      //   title: getString('gitSync'),
      //   description: getString('orgDetails.gitSyncDescription'),
      //   route: routes.toOrgGitSync({ orgIdentifier, accountId })
      // }
    ]

    NG_RBAC_ENABLED &&
      options.push({
        icon: 'resources-icon',
        title: getString('accessControl'),
        description: getString('orgDetails.accessControlDescription'),
        route: routes.toAccessControl({ orgIdentifier, accountId })
      })

    return options
  }

  return (
    <Layout.Horizontal spacing="medium" padding="huge">
      {getOptions().map(option => (
        <Card
          key={option.title}
          className={css.card}
          onClick={() => {
            history.push(option.route)
          }}
        >
          <Layout.Vertical>
            <Layout.Horizontal spacing="medium" className={css.title}>
              <Icon size={20} name={option.icon}></Icon>
              <Text font={{ weight: 'bold' }} color={Color.BLACK}>
                {option.title}
              </Text>
            </Layout.Horizontal>
            <Text font="small">{option.description}</Text>
          </Layout.Vertical>
        </Card>
      ))}
    </Layout.Horizontal>
  )
}

export default OrgNavCardRenderer
