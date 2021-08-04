import React, { useState } from 'react'
import { Views, ServiceStoreContext } from './common'

import { ServicesHeader } from './ServicesHeader/ServicesHeader'
import { ServicesContent } from './ServicesContent/ServicesContent'

export const Services: React.FC = () => {
  const [view, setView] = useState(Views.INSIGHT)
  return (
    <ServiceStoreContext.Provider value={{ view, setView }}>
      <ServicesHeader />
      <ServicesContent />
    </ServiceStoreContext.Provider>
  )
}
