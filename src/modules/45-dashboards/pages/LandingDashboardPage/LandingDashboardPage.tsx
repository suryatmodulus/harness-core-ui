import React from 'react'
import { Layout } from '@wings-software/uicore'

import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import LandingDashboardFactory from '@dashboards/factories/LandingDashboardFactory'
import { ModuleName } from 'framework/types/ModuleName'
import LandingDashboardWidgetWrapper from '@dashboards/components/LandingDashboardWidgetWrapper/LandingDashboardWidgetWrapper'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { LandingDashboardContextProvider } from './LandingDashboardContext'

const modules: Array<ModuleName> = [ModuleName.COMMON, ModuleName.CD]

const LandingDashboardPage: React.FC = () => {
  const { currentUserInfo } = useAppStore()
  const { getString } = useStrings()

  return (
    <LandingDashboardContextProvider>
      <PageHeader
        title={getString('dashboards.landingDashboard.welcomeMessage', {
          name: currentUserInfo.name || currentUserInfo.email
        })}
      />
      <PageBody>
        <Layout.Vertical spacing="large" padding="xlarge">
          {modules.map(moduleName => {
            const moduleHandler = LandingDashboardFactory.getModuleDashboardHandler(moduleName)
            return moduleHandler ? (
              <LandingDashboardWidgetWrapper icon={moduleHandler?.icon} title={moduleHandler?.label} key={moduleName}>
                {moduleHandler.moduleDashboardRenderer?.()}
              </LandingDashboardWidgetWrapper>
            ) : null
          })}
        </Layout.Vertical>
      </PageBody>
    </LandingDashboardContextProvider>
  )
}

export default LandingDashboardPage
