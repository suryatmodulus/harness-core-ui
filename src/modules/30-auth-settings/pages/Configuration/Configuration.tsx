import React from 'react'
import { useParams } from 'react-router-dom'
import { useGetAuthenticationSettings } from 'services/cd-ng'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import AccountAndOAuth from '@auth-settings/pages/Configuration/AccountAndOAuth/AccountAndOAuth'
import SAMLProvider from '@auth-settings/pages/Configuration/SAMLProvider/SAMLProvider'
import RestrictEmailDomains from '@auth-settings/pages/Configuration/RestrictEmailDomains/RestrictEmailDomains'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

export interface PermissionRequest {
  resourceScope: {
    accountIdentifier: string
  }
  resource: {
    resourceType: ResourceType
  }
}

const Configuration: React.FC = () => {
  const params = useParams<AccountPathProps>()
  const { accountId } = params
  const { getString } = useStrings()

  const permissionRequest = {
    resourceScope: {
      accountIdentifier: accountId
    },
    resource: {
      resourceType: ResourceType.AUTHSETTING
    }
  }

  const [canEdit] = usePermission(
    {
      ...permissionRequest,
      permissions: [PermissionIdentifier.EDIT_AUTHSETTING]
    },
    []
  )

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

  return (
    <React.Fragment>
      <Page.Header title={`${getString('authentication')}: ${getString('configuration')}`} />
      <Page.Body
        loading={fetchingAuthSettings}
        error={
          (errorWhileFetchingAuthSettings?.data as Error)?.message ||
          errorWhileFetchingAuthSettings?.message ||
          (data?.resource ? undefined : getString('somethingWentWrong'))
        }
        retryOnError={() => refetchAuthSettings()}
      >
        {data?.resource && (
          <React.Fragment>
            <AccountAndOAuth
              authSettings={data.resource}
              refetchAuthSettings={refetchAuthSettings}
              permissionRequest={permissionRequest}
              canEdit={canEdit}
            />
            <SAMLProvider
              authSettings={data.resource}
              refetchAuthSettings={refetchAuthSettings}
              permissionRequest={permissionRequest}
              canEdit={canEdit}
            />
            <RestrictEmailDomains
              whitelistedDomains={data.resource.whitelistedDomains || []}
              refetchAuthSettings={refetchAuthSettings}
              permissionRequest={permissionRequest}
              canEdit={canEdit}
            />
          </React.Fragment>
        )}
      </Page.Body>
    </React.Fragment>
  )
}

export default Configuration
