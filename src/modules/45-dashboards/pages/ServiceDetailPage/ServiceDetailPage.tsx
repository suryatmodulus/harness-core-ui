import React from 'react'

import ActiveServiceInstances from '@dashboards/components/ActiveServiceInstances/ActiveServiceInstances'

interface ServiceDetailPageProps {
  id?: string
}

const ServiceDetailPage: React.FC<ServiceDetailPageProps> = () => {
  return <ActiveServiceInstances />
}

export default ServiceDetailPage
