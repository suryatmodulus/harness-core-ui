import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useParams } from 'react-router-dom'

import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { Module } from '@common/interfaces/RouteInterfaces'

import { AccountLicenseDTO, ModuleLicenseDTO, useGetAccountLicenses } from 'services/cd-ng'
import { ModuleName } from 'framework/types/ModuleName'

export enum LICENSE_STATE_VALUES {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  EXPIRED = 'EXPIRED',
  NOT_STARTED = 'NOT_STARTED'
}

// Only keep GA modules for now
export interface LicenseStoreContextProps {
  readonly licenseInformation: AccountLicenseDTO['moduleLicenses'] | Record<string, undefined>
  readonly CI_LICENSE_STATE: LICENSE_STATE_VALUES
  readonly FF_LICENSE_STATE: LICENSE_STATE_VALUES

  updateLicenseStore(data: Partial<Pick<LicenseStoreContextProps, 'licenseInformation'>>): void
}

export interface LicenseRedirectProps {
  licenseStateName: keyof Omit<LicenseStoreContextProps, 'licenseInformation' | 'updateLicenseStore'>
  startTrialRedirect: () => React.ReactElement
  expiredTrialRedirect: () => React.ReactElement
}

type licenseStateNames = keyof Omit<LicenseStoreContextProps, 'licenseInformation' | 'updateLicenseStore'>

export const LICENSE_STATE_NAMES: { [T in licenseStateNames]: T } = {
  CI_LICENSE_STATE: 'CI_LICENSE_STATE',
  FF_LICENSE_STATE: 'FF_LICENSE_STATE'
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

  const { accounts } = currentUserInfo

  const createdFromNG = accounts?.find(account => account.uuid === accountId)?.createdFromNG

  // Automatically set the license state to active for users that have not been created via NG
  // This will prevent existing users from experiencing issues accessing the product
  // When license information is migrated we can remove this 'createdFromNG' check
  const shouldLicensesBeDisabled = __DEV__ || !createdFromNG

  const [state, setState] = useState<Omit<LicenseStoreContextProps, 'updateLicenseStore' | 'strings'>>({
    licenseInformation: {},
    CI_LICENSE_STATE: shouldLicensesBeDisabled ? LICENSE_STATE_VALUES.ACTIVE : LICENSE_STATE_VALUES.NOT_STARTED,
    FF_LICENSE_STATE: shouldLicensesBeDisabled ? LICENSE_STATE_VALUES.ACTIVE : LICENSE_STATE_VALUES.NOT_STARTED
  })
  const [isFirstRender, setIsFirstRender] = useState(true)

  const { data, refetch, loading } = useGetAccountLicenses({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  // Use this function when the license remodel goes in
  // function getLicenseStatusMapping(status: ModuleLicenseDTO['status']): LICENSE_STATE_VALUES {
  //   if (!status) {
  //     return LICENSE_STATE_VALUES.NOT_STARTED
  //   }

  //   switch (status) {
  //     case 'ACTIVE':
  //       return LICENSE_STATE_VALUES.ACTIVE
  //     case 'EXPIRED':
  //       return LICENSE_STATE_VALUES.EXPIRED
  //     case 'DELETED':
  //     default:
  //       return LICENSE_STATE_VALUES.NOT_STARTED
  //   }
  // }

  function getLicenseState(expiryTime?: number): LICENSE_STATE_VALUES {
    if (!expiryTime) {
      return LICENSE_STATE_VALUES.NOT_STARTED
    }

    const days = Math.round(moment(expiryTime).diff(moment.now(), 'days', true))
    const isExpired = days < 0

    if (shouldLicensesBeDisabled) {
      return LICENSE_STATE_VALUES.ACTIVE
    }

    return isExpired ? LICENSE_STATE_VALUES.EXPIRED : LICENSE_STATE_VALUES.ACTIVE
  }

  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  useEffect(() => {
    const allLicenses = data?.data?.allModuleLicenses || {}
    const licenses: { [key: string]: ModuleLicenseDTO } = {}
    Object.keys(allLicenses).forEach((key: string) => {
      const moduleLicenses = allLicenses[key]
      if (moduleLicenses.length > 0) {
        licenses[key] = moduleLicenses[moduleLicenses.length - 1]
      }
    })

    const CIModuleLicenseData = licenses['CI']
    const FFModuleLicenseData = licenses['CF']

    const updatedCILicenseState: LICENSE_STATE_VALUES = getLicenseState(CIModuleLicenseData?.expiryTime)
    const updatedFFLicenseState: LICENSE_STATE_VALUES = getLicenseState(FFModuleLicenseData?.expiryTime)

    setState(prevState => ({
      ...prevState,
      licenseInformation: licenses,
      CI_LICENSE_STATE: shouldLicensesBeDisabled ? LICENSE_STATE_VALUES.ACTIVE : updatedCILicenseState,
      FF_LICENSE_STATE: shouldLicensesBeDisabled ? LICENSE_STATE_VALUES.ACTIVE : updatedFFLicenseState
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data?.allModuleLicenses, shouldLicensesBeDisabled])

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
    const CIModuleLicenseData = updateData.licenseInformation?.['CI']
    const FFModuleLicenseData = updateData.licenseInformation?.['CF']

    setState(prevState => ({
      ...prevState,
      licenseInformation: updateData.licenseInformation || prevState.licenseInformation,
      CI_LICENSE_STATE: CIModuleLicenseData?.expiryTime
        ? getLicenseState(CIModuleLicenseData.expiryTime)
        : prevState.CI_LICENSE_STATE,
      FF_LICENSE_STATE: FFModuleLicenseData?.expiryTime
        ? getLicenseState(FFModuleLicenseData.expiryTime)
        : prevState.FF_LICENSE_STATE
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

  if (module.toUpperCase() === ModuleName.CI) {
    newLicenseInformation[ModuleName.CI] = data
    licenseStoreData = {
      licenseInformation: newLicenseInformation
    }
  } else if (module.toUpperCase() === ModuleName.CF) {
    newLicenseInformation[ModuleName.CF] = data
    licenseStoreData = {
      licenseInformation: newLicenseInformation
    }
  }

  if (licenseStoreData) {
    updateLicenseStore(licenseStoreData)
  }
}
