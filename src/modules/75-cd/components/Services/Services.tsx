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
