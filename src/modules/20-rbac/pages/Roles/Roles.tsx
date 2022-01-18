/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'

import { isCDCommunity, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import RolesList from '@rbac/pages/Roles/views/RolesList'
import FeatureWarningBanner from '@common/components/FeatureWarning/FeatureWarningBanner'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'

const Roles: React.FC = () => {
  const { licenseInformation } = useLicenseStore()
  const { getString } = useStrings()
  const isCommunity = isCDCommunity(licenseInformation)

  if (isCommunity) {
    return (
      <FeatureWarningBanner
        featureName={FeatureIdentifier.CUSTOM_ROLES}
        warningMessage={getString('rbac.communityErrorMessages.role')}
      />
    )
  }
  return <RolesList />
}

export default Roles
