import React from 'react'
import { useState } from 'react'
import { Dialog, IconName, IDialogProps } from '@blueprintjs/core/lib/esm/components'
import { Button, CardSelect, Container, Heading, Icon, Layout, Text, useModalHook } from '@wings-software/uicore'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import css from './CreateConnector.module.scss'

// interface useCreateConnectorProps {}

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 860,
    position: 'relative',
    height: 500
  }
}

interface CloudProviderListProps {
  onChange?: (selectedProvider: string) => void
  selected?: string
}

const CloudProviderList: React.FC<CloudProviderListProps> = ({ onChange, selected }) => {
  const providers = [
    {
      icon: 'service-aws',
      title: 'AWS'
    },
    {
      icon: 'gcp',
      title: 'GCP'
    },
    {
      icon: 'service-azure',
      title: 'Azure'
    },
    {
      icon: 'service-kubernetes',
      title: 'Kubernetes'
    }
  ]
  return (
    <div className={css.cloudProviderListContainer}>
      <CardSelect
        data={providers}
        cornerSelected={true}
        renderItem={item => (
          <div>
            <Icon name={item.icon as IconName} size={26} />
          </div>
        )}
        onChange={value => onChange?.(value.title)}
        selected={providers.find(_p => _p.title === selected)}
        className={css.listContainer}
      ></CardSelect>
      <div className={css.textList}>
        {providers.map(provider => (
          <Text key={provider.title}>{provider.title}</Text>
        ))}
      </div>
    </div>
  )
}

const useCreateConnector = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>()

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: () => {
      // handleConnectorCreationSuccess(data?.connector)
    }
  })

  const handleConnectorCreation = () => {
    let connectorType
    switch (selectedProvider) {
      case 'AWS':
        connectorType = Connectors.CEAWS
        break
      case 'GCP':
        connectorType = Connectors.CE_GCP
        break
      case 'Azure':
        connectorType = Connectors.CE_AZURE
        break
      case 'Kubernetes':
        connectorType = Connectors.CE_KUBERNETES
        break
    }

    if (connectorType) {
      openConnectorModal(false, connectorType, {
        connectorInfo: { orgIdentifier: '', projectIdentifier: '' } as unknown as ConnectorInfoDTO
      })
    }
  }

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog {...modalProps} className={css.createConnectorDialog}>
        <Layout.Horizontal style={{ height: '100%' }}>
          <Container className={css.connectorsSection}>
            <Heading>{'Welcome!'}</Heading>
            <Text>Let’s get you started with Cloud Cost Management</Text>
            <Text>
              To begin with, you need to create a Connector that will pull in data from your Cloud provider into CCM
            </Text>
            <section style={{ paddingTop: 15 }}>
              <Text className={css.selectProviderLabel}>Select your Cloud provider</Text>
              <CloudProviderList onChange={setSelectedProvider} selected={selectedProvider} />
            </section>
            <Button
              text={'Next'}
              disabled={!selectedProvider}
              intent="primary"
              onClick={handleConnectorCreation}
              className={css.nextButton}
            />
          </Container>
          <Container className={css.carouselSection}>Carousel</Container>
        </Layout.Horizontal>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-instance-modal'}
        />
      </Dialog>
    )
  }, [selectedProvider])

  return {
    openModal: showModal
  }
}

export default useCreateConnector
