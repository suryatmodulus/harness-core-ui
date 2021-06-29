import React, { useState, useEffect } from 'react'
import { Heading, Layout, Text, Link as ExternalLink, FlexExpander, Container, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { Link, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ModuleName } from 'framework/types/ModuleName'
import { useQueryParams } from '@common/hooks'
import { useToaster } from '@common/exports'
import { TrialLicenseBanner } from '@common/components/Banners/TrialLicenseBanner'
import { Page } from '../Page/Page'
import css from './HomePageTemplate.module.scss'

interface TrialBannerProps {
  expiryTime?: number
  licenseType?: string
  module: ModuleName
  refetch?: () => void
}
interface HomePageTemplate {
  title: string
  subTitle: string
  bgImageUrl: string
  documentText: string
  documentURL?: string
  trialBannerProps: TrialBannerProps
}

export const HomePageTemplate: React.FC<HomePageTemplate> = ({
  title,
  bgImageUrl,
  subTitle,
  documentText,
  documentURL = 'https://ngdocs.harness.io/',
  trialBannerProps
}) => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  const [hasBanner, setHasBanner] = useState<boolean>(true)
  const { getString } = useStrings()
  const bannerClassName = hasBanner ? css.hasBanner : css.hasNoBanner
  const { showSuccess } = useToaster()
  const { contactSales } = useQueryParams<{ contactSales?: string }>()

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
            <Text color={'var(--grey-500)'}>{subTitle}</Text>
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
              <Link to={routes.toProjects({ accountId })} className={css.createBtn}>
                {getString('createProject')}
              </Link>
              <Text font={{ size: 'medium' }} color={Color.BLACK}>
                {getString('orSelectExisting')}
              </Text>
              <FlexExpander />
            </Layout.Horizontal>
          </Layout.Vertical>
        </Container>
      </Page.Body>
    </>
  )
}
