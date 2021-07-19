import React, { useEffect } from 'react'
import { useCreateConnectorMinimal } from '@ce/components/CreateConnector/CreateConnector'
import bgImage from './images/perspectiveBg.png'

// interface PerspectiveDashboardProps {}

const PerspectiveDashboard: React.FC = () => {
  const { openModal } = useCreateConnectorMinimal()

  useEffect(() => {
    openModal()
  }, [])

  return (
    <div style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', height: '100%', width: '100%' }}></div>
  )
}

export default PerspectiveDashboard
