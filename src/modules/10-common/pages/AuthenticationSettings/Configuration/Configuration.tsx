import React from 'react'
import { useParams } from 'react-router-dom'
import { Heading, Layout, Color } from '@wings-software/uicore'
import { useGetAuthenticationSettings } from 'services/cd-ng'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import HeaderContent from '@common/pages/AuthenticationSettings/HeaderContent/HeaderContent'
import AccountAndOAuth from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/AccountAndOAuth'
import SAMLProvider from '@common/pages/AuthenticationSettings/Configuration/SAMLProvider/SAMLProvider'
import RestrictEmailDomains from '@common/pages/AuthenticationSettings/Configuration/RestrictEmailDomains/RestrictEmailDomains'

const Configuration: React.FC = () => {
  const params = useParams<AccountPathProps>()
  const { accountId } = params
  const { getString } = useStrings()

  const {
    data,
    loading: fetchingAuthSettings,
    error: errorWhileFetchingAuthSettings,
    refetch: refetchAuthSettings
  } = useGetAuthenticationSettings({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const title = (
    <Layout.Vertical>
      <Breadcrumbs
        links={[
          {
            url: routes.toAccountConfiguration(params),
            label: getString('settingsLabel')
          },
          {
            url: '#',
            label: ''
          }
        ]}
      />
      <Heading font={{ size: 'medium' }} color={Color.BLACK}>
        {getString('authentication')}: {getString('configuration')}
      </Heading>
    </Layout.Vertical>
  )

  return (
    <React.Fragment>
      <Page.Header size="medium" title={title} content={<HeaderContent />} />
      <Page.Body
        loading={fetchingAuthSettings}
        error={
          errorWhileFetchingAuthSettings?.message || data?.resource
            ? undefined
            : getString('common.authSettings.somethingWentWrong')
        }
      >
        {data?.resource && (
          <React.Fragment>
            <AccountAndOAuth authSettings={data.resource} refetchAuthSettings={refetchAuthSettings} />
            <SAMLProvider authSettings={data.resource} refetchAuthSettings={refetchAuthSettings} />
            <RestrictEmailDomains
              whitelistedDomains={data.resource.whitelistedDomains || []}
              refetchAuthSettings={refetchAuthSettings}
            />
          </React.Fragment>
        )}
      </Page.Body>
    </React.Fragment>
  )
}

export default Configuration
