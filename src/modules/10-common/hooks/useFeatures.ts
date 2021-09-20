import { useDeepCompareEffect } from '@common/hooks'
import {
  useFeaturesContext,
  FeatureRequestOptions,
  FeatureRequest,
  CheckFeatureReturn,
  ToolTipProps
} from 'framework/featureStore/FeaturesContext'

interface Props {
  featureRequest: FeatureRequest
  options?: FeatureRequestOptions
  tooltipProps?: ToolTipProps
}

export function useFeature(props: Props): CheckFeatureReturn {
  const { requestFeatures, checkFeature, requestLimitFeature, checkLimitFeature } = useFeaturesContext()

  const { featureRequest, options, tooltipProps } = props
  useDeepCompareEffect(() => {
    if (featureRequest.isRateLimit) {
      requestLimitFeature(featureRequest)
    } else {
      // cache enabled feature list in the context
      requestFeatures(featureRequest, options)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureRequest, options])

  // rate limit feature always calls the api in real time
  return featureRequest.isRateLimit
    ? checkLimitFeature(featureRequest.featureName, tooltipProps)
    : checkFeature(featureRequest.featureName, tooltipProps)
}
