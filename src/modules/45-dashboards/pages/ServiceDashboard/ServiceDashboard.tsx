import React from 'react'
import ServiceDetailPage from '../ServiceDetailPage/ServiceDetailPage'

interface ServiceDashboardProps {
  id?: string
}

export const ServiceDashboard: React.FC<ServiceDashboardProps> = () => {
  return <ServiceDetailPage />
}
