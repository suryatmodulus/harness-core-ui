import React from 'react'
import { Dialog, IconName, IDialogProps } from '@blueprintjs/core/lib/esm/components'
import { Button, CardSelect, Container, Heading, Icon, Layout, Text, useModalHook } from '@wings-software/uicore'
import { useState } from 'react'

// interface useCreateConnectorProps {}

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 860,
    padding: 40,
    position: 'relative',
    minHeight: 500
  }
}

interface CloudProviderListProps {
  onChange?: (selectedProvider: string) => void
}

const CloudProviderList: React.FC<CloudProviderListProps> = ({ onChange }) => {
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
    <div>
      <CardSelect
        data={providers}
        cornerSelected={true}
        renderItem={item => (
          <div>
            <Icon name={item.icon as IconName} size={30} />
          </div>
        )}
        onChange={value => onChange?.(value.title)}
        selected={providers[0]}
      ></CardSelect>
      {providers.map(provider => (
        <Text key={provider.title}>{provider.title}</Text>
      ))}
    </div>
  )
}

const useCreateConnector = () => {
  const [selectedProvider] = useState<string>()
  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog {...modalProps}>
        <Layout.Horizontal>
          <Container>
            <Heading>{'Welcome!'}</Heading>
            <Text>Let’s get you started with Cloud Cost Management</Text>
            <Text>
              To begin with, you need to create a Connector that will pull in data from your Cloud provider into CCM
            </Text>
            <section>
              <Text>Select your Cloud provider</Text>
              <CloudProviderList />
            </section>
            <Button text={'Next'} disabled={!selectedProvider} intent="primary" />
          </Container>
          <Container>Carousel</Container>
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
  })

  return {
    openModal: showModal
  }
}

export default useCreateConnector
