import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text } from '@wings-software/uicore'

import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { returnLaunchUrl } from '@common/utils/routeUtils'
import { LaunchButton } from '@common/components/LaunchButton/LaunchButton'

export default function CESideNav(): React.ReactElement {
  const { accountId } = useParams<PipelinePathProps>()
  const { currentUserInfo } = useAppStore()
  const { getString } = useStrings()
  const { identifyUser } = useTelemetry()

  useEffect(() => {
    identifyUser(currentUserInfo.email)
  }, [])
  useTelemetry({ pageName: 'CloudCostPage' })
  return (
    <Layout.Vertical spacing="small">
      <Layout.Vertical
        padding={{ top: 'xlarge', left: 'medium', bottom: 'xlarge', right: 'medium' }}
        border={{ bottom: true, color: 'rgba(#FFF, 0.2)' }}
      >
        <Text font={{ size: 'small' }}>Account</Text>
        <Text font={{ size: 'normal' }} color={'white'} style={{ paddingTop: 10 }}>
          {currentUserInfo?.accounts?.find(ac => ac.uuid === accountId)?.accountName || ''}
        </Text>
      </Layout.Vertical>
      {
        <React.Fragment>
          <SidebarLink label={getString('overview')} to={routes.toCEOverview({ accountId })} />
          <SidebarLink label={getString('ce.perspectives.sideNavText')} to={routes.toCEPerspectives({ accountId })} />
          <SidebarLink
            label={getString('ce.recommendation.sideNavText')}
            to={routes.toCERecommendations({ accountId })}
          />
          <SidebarLink label={getString('ce.co.breadCrumb.rules')} to={routes.toCECORules({ accountId })} />
          <SidebarLink
            label={getString('ce.co.accessPoint.loadbalancers')}
            to={routes.toCECOAccessPoints({ accountId })}
          />
        </React.Fragment>
      }
      <LaunchButton
        launchButtonText={getString('common.ce.visibilityLaunchButton')}
        redirectUrl={returnLaunchUrl(`#/account/${accountId}/continuous-efficiency/overview`)}
      />
    </Layout.Vertical>
  )
}
