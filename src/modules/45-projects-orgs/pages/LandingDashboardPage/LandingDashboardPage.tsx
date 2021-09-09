import React, { useState } from 'react'
import { Button, ButtonVariation, Color, Heading, Layout } from '@wings-software/uicore'
import cx from 'classnames'
import { useHistory, useParams } from 'react-router'

import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import LandingDashboardFactory from '@common/factories/LandingDashboardFactory'
import { LandingDashboardContextProvider } from '@common/factories/LandingDashboardContext'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import LandingDashboardWidgetWrapper from '@projects-orgs/components/LandingDashboardWidgetWrapper/LandingDashboardWidgetWrapper'
import { EmailVerificationBanner } from '@common/components/Banners/EmailVerificationBanner'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import getStarted from './images/getStarted.svg'
import css from './LandingDashboardPage.module.scss'

const modules: Array<ModuleName> = [ModuleName.COMMON]

enum View {
  Dashboard,
  Welcome
}

const LandingDashboardPage: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { NG_DASHBOARD_LANDING_PAGE } = useFeatureFlags()
  const history = useHistory()
  const { currentUserInfo } = useAppStore()
  const { getString } = useStrings()
  const [view, setView] = useState<View>(NG_DASHBOARD_LANDING_PAGE ? View.Dashboard : View.Welcome)

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onSuccess: () => {
      history.push(routes.toProjects({ accountId }))
    },
    onWizardComplete: () => {
      closeProjectModal()
      history.push(routes.toProjects({ accountId }))
    }
  })

  const className = currentUserInfo.emailVerified === undefined || currentUserInfo.emailVerified ? '' : 'hasBanner'
  const name = currentUserInfo.name || currentUserInfo.email

  switch (view) {
    case View.Dashboard:
      return (
        <LandingDashboardContextProvider>
          <EmailVerificationBanner />
          <PageHeader
            title={getString('projectsOrgs.landingDashboard.dashboardTitle', {
              name
            })}
            toolbar={
              <Button
                onClick={() => {
                  setView(View.Welcome)
                }}
                text={getString('common.welcome')}
                variation={ButtonVariation.LINK}
              />
            }
          />
          <PageBody>
            <Layout.Vertical spacing="large" padding="xlarge">
              {modules.map(moduleName => {
                const moduleHandler = LandingDashboardFactory.getModuleDashboardHandler(moduleName)
                return moduleHandler ? (
                  <LandingDashboardWidgetWrapper
                    icon={moduleHandler?.icon}
                    title={moduleHandler?.label}
                    key={moduleName}
                  >
                    {moduleHandler.moduleDashboardRenderer?.()}
                  </LandingDashboardWidgetWrapper>
                ) : null
              })}
            </Layout.Vertical>
          </PageBody>
        </LandingDashboardContextProvider>
      )

    case View.Welcome:
      return (
        <>
          <EmailVerificationBanner />
          <PageBody className={cx(css.getStartedMainContainer, className)}>
            <Layout.Vertical spacing="xxxlarge" flex>
              {NG_DASHBOARD_LANDING_PAGE ? (
                <Button
                  icon="arrow-left"
                  text="Go Back"
                  variation={ButtonVariation.LINK}
                  onClick={() => {
                    setView(View.Dashboard)
                  }}
                />
              ) : null}
              <Layout.Vertical spacing="medium" flex>
                <img src={getStarted} className={css.image} />
                <Heading level={1} font={{ weight: 'bold' }} color={Color.BLACK}>
                  {name
                    ? getString('projectsOrgs.landingDashboard.welcomeMessage', { name })
                    : getString('projectsOrgs.landingDashboard.welcomeMessageWithoutName')}
                </Heading>
                <Heading color={Color.GREY_600} level={2}>
                  {getString('projectsOrgs.welcomeSecondLine')}
                </Heading>
              </Layout.Vertical>
              <Button
                variation={ButtonVariation.PRIMARY}
                text={getString('projectLabel')}
                icon="plus"
                onClick={() => openProjectModal()}
              />
            </Layout.Vertical>
          </PageBody>
        </>
      )

    default:
      return null
  }
}

export default LandingDashboardPage
