import React, { createContext, useContext, useState, useEffect } from 'react'
import { isEmpty } from 'lodash-es'
import produce from 'immer'

import { useParams } from 'react-router'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetEnabledFeatureRestrictionDetailByAccountId, useGetFeatureRestrictionDetail } from 'services/cd-ng'
import type { FeatureIdentifier } from './FeatureIdentifier'

export interface FeatureDetail {
  featureName: string
  enabled: boolean
  limit?: number
  count?: number
  apiFail?: boolean
}
export interface FeatureRequest {
  featureName: FeatureIdentifier
  isLimit?: boolean
}

export interface CheckFeatureReturn {
  enabled: boolean
  featureDetail?: FeatureDetail
}

type Features = Map<string, FeatureDetail>

export interface FeatureRequestOptions {
  skipCache?: boolean
  skipCondition?: (featureRequest: FeatureRequest) => boolean
}

export interface FeaturesContextProps {
  // features only cache enabled features
  features: Features
  requestFeatures: (featureRequest: FeatureRequest, options?: FeatureRequestOptions) => void
  checkFeature: (featureName: string) => CheckFeatureReturn
  requestLimitFeature: (featureRequest: FeatureRequest) => void
  checkLimitFeature: (featureName: string) => CheckFeatureReturn
}

const defaultReturn = {
  enabled: true
}

export const FeaturesContext = createContext<FeaturesContextProps>({
  features: new Map<string, FeatureDetail>(),
  requestFeatures: () => void 0,
  checkFeature: () => {
    return defaultReturn
  },
  requestLimitFeature: () => void 0,
  checkLimitFeature: () => {
    return defaultReturn
  }
})

export function useFeaturesContext(): FeaturesContextProps {
  return useContext(FeaturesContext)
}

export function FeaturesProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const [features, setFeatures] = useState<Features>(new Map<string, FeatureDetail>())
  const [hasErr, setHasErr] = useState<boolean>(false)

  const { accountId } = useParams<AccountPathProps>()

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

  useEffect(() => {
    if (!isEmpty(enabledFeatureList)) {
      const list = enabledFeatureList?.data?.reduce((acc, curr) => {
        if (curr?.name) {
          acc?.set(curr?.name, {
            featureName: curr?.name,
            enabled: !!curr?.allowed
          })
        }
        return acc
      }, new Map<string, FeatureDetail>())
      list && setFeatures(list)
    }
  }, [enabledFeatureList])

  useEffect(() => {
    if (gettingEnabledFeaturesError) {
      // set err flag to true
      setHasErr(true)
    }
  }, [gettingEnabledFeaturesError])

  // this function is called from `useFeature` hook to cache all enabled features
  async function requestFeatures(featureRequest: FeatureRequest, options?: FeatureRequestOptions): Promise<void> {
    // rate limit feature doesn't get cached
    if (featureRequest.isLimit) {
      return
    }

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

  function checkFeature(featureName: string): CheckFeatureReturn {
    const featureDetail = features.get(featureName)
    // absence of featureName means feature disabled
    // api call fails by default set all features to be true
    const enabled = !!featureDetail?.enabled || hasErr
    return {
      enabled,
      featureDetail: {
        ...featureDetail,
        featureName,
        enabled,
        apiFail: hasErr
      }
    }
  }

  const [featureDetailMap, setFeatureDetailMap] = useState<Map<string, FeatureDetail>>(new Map<string, FeatureDetail>())
  const { mutate: getFeatureDetails } = useGetFeatureRestrictionDetail({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  // rate/limit feature check
  async function requestLimitFeature(featureRequest: FeatureRequest): Promise<void> {
    const { featureName } = featureRequest

    try {
      const res = await getFeatureDetails({
        name: featureName
      })
      const allowed = res?.data?.allowed
      const restriction = res?.data?.restriction
      const enabled = !!allowed
      let limit: number, count: number
      const apiFail = false
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
            apiFail
          })
        })
      })
    } catch (ex) {
      setFeatureDetailMap(oldMap => {
        return produce(oldMap, draft => {
          // update current feature in the map
          draft.set(featureName, {
            featureName,
            enabled: true,
            apiFail: true
          })
        })
      })
    }
  }

  function checkLimitFeature(featureName: string): CheckFeatureReturn {
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
      value={{ features, requestFeatures, requestLimitFeature, checkLimitFeature, checkFeature }}
    >
      {props.children}
    </FeaturesContext.Provider>
  )
}
