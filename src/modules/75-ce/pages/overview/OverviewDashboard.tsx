import React from 'react'
import { useEffect } from 'react'
import { useCreateConnectorMinimal } from '@ce/components/CreateConnector/CreateConnector'
import { CcmMetaData, useCcmMetaDataQuery } from 'services/ce/services'
import { Utils } from '@ce/common/Utils'
import bgImage from './images/CD/overviewBg.png'

// interface OverviewDashboardProps {}

const OverviewDashboard: React.FC = () => {
  const { openModal } = useCreateConnectorMinimal({})

  const [result] = useCcmMetaDataQuery()
  const { data } = result

  useEffect(() => {
    if (data && !Utils.accountHasConnectors(data.ccmMetaData as CcmMetaData)) openModal()
  }, [data])

  return (
    <div style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', height: '100%', width: '100%' }}></div>
  )
}

export default OverviewDashboard
