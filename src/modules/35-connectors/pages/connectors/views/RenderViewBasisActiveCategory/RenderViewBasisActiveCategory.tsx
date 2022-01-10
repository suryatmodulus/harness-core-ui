import React from 'react'
import { NoDataCard } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ConnectorResponse } from 'services/cd-ng'
import EntitySetupUsage from '@common/pages/entityUsage/EntityUsage'
import ActivityHistory from '@connectors/components/activityHistory/ActivityHistory/ActivityHistory'
import ConnectorView from '../../ConnectorView'

interface RenderViewBasisActiveCategoryProps {
  activeCategory: number
  data: ConnectorResponse
  refetch: () => Promise<void>
}

const RenderViewBasisActiveCategory: React.FC<RenderViewBasisActiveCategoryProps> = ({
  activeCategory,
  data,
  refetch
}) => {
  const { getString } = useStrings()
  switch (activeCategory) {
    case 0:
      return data.connector?.type ? (
        <ConnectorView
          type={data.connector.type}
          response={data || ({} as ConnectorResponse)}
          refetchConnector={refetch}
        />
      ) : (
        <NoDataCard message={getString('connectors.connectorNotFound')} icon="question" />
      )
    case 1:
      return data.connector?.identifier ? (
        <EntitySetupUsage entityType={'Connectors'} entityIdentifier={data.connector.identifier} />
      ) : (
        <></>
      )
    case 2:
      return <ActivityHistory referredEntityType="Connectors" entityIdentifier={data.connector?.identifier || ''} />
    default:
      return <></>
  }
}

export default RenderViewBasisActiveCategory
