import { useDeepCompareEffect } from '@common/hooks'
import {
  useFeaturesContext,
  FeatureRequestOptions,
  FeatureRequest,
  CheckFeatureReturn
} from 'framework/featureStore/FeaturesContext'

interface Props {
  featureRequest?: FeatureRequest
  options?: FeatureRequestOptions
}

export function useFeature(props: Props): CheckFeatureReturn {
  const { requestFeatures, checkFeature, requestLimitFeature, checkLimitFeature } = useFeaturesContext()

  const { featureRequest, options } = props
  useDeepCompareEffect(() => {
    if (featureRequest) {
      if (featureRequest.isLimit) {
        requestLimitFeature(featureRequest)
      } else {
        // cache enabled feature list in the context
        requestFeatures(featureRequest, options)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureRequest, options])

  if (featureRequest === undefined) {
    return { enabled: true }
  }

  // rate limit feature always calls the api in real time
  return featureRequest.isLimit
    ? checkLimitFeature(featureRequest.featureName)
    : checkFeature(featureRequest.featureName)
}
