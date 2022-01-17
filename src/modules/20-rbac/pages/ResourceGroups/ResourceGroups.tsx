/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { isCDCommunity, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import FeatureWarningBanner from '@common/components/FeatureWarning/FeatureWarningBanner'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import ResourceGroupsList from '@rbac/pages/ResourceGroups/views/ResourceGroupsList'

const ResourceGroups: React.FC = () => {
  const { licenseInformation } = useLicenseStore()
  const { getString } = useStrings()
  const isCommunity = isCDCommunity(licenseInformation)

  if (isCommunity) {
    return (
      <FeatureWarningBanner
        featureName={FeatureIdentifier.CUSTOM_RESOURCE_GROUPS}
        warningMessage={getString('rbac.communityErrorMessages.resourceGroup')}
      />
    )
  }
  return <ResourceGroupsList />
}

export default ResourceGroups
