import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { pick } from 'lodash-es'
import { PageError, PageSpinner } from '@wings-software/uicore'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

const CEHomePage: React.FC = () => {
  const { currentUserInfo } = useAppStore()
  const { NG_LICENSES_ENABLED } = useFeatureFlags()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  const { accountId } = useParams<AccountPathProps>()

  const { experience } = useQueryParams<{ experience?: string }>()
  const moduleType = ModuleName.CE
  const module = moduleType.toLowerCase() as Module

  const { accounts } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === accountId)?.createdFromNG

  const { data, error, refetch, loading } = useGetLicensesAndSummary({
    queryParams: { moduleType },
    accountIdentifier: accountId
  })

  const expiryTime = data?.data?.maxExpiryTime
  const updatedLicenseInfo = data?.data && {
    ...licenseInformation?.[moduleType],
    ...pick(data?.data, ['licenseType', 'edition']),
    expiryTime
  }

  useEffect(() => {
    handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, updatedLicenseInfo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experience])

  const history = useHistory()

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    const message = (error?.data as Error)?.message || error?.message
    return <PageError message={message} onClick={() => refetch()} />
  }

  const showTrialPages = createdFromNG || NG_LICENSES_ENABLED

  if (showTrialPages && data?.status === 'SUCCESS' && !data.data) {
    history.push(
      routes.toModuleTrialHome({
        accountId,
        module
      })
    )
  } else {
    history.push(routes.toCEOverview({ accountId }))
  }

  return <></>
}

export default CEHomePage
