import type { RestrictionMetadataDTO, FeatureRestrictionDetailsDTO } from 'services/cd-ng'

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

export interface FeaturesRequest {
  featureNames: FeatureIdentifier[]
}

export interface FeatureProps {
  featureRequest: FeatureRequest
  isPermissionPrioritized?: boolean
}

export interface FeaturesProps {
  featuresRequest: FeaturesRequest
  isPermissionPrioritized?: boolean
}

export interface CheckFeatureReturn {
  enabled: boolean
  featureDetail?: FeatureDetail
}

export interface CheckFeaturesReturn {
  features: Map<FeatureIdentifier, CheckFeatureReturn>
}

export interface FirstDisabledFeatureReturn {
  featureEnabled: boolean
  disabledFeatureName?: FeatureIdentifier
}
export interface FeatureMetaData {
  moduleType: ModuleType
  restrictionMetadataMap: RestrictionMetadataMap
}

export interface RestrictionMetadataMap {
  [key: string]: RestrictionMetadataDTO
}

export interface FeatureRequestOptions {
  skipCache?: boolean
  skipCondition?: (featureRequest: FeatureRequest | FeaturesRequest) => boolean
}
