import { useEffect } from 'react'
import {
  useFeaturesContext,
  FeatureRequestOptions,
  FeatureRequest,
  CheckFeatureReturn,
  ToolTipProps
} from 'framework/featureStore/FeaturesContext'

export function useFeature(
  featureRequest: FeatureRequest,
  options?: FeatureRequestOptions,
  tooltipProps?: ToolTipProps
): CheckFeatureReturn {
  const { requestFeatures, checkFeature, checkLimitFeature, cancelRequest } = useFeaturesContext()

  useEffect(() => {
    // cache enabled feature list in the context
    requestFeatures(featureRequest, options)

    return () => {
      // cancel above request when this hook instance is unmounting
      cancelRequest(featureRequest)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureRequest, options])

  // rate limit feature always calls the api in real time
  return featureRequest.isRateLimit
    ? checkLimitFeature(featureRequest, options, tooltipProps)
    : checkFeature(featureRequest.featureName, tooltipProps)
}
