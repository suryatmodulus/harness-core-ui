import React, { createContext, useContext, useState, useEffect } from 'react'
import { isEmpty } from 'lodash-es'
import produce from 'immer'

import { useParams } from 'react-router'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { useLicenseStore, LICENSE_STATE_VALUES } from 'framework/LicenseStore/LicenseStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetEnabledFeatureRestrictionDetailByAccountId,
  useGetFeatureRestrictionDetail,
  useGetAllFeatureRestrictionMetadata,
  RestrictionMetadataDTO,
  FeatureRestrictionDetailsDTO
} from 'services/cd-ng'
import type { RestrictionType } from '@common/constants/SubscriptionTypes'
import { Editions } from '@common/constants/SubscriptionTypes'

import type { FeatureIdentifier } from './FeatureIdentifier'

export interface FeatureDetail {
  featureName: FeatureIdentifier
  enabled: boolean
  moduleType: ModuleType
  limit?: number
  count?: number
  apiFail?: boolean
}

export type ModuleType = FeatureRestrictionDetailsDTO['moduleType']

export interface FeatureRequest {
  featureName: FeatureIdentifier
}

export interface CheckFeatureReturn {
  enabled: boolean
  featureDetail?: FeatureDetail
}

export interface FeatureMetaData {
  moduleType: ModuleType
  restrictionMetadataMap: RestrictionMetadataMap
}

interface RestrictionMetadataMap {
  [key: string]: RestrictionMetadataDTO
}

type Features = Map<FeatureIdentifier, FeatureDetail>
type FeatureMap = Map<FeatureIdentifier, FeatureMetaData>

export interface FeatureRequestOptions {
  skipCache?: boolean
  skipCondition?: (featureRequest: FeatureRequest) => boolean
}

export interface FeaturesContextProps {
  // features only cache enabled features
  features: Features
  featureMap: FeatureMap
  requestFeatures: (featureRequest: FeatureRequest, options?: FeatureRequestOptions) => void
  checkFeature: (featureName: FeatureIdentifier) => CheckFeatureReturn
  requestLimitFeature: (featureRequest: FeatureRequest) => void
  checkLimitFeature: (featureName: FeatureIdentifier) => CheckFeatureReturn
  getRestrictionType: (featureRequest: FeatureRequest) => RestrictionType | undefined
}

const defaultReturn = {
  enabled: true
}

export const FeaturesContext = createContext<FeaturesContextProps>({
  // features caches features which restrictionType is AVAILABILITY and enabled
  features: new Map<FeatureIdentifier, FeatureDetail>(),
  // featureMap caches all feature metadata, featureName: { edition, restrictionType }
  featureMap: new Map<FeatureIdentifier, FeatureMetaData>(),
  requestFeatures: () => void 0,
  checkFeature: () => {
    return defaultReturn
  },
  requestLimitFeature: () => void 0,
  checkLimitFeature: () => {
    return defaultReturn
  },
  getRestrictionType: () => {
    return undefined
  }
})

export function useFeaturesContext(): FeaturesContextProps {
  return useContext(FeaturesContext)
}

export function FeaturesProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const [features, setFeatures] = useState<Features>(new Map<FeatureIdentifier, FeatureDetail>())
  const [featureMap, setFeatureMap] = useState<FeatureMap>(new Map<FeatureIdentifier, FeatureMetaData>())
  const [hasErr, setHasErr] = useState<boolean>(false)
  const { showError } = useToaster()
  const { getString } = useStrings()

  const { accountId } = useParams<AccountPathProps>()
  const { licenseInformation, CI_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE, CD_LICENSE_STATE } =
    useLicenseStore()

  const {
    data: enabledFeatureList,
    refetch: getEnabledFeatures,
    error: gettingEnabledFeaturesError
  } = useGetEnabledFeatureRestrictionDetailByAccountId({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const { data: metadata, error: gettingFeatureMetadataError } = useGetAllFeatureRestrictionMetadata({})

  useEffect(() => {
    if (!isEmpty(enabledFeatureList)) {
      const list = enabledFeatureList?.data?.reduce((acc, curr) => {
        if (curr?.name) {
          acc?.set(curr.name as FeatureIdentifier, {
            featureName: curr.name as FeatureIdentifier,
            enabled: !!curr.allowed,
            moduleType: curr.moduleType
          })
        }
        return acc
      }, new Map<FeatureIdentifier, FeatureDetail>())
      list && setFeatures(list)
    }
  }, [enabledFeatureList])

  useEffect(() => {
    if (!isEmpty(metadata)) {
      const list = metadata?.data?.reduce((acc, curr) => {
        if (curr?.name && curr?.restrictionMetadata) {
          acc?.set(curr.name as FeatureIdentifier, {
            moduleType: curr.moduleType as ModuleType,
            restrictionMetadataMap: curr.restrictionMetadata
          })
        }
        return acc
      }, new Map<FeatureIdentifier, FeatureMetaData>())
      list && setFeatureMap(list)
    }
  }, [metadata])

  useEffect(() => {
    if (gettingEnabledFeaturesError) {
      // set err flag to true
      setHasErr(true)
      showError(gettingEnabledFeaturesError.message || getString('somethingWentWrong'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gettingEnabledFeaturesError])

  useEffect(() => {
    if (gettingFeatureMetadataError) {
      showError(gettingFeatureMetadataError.message || getString('somethingWentWrong'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gettingFeatureMetadataError])

  // this function is called from `useFeature` hook to cache all enabled AVAILABILITY features
  async function requestFeatures(featureRequest: FeatureRequest, options?: FeatureRequestOptions): Promise<void> {
    const { skipCache = false, skipCondition } = options || {}

    // exit early if we already fetched features before
    // disabling this will disable caching, because it will make a fresh request and update in the store
    if (!skipCache && features.has(featureRequest.featureName)) {
      return
    }

    // exit early if user has defined a skipCondition and if it returns true
    if (skipCondition && skipCondition(featureRequest) === true) {
      return
    }

    await getEnabledFeatures({})

    // reset hasErr
    setHasErr(false)
  }

  function checkFeature(featureName: FeatureIdentifier): CheckFeatureReturn {
    const featureDetail = features.get(featureName)
    // absence of featureName means feature disabled
    // api call fails by default set all features to be true
    const enabled = !!featureDetail?.enabled || hasErr
    const moduleType = featureDetail?.moduleType
    return {
      enabled,
      featureDetail: {
        ...featureDetail,
        featureName,
        enabled,
        moduleType,
        apiFail: hasErr
      }
    }
  }

  const [featureDetailMap, setFeatureDetailMap] = useState<Map<FeatureIdentifier, FeatureDetail>>(
    new Map<FeatureIdentifier, FeatureDetail>()
  )
  const { mutate: getFeatureDetails } = useGetFeatureRestrictionDetail({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  // limit feature request
  async function requestLimitFeature(featureRequest: FeatureRequest): Promise<void> {
    const { featureName } = featureRequest

    // when feature metadata call fails, feature is taken as limit one and comes here
    if (gettingFeatureMetadataError) {
      return
    }

    try {
      const res = await getFeatureDetails({
        name: featureName
      })
      const allowed = res?.data?.allowed
      const restriction = res?.data?.restriction
      const enabled = !!allowed
      let limit: number, count: number
      const apiFail = false
      const moduleType = res?.data?.moduleType
      if (restriction) {
        limit = restriction.limit
        count = restriction.count
      }

      setFeatureDetailMap(oldMap => {
        return produce(oldMap, draft => {
          // update current feature in the map
          draft.set(featureName, {
            featureName,
            enabled,
            limit,
            count,
            apiFail,
            moduleType
          })
        })
      })
    } catch (ex) {
      showError(ex.data?.message || getString('somethingWentWrong'))
      setFeatureDetailMap(oldMap => {
        return produce(oldMap, draft => {
          // update current feature in the map
          draft.set(featureName, {
            featureName,
            enabled: true,
            apiFail: true,
            moduleType: undefined
          })
        })
      })
    }
  }

  function compareEditions(edition1: Editions, edition2: Editions): Editions {
    if (edition1 === Editions.ENTERPRISE || edition2 === Editions.ENTERPRISE) {
      return Editions.ENTERPRISE
    }
    if (edition1 === Editions.TEAM || edition2 === Editions.TEAM) {
      return Editions.TEAM
    }
    return Editions.FREE
  }

  function getHighestEdition(): Editions {
    let edition = Editions.FREE

    if (CI_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
      edition = compareEditions(licenseInformation?.['CI']?.edition as Editions, edition)
    }

    if (FF_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
      edition = compareEditions(licenseInformation?.['CF']?.edition as Editions, edition)
    }

    if (CD_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
      edition = compareEditions(licenseInformation?.['CD']?.edition as Editions, edition)
    }

    if (CCM_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
      edition = compareEditions(licenseInformation?.['CE']?.edition as Editions, edition)
    }

    return edition
  }

  function getEdition(moduleType: ModuleType): Editions | undefined {
    // if no license available, reture FREE for default
    if (licenseInformation === undefined || isEmpty(licenseInformation)) {
      return Editions.FREE
    }

    switch (moduleType) {
      case 'CORE': {
        return getHighestEdition()
      }
      case 'CI': {
        if (CI_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
          return (licenseInformation['CI']?.edition as Editions) || Editions.FREE
        }
        break
      }
      case 'CD': {
        if (CD_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
          return (licenseInformation['CD']?.edition as Editions) || Editions.FREE
        }
        break
      }
      case 'CF': {
        if (FF_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
          return (licenseInformation['CF']?.edition as Editions) || Editions.FREE
        }
        break
      }
      case 'CE': {
        if (CCM_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
          return (licenseInformation['CE']?.edition as Editions) || Editions.FREE
        }
        break
      }
    }

    return undefined
  }

  // find restrictionType by featureName and edition
  function getRestrictionType(featureRequest?: FeatureRequest): RestrictionType | undefined {
    if (featureRequest) {
      const featureMetadata = featureMap.get(featureRequest.featureName)
      const { moduleType, restrictionMetadataMap } = featureMetadata || {}
      const edition = getEdition(moduleType)
      if (edition) {
        return restrictionMetadataMap?.[edition]?.restrictionType as RestrictionType
      }
    }
    return undefined
  }

  function checkLimitFeature(featureName: FeatureIdentifier): CheckFeatureReturn {
    // api call fails by default set feature to be true
    const featureDetail = featureDetailMap.get(featureName)
    const enabled = featureDetail?.apiFail || !!featureDetail?.enabled
    return {
      enabled,
      featureDetail
    }
  }

  return (
    <FeaturesContext.Provider
      value={{
        features,
        featureMap,
        requestFeatures,
        requestLimitFeature,
        checkLimitFeature,
        checkFeature,
        getRestrictionType
      }}
    >
      {props.children}
    </FeaturesContext.Provider>
  )
}
