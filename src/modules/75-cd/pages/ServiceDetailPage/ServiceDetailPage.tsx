import React from 'react'
import { Services } from '@cd/components/Services/Services'
interface ServiceDetailPageProps {
  id?: string
}

const ServiceDetailPage: React.FC<ServiceDetailPageProps> = () => {
  return (
    <>
      <Services />
    </>
  )
}

export default ServiceDetailPage
