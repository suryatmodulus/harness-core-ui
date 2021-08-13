import React from 'react'
import { Button, Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import AddClusterImage from './images/AddCluster.svg'
import css from './OverviewPage.module.scss'

const OverviewAddCluster = ({ onAddClusterSuccess }: { onAddClusterSuccess: () => void }) => {
  const { getString } = useStrings()
  const { openConnectorModal, hideConnectorModal } = useCreateConnectorModal({
    onSuccess: () => {
      onAddClusterSuccess()
      hideConnectorModal()
    }
  })

  return (
    <div className={css.addCluster}>
      <img src={AddClusterImage} height={150} />
      <Container width={650}>
        <Text>{getString('ce.overview.addClusterDesc')}</Text>
      </Container>
      <Button
        withoutBoxShadow={true}
        className={css.addClusterBtn}
        text={getString('ce.overview.addClusterBtn')}
        onClick={() => {
          openConnectorModal(false, Connectors.CE_KUBERNETES, {
            connectorInfo: { orgIdentifier: '', projectIdentifier: '' } as unknown as ConnectorInfoDTO
          })
        }}
      />
    </div>
  )
}

export default OverviewAddCluster
