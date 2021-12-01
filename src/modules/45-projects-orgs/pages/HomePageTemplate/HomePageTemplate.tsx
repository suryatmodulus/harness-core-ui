import React, { useEffect, useState } from 'react'
import {
  ButtonVariation,
  Color,
  Container,
  FlexExpander,
  Heading,
  Layout,
  Link as ExternalLink,
  Page,
  Text
} from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { ModuleName } from 'framework/types/ModuleName'
import { useQueryParams } from '@common/hooks'
import { useToaster } from '@common/exports'
import { TrialLicenseBanner } from '@common/components/Banners/TrialLicenseBanner'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { Project } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { Editions } from '@common/constants/SubscriptionTypes'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { ResourceCenter } from '@resource-center/components/ResourceCenter/ResourceCenter'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import css from './HomePageTemplate.module.scss'

export interface TrialBannerProps {
  expiryTime?: number
  licenseType?: string
  module: ModuleName
  edition?: Editions
  refetch?: () => void
}

interface CTAProps {
  text?: string
  onClick?: () => void
}

interface HomePageTemplate {
  title: string
  subTitle: string
  bgImageUrl: string
  documentText: string
  projectCreateSuccessHandler: (data?: Project) => void
  documentURL?: string
  trialBannerProps: TrialBannerProps
  ctaProps?: CTAProps
  disableAdditionalCta?: boolean
}

export const HomePageTemplate: React.FC<HomePageTemplate> = ({
  title,
  bgImageUrl,
  subTitle,
  documentText,
  documentURL = 'https://ngdocs.harness.io/',
  projectCreateSuccessHandler,
  trialBannerProps
}) => {
  const { updateAppStore } = useAppStore()

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onSuccess: projectCreateSuccessHandler,
    onWizardComplete: data => {
      closeProjectModal()
      if (data) {
        updateAppStore({ selectedProject: data })
      }
      projectCreateSuccessHandler(data)
    }
  })

  const [hasBanner, setHasBanner] = useState<boolean>(true)
  const { getString } = useStrings()
  const bannerClassName = hasBanner ? css.hasBanner : css.hasNoBanner
  const { showSuccess } = useToaster()
  const { contactSales } = useQueryParams<{ contactSales?: string }>()
  const rcEnabled = useFeatureFlag(FeatureFlag.RESOURCE_CENTER_ENABLED)
  useEffect(
    () => {
      if (contactSales === 'success') {
        showSuccess(getString('common.banners.trial.contactSalesForm.success'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contactSales]
  )

  return (
    <>
      <TrialLicenseBanner {...trialBannerProps} setHasBanner={setHasBanner} />
      <Page.Body className={cx(css.body, bannerClassName)}>
        <Container className={css.container} style={{ background: `transparent url(${bgImageUrl}) no-repeat` }}>
          <Layout.Vertical spacing="medium">
            <Heading font={{ weight: 'bold', size: 'large' }} color={Color.BLACK_100}>
              {title}
            </Heading>
            <Text color={'var(--grey-500)'} className={css.subTitle}>
              {subTitle}
            </Text>
            <ExternalLink
              className={css.link}
              color={'var(--primary-6)'}
              font={{ size: 'normal' }}
              href={documentURL}
              target="_blank"
            >
              {documentText}
            </ExternalLink>
            <Layout.Horizontal spacing="large" flex>
              <RbacButton
                variation={ButtonVariation.PRIMARY}
                featureProps={{
                  featureRequest: {
                    featureName: FeatureIdentifier.MULTIPLE_PROJECTS
                  }
                }}
                large
                onClick={() => openProjectModal()}
              >
                {getString('createProject')}
              </RbacButton>
              <Text font={{ size: 'medium' }} color={Color.BLACK}>
                {getString('orSelectExisting')}
              </Text>
              <FlexExpander />
            </Layout.Horizontal>
          </Layout.Vertical>
        </Container>
      </Page.Body>
      {rcEnabled && <ResourceCenter />}
    </>
  )
}
