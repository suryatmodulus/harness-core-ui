import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { Module } from '@common/interfaces/RouteInterfaces'

import { AccountLicensesDTO, ModuleLicenseDTO, useGetAccountLicenses } from 'services/cd-ng'

export enum LICENSE_STATE_VALUES {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  EXPIRED = 'EXPIRED',
  NOT_STARTED = 'NOT_STARTED'
}

// Only keep GA modules for now
export interface LicenseStoreContextProps {
  readonly licenseInformation: AccountLicensesDTO['moduleLicenses'] | Record<string, undefined>
  readonly CI_LICENSE_STATE: LICENSE_STATE_VALUES
  readonly FF_LICENSE_STATE: LICENSE_STATE_VALUES

  updateLicenseStore(data: Partial<Pick<LicenseStoreContextProps, 'licenseInformation'>>): void
}

export const LicenseStoreContext = React.createContext<LicenseStoreContextProps>({
  licenseInformation: {},
  CI_LICENSE_STATE: LICENSE_STATE_VALUES.NOT_STARTED,
  FF_LICENSE_STATE: LICENSE_STATE_VALUES.NOT_STARTED,
  updateLicenseStore: () => void 0
})

export function useLicenseStore(): LicenseStoreContextProps {
  return React.useContext(LicenseStoreContext)
}

// 1000 milliseconds * 60 seconds * 60 minutes * 2 hours
const POLL_INTERVAL = 1000 * 60 * 60 * 2

export function LicenseStoreProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { currentUserInfo } = useAppStore()
  const { accountId } = useParams<{
    accountId: string
  }>()

  const { accounts, defaultAccountId } = currentUserInfo

  // Automatically set the license state to active for users that have not been created via NG
  // This will prevent existing users from experiencing issues accessing the product
  // When license information is migrated we can remove this 'createdFromNG' check
  const createdFromNG = accounts?.find(account => account.uuid === defaultAccountId)?.createdFromNG

  const [state, setState] = useState<Omit<LicenseStoreContextProps, 'updateLicenseStore' | 'strings'>>({
    licenseInformation: {},
    CI_LICENSE_STATE: createdFromNG ? LICENSE_STATE_VALUES.NOT_STARTED : LICENSE_STATE_VALUES.ACTIVE,
    FF_LICENSE_STATE: createdFromNG ? LICENSE_STATE_VALUES.NOT_STARTED : LICENSE_STATE_VALUES.ACTIVE
  })
  const [isFirstRender, setIsFirstRender] = useState(true)

  const { data, refetch, loading } = useGetAccountLicenses({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  function getLicenseStatusMapping(status: ModuleLicenseDTO['status']): LICENSE_STATE_VALUES {
    if (!status) {
      return LICENSE_STATE_VALUES.NOT_STARTED
    }

    switch (status) {
      case 'ACTIVE':
        return LICENSE_STATE_VALUES.ACTIVE
      case 'EXPIRED':
        return LICENSE_STATE_VALUES.EXPIRED
      case 'DELETED':
      default:
        return LICENSE_STATE_VALUES.NOT_STARTED
    }
  }

  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  useEffect(() => {
    const licenses = data?.data?.moduleLicenses

    // Only update the store if the user has been crated via NG
    if (licenses && createdFromNG) {
      const CIModuleLicenseData = licenses['CI']
      const FFModuleLicenseData = licenses['CF']

      const updatedCILicenseState: LICENSE_STATE_VALUES = getLicenseStatusMapping(CIModuleLicenseData?.status)
      const updatedFFLicenseState: LICENSE_STATE_VALUES = getLicenseStatusMapping(FFModuleLicenseData?.status)

      setState(prevState => ({
        ...prevState,
        licenseInformation: licenses,
        CI_LICENSE_STATE: updatedCILicenseState,
        FF_LICENSE_STATE: updatedFFLicenseState
      }))
    }
  }, [data?.data?.moduleLicenses, createdFromNG])

  useEffect(() => {
    const INTERVAL_ID = setInterval(() => {
      refetch()
    }, POLL_INTERVAL)
    return () => {
      clearInterval(INTERVAL_ID)
    }
    // refetch is a new instance on each render which will cause
    // useEffect to go into an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateLicenseStore(
    updateData: Partial<Pick<LicenseStoreContextProps, 'licenseInformation' | 'CI_LICENSE_STATE' | 'FF_LICENSE_STATE'>>
  ): void {
    setState(prevState => ({
      ...prevState,
      licenseInformation: updateData.licenseInformation || prevState.licenseInformation,
      CI_LICENSE_STATE: updateData.CI_LICENSE_STATE || prevState.CI_LICENSE_STATE,
      FF_LICENSE_STATE: updateData.FF_LICENSE_STATE || prevState.FF_LICENSE_STATE
    }))
  }

  return (
    <LicenseStoreContext.Provider
      value={{
        ...state,
        updateLicenseStore
      }}
    >
      {loading && isFirstRender ? <PageSpinner /> : props.children}
    </LicenseStoreContext.Provider>
  )
}

export function handleUpdateLicenseStore(
  newLicenseInformation: Record<string, ModuleLicenseDTO> | Record<string, undefined>,
  updateLicenseStore: (data: Partial<Pick<LicenseStoreContextProps, 'licenseInformation'>>) => void,
  module: Module,
  data?: ModuleLicenseDTO
): void {
  if (!data) {
    return
  }
  let licenseStoreData:
    | Partial<Pick<LicenseStoreContextProps, 'licenseInformation' | 'CI_LICENSE_STATE' | 'FF_LICENSE_STATE'>>
    | undefined

  if (module === 'ci') {
    newLicenseInformation['CI'] = data

    licenseStoreData = {
      licenseInformation: newLicenseInformation,
      CI_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE
    }
  } else if (module === 'cf') {
    newLicenseInformation['CF'] = data

    licenseStoreData = {
      licenseInformation: newLicenseInformation,
      FF_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE
    }
  }

  if (licenseStoreData) {
    updateLicenseStore(licenseStoreData)
  }
}
