import React from 'react'
import { useEffect } from 'react'
import { useCreateConnectorMinimal } from '@ce/components/CreateConnector/CreateConnector'
import bgImage from './images/CD/overviewBg.png'

// interface OverviewDashboardProps {}

const OverviewDashboard: React.FC = () => {
  const { openModal } = useCreateConnectorMinimal()

  useEffect(() => {
    openModal()
  }, [])

  return (
    <div style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', height: '100%', width: '100%' }}></div>
  )
}

export default OverviewDashboard
