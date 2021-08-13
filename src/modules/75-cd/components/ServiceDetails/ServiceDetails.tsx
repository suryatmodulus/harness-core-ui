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
