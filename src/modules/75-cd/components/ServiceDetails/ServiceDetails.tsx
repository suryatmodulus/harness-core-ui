/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@wings-software/uicore'
import { ServiceDetailsHeader } from '@cd/components/ServiceDetails/ServiceDetailsHeader/ServiceDetailsHeader'
import { ServiceDetailsContent } from '@cd/components/ServiceDetails/ServiceDetailsContent/ServiceDetailsContent'

const ServiceDetails: React.FC = () => {
  return (
    <Layout.Vertical>
      <ServiceDetailsHeader />
      <ServiceDetailsContent />
    </Layout.Vertical>
  )
}

export default ServiceDetails
