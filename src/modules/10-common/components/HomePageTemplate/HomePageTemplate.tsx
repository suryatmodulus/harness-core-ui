import React, { CSSProperties } from 'react'
import { Heading, Layout, Text, Link as ExternalLink, FlexExpander, Container, Color } from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ModuleName } from 'framework/types/ModuleName'
import { TrialLicenseBanner } from '@common/components/Banners/TrialLicenseBanner'
import { Page } from '../Page/Page'
import css from './HomePageTemplate.module.scss'

interface TrialBannerProps {
  expiryTime?: number
  licenseType?: string
  module: ModuleName
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
  const { getString } = useStrings()
  return (
    <>
      <TrialLicenseBanner {...trialBannerProps} />
      <Page.Body>
        <Container className={css.body} style={{ '--image-url': `url(${bgImageUrl})` } as CSSProperties}>
          <Layout.Vertical spacing="medium">
            <Heading font={{ weight: 'bold', size: 'large' }} color={'var(--primary-10)'}>
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
