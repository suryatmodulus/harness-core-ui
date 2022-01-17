/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
