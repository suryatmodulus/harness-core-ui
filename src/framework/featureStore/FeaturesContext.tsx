import React, { createContext, useContext, useState, useCallback } from 'react'
import debounce from 'p-debounce'
import { isEqual } from 'lodash-es'
import produce from 'immer'

import { useParams } from 'react-router'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

export interface FeatureRequest {
  accountIdentifier?: string
  featureName: string
  isRateLimit?: boolean
}

interface FeatureResponse {
  name: string
  restrictionType: string
  limit?: number
  count?: number
  enabled: boolean
}

type Features = Map<string, boolean>

export interface FeatureRequestOptions {
  skipCache?: boolean
  skipCondition?: (featureRequest: FeatureRequest) => boolean
  debounce?: number
}

export interface FeaturesContextProps {
  // features only cache enabled features
  features: Features
  requestFeatures: (featureRequest: FeatureRequest, options?: FeatureRequestOptions) => void
  checkFeature: (featureName: string) => boolean
  checkLimitFeature: (featureRequest: FeatureRequest, options?: FeatureRequestOptions) => boolean
  cancelRequest: (featureRequest: FeatureRequest) => void
}

export const FeaturesContext = createContext<FeaturesContextProps>({
  features: new Map<string, boolean>(),
  requestFeatures: () => void 0,
  checkFeature: () => true,
  checkLimitFeature: () => true,
  cancelRequest: () => void 0
})

export function useFeaturesContext(): FeaturesContextProps {
  return useContext(FeaturesContext)
}

interface FeaturesProviderProps {
  debounceWait?: number
}

let pendingRequests: FeatureRequest[] = []

export function FeaturesProvider(props: React.PropsWithChildren<FeaturesProviderProps>): React.ReactElement {
  const { debounceWait = 50 } = props
  const [features, setFeatures] = useState<Features>(new Map<string, boolean>())
  const [hasErr, setHasErr] = useState<boolean>(false)

  const { accountId } = useParams<AccountPathProps>()

  const { refetch: getEnabledFeatures } = useGetEnabledFeaturesForAccount({
    lazy: true
  })
  const debouncedGetFeatures = useCallback(debounce(getEnabledFeatures, debounceWait), [
    getEnabledFeatures,
    debounceWait
  ])

  // this function is called from `useFeature` hook to cache all enabled features
  // make the feature list call until `debounceWait` is triggered
  async function requestFeatures(featureRequest: FeatureRequest, options?: FeatureRequestOptions): Promise<void> {
    // rate limit feature doesn't get cached
    if (featureRequest.isRateLimit) return

    const { skipCache = false, skipCondition } = options || {}

    // exit early if we already fetched features before
    // disabling this will disable caching, because it will make a fresh request and update in the store
    if (!skipCache && features.size > 0) {
      return
    }

    // exit early if user has defined a skipCondition and if it returns true
    if (skipCondition && skipCondition(featureRequest) === true) {
      return
    }

    // check if this request is already queued
    if (!pendingRequests.find(req => isEqual(req, featureRequest))) {
      pendingRequests.push(featureRequest)
    }

    try {
      // try to fetch the features after waiting for `debounceWait` ms
      const res = await debouncedGetFeatures({
        features: pendingRequests
      })

      // clear pending requests after API call
      pendingRequests = []

      // reset hasErr
      setHasErr(false)

      // `p-debounce` package ensure all debounced promises are resolved at this stage
      setFeatures(oldFeatures => {
        return produce(oldFeatures, draft => {
          // find the current request in aggregated response
          const enabled = res?.data?.find((feature: FeatureResponse) =>
            isEqual(feature.name, featureRequest.featureName)
          )?.enabled

          // update current feature in the map
          draft.set(featureRequest.featureName, !!enabled)
        })
      })
    } catch (err) {
      // clear pending requests even if api fails
      pendingRequests = []
      // set err flag to true
      setHasErr(true)
      if (process.env.NODE_ENV === 'test') throw err
    }
  }

  function checkFeature(featureName: string): boolean {
    const feature = features.get(featureName)
    // absence of featureName means feature disabled
    // api call fails by default set all features to be true
    return !!feature || hasErr
  }

  // rate/limit feature check
  function checkLimitFeature(featureRequest: FeatureRequest, options?: FeatureRequestOptions): boolean {
    const { accountIdentifier = accountId, featureName } = featureRequest
    const { debounce = 50 } = options
    //TODO: call rate/limit api, if api call fails, return true
    return true
  }

  function cancelRequest(featureRequest: FeatureRequest): void {
    // remove any matching requests
    pendingRequests = pendingRequests.filter(req => !isEqual(req, featureRequest))
  }

  return (
    <FeaturesContext.Provider value={{ features, requestFeatures, checkLimitFeature, checkFeature, cancelRequest }}>
      {props.children}
    </FeaturesContext.Provider>
  )
}
