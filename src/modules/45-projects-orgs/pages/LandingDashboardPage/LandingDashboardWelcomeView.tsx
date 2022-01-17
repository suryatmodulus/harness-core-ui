/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Color, Heading, Layout, PageBody } from '@wings-software/uicore'
import cx from 'classnames'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { EmailVerificationBanner } from '@common/components/Banners/EmailVerificationBanner'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import welcomeVideo from './images/welcome-anim.mp4'
import css from './LandingDashboardPage.module.scss'

export enum View {
  Dashboard,
  Welcome
}

interface WelcomeViewProps {
  setView: (val: View) => void
}

const LandingDashboardWelcomeView: React.FC<WelcomeViewProps> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const { NG_DASHBOARD_LANDING_PAGE } = useFeatureFlags()
  const history = useHistory()
  const { currentUserInfo } = useAppStore()
  const { getString } = useStrings()
  const className = currentUserInfo.emailVerified === undefined || currentUserInfo.emailVerified ? '' : 'hasBanner'
  const name = currentUserInfo.name || currentUserInfo.email

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onSuccess: () => {
      history.push(routes.toProjects({ accountId }))
    },
    onWizardComplete: () => {
      closeProjectModal()
      history.push(routes.toProjects({ accountId }))
    }
  })

  return (
    <>
      <EmailVerificationBanner />
      <PageBody className={cx(css.getStartedMainContainer, className)}>
        <Layout.Vertical spacing="xxxlarge" flex>
          {NG_DASHBOARD_LANDING_PAGE ? (
            <Button
              icon="arrow-left"
              text={getString('common.goBack')}
              variation={ButtonVariation.LINK}
              onClick={() => {
                props.setView(View.Dashboard)
              }}
            />
          ) : null}
          <Layout.Vertical spacing="medium" flex>
            <video src={welcomeVideo} autoPlay={true} loop={true} muted={true} />
            <Heading level={1} font={{ weight: 'bold' }} color={Color.BLACK}>
              {name
                ? getString('projectsOrgs.landingDashboard.welcomeMessage', { name })
                : getString('projectsOrgs.landingDashboard.welcomeMessageWithoutName')}
            </Heading>
            <Heading color={Color.GREY_600} level={2}>
              {getString('projectsOrgs.welcomeSecondLine')}
            </Heading>
          </Layout.Vertical>
          <RbacButton
            featuresProps={{
              featuresRequest: {
                featureNames: [FeatureIdentifier.MULTIPLE_PROJECTS]
              }
            }}
            variation={ButtonVariation.PRIMARY}
            text={getString('projectLabel')}
            icon="plus"
            onClick={() => openProjectModal()}
          />
        </Layout.Vertical>
      </PageBody>
    </>
  )
}

export default LandingDashboardWelcomeView
