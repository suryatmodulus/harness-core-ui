import React, { createContext, useContext, useState, useEffect } from 'react'
import { isEmpty } from 'lodash-es'
import produce from 'immer'

import { useParams } from 'react-router'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useGetEnabledFeatureDetailsByAccountId, useGetFeatureDetail } from 'services/cd-ng'
import type { FeatureIdentifier } from './FeatureIdentifier'
import FeatureTooltip from './FeatureToolTip'
import type { FeatureTooltipProps } from './FeatureToolTip'

export interface FeatureRequest {
  accountIdentifier?: string
  featureName: FeatureIdentifier
  isRateLimit?: boolean
}

export interface CheckFeatureReturn {
  enabled: boolean
  toolTip?: React.ReactElement
}

type Features = Map<string, boolean>

export interface FeatureRequestOptions {
  skipCache?: boolean
  skipCondition?: (featureRequest: FeatureRequest) => boolean
}

export interface ToolTipProps {
  module: Module
}

export interface FeaturesContextProps {
  // features only cache enabled features
  features: Features
  requestFeatures: (featureRequest: FeatureRequest, options?: FeatureRequestOptions) => void
  checkFeature: (featureName: string, toolTipProps?: ToolTipProps) => CheckFeatureReturn
  requestLimitFeature: (featureRequest: FeatureRequest) => void
  checkLimitFeature: (featureName: string, toolTipProps?: ToolTipProps) => CheckFeatureReturn
}

const defaultReturn = {
  enabled: true
}

export const FeaturesContext = createContext<FeaturesContextProps>({
  features: new Map<string, boolean>(),
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
  const [features, setFeatures] = useState<Features>(new Map<string, boolean>())
  const [hasErr, setHasErr] = useState<boolean>(false)

  const { accountId } = useParams<AccountPathProps>()

  const {
    data: enabledFeatureList,
    refetch: getEnabledFeatures,
    error: gettingEnabledFeaturesError
  } = useGetEnabledFeatureDetailsByAccountId({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  useEffect(() => {
    if (!isEmpty(enabledFeatureList)) {
      const list = enabledFeatureList?.data?.reduce((acc, curr) => {
        if (curr?.name) {
          acc?.set(curr?.name, !!curr?.allowed)
        }
        return acc
      }, new Map<string, boolean>())
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
    if (featureRequest.isRateLimit) {
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

  function checkFeature(featureName: string, toolTipProps?: ToolTipProps): CheckFeatureReturn {
    const feature = features.get(featureName)
    const { module } = toolTipProps || {}
    // absence of featureName means feature disabled
    // api call fails by default set all features to be true
    const enabled = !!feature || hasErr
    const toolTip = getToolTip(
      enabled,
      {
        featureName,
        apiFail: hasErr
      },
      module
    )
    return {
      enabled,
      toolTip
    }
  }
  interface FeatureDetailProps {
    featureName: string
    enabled: boolean
    limit?: number
    count?: number
    apiFail?: boolean
  }

  const [featureDetailMap, setFeatureDetailMap] = useState<Map<string, FeatureDetailProps>>(
    new Map<string, FeatureDetailProps>()
  )
  const { mutate: getFeatureDetails } = useGetFeatureDetail({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  // rate/limit feature check
  async function requestLimitFeature(featureRequest: FeatureRequest): Promise<void> {
    const { featureName } = featureRequest

    try {
      const res = await getFeatureDetails({
        featureName
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

  function checkLimitFeature(featureName: string, toolTipProps?: ToolTipProps): CheckFeatureReturn {
    const { module } = toolTipProps || {}
    // api call fails by default set feature to be true
    const featureDetail = featureDetailMap.get(featureName)
    const enabled = featureDetail?.apiFail || !!featureDetail?.enabled
    const toolTip = getToolTip(
      enabled,
      {
        featureName,
        apiFail: featureDetail?.apiFail,
        limit: featureDetail?.limit,
        count: featureDetail?.count
      },
      module
    )
    return {
      enabled,
      toolTip
    }
  }

  function getToolTip(
    enabled: boolean,
    toolTipProps: FeatureTooltipProps,
    module?: Module
  ): React.ReactElement | undefined {
    if (toolTipProps.apiFail) {
      return (
        <FeatureTooltip
          featureName={toolTipProps?.featureName || 'TEST1'}
          apiFail={toolTipProps?.apiFail}
          limit={toolTipProps?.limit}
          count={toolTipProps?.count}
          module={module}
        />
      )
    }

    if (enabled) {
      return undefined
    }

    return (
      <FeatureTooltip
        featureName={toolTipProps?.featureName || 'TEST1'}
        apiFail={toolTipProps?.apiFail}
        limit={toolTipProps?.limit}
        count={toolTipProps?.count}
        module={module}
      />
    )
  }

  return (
    <FeaturesContext.Provider
      value={{ features, requestFeatures, requestLimitFeature, checkLimitFeature, checkFeature }}
    >
      {props.children}
    </FeaturesContext.Provider>
  )
}
