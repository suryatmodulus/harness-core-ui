/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState } from 'react'
import { noop } from 'lodash-es'
import { Views, ServiceStoreContext } from './common'

import { ServicesHeader } from './ServicesHeader/ServicesHeader'
import { ServicesContent } from './ServicesContent/ServicesContent'

export const Services: React.FC = () => {
  const [view, setView] = useState(Views.INSIGHT)
  const fetchDeploymentList = useRef<() => void>(noop)
  return (
    <ServiceStoreContext.Provider
      value={{
        view,
        setView,
        fetchDeploymentList
      }}
    >
      <ServicesHeader />
      <ServicesContent />
    </ServiceStoreContext.Provider>
  )
}
