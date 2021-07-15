import React, { useState } from 'react'
import { useModalHook, Button, Text, Card, Icon, Layout } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/strings'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import useCreateConnectorModal, { ConnectorModaldata, UseCreateConnectorModalProps } from './useCreateConnectorModal'
import wizardCss from '../../components/CreateConnectorWizard/CreateConnectorWizard.module.scss'
import css from './useCreateConnectorMultiTypeModal.module.scss'
export interface UseCreateConnectorMultiTypeModalProps {
  types: ConnectorInfoDTO['type'][]
  onSuccess?: UseCreateConnectorModalProps['onSuccess']
  onClose?: () => void
}

export interface UseCreateConnectorMultiTypeModalReturn {
  openConnectorMultiTypeModal: (connector?: ConnectorModaldata) => void
  hideConnectorMultiTypeModal: () => void
}

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 1175,
    minHeight: 640,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0278D5',
    padding: '300px 140px 0'
  }
}

const useCreateConnectorMultiTypeModal = (
  props: UseCreateConnectorMultiTypeModalProps
): UseCreateConnectorMultiTypeModalReturn => {
  const { getString } = useStrings()
  const [gitDetails, setGitDetails] = useState<IGitContextFormProps | undefined>()

  const handleClose = (): void => {
    props.onClose?.()
    hideModal()
  }

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: props.onSuccess,
    onClose: handleClose
  })

  const handleSelect = (type: ConnectorInfoDTO['type']): void => {
    hideModal()
    openConnectorModal(false, type, { gitDetails: gitDetails })
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps} className={css.modal}>
        <Text font={{ size: 'large', weight: 'semi-bold' }} color="white" margin={{ bottom: 'small' }}>
          Select your Connector type
        </Text>
        <Text font={{ size: 'normal', weight: 'semi-bold' }} color="white" margin={{ bottom: 'xxlarge' }}>
          Start by selecting your connector type
        </Text>
        <Layout.Horizontal spacing="medium">
          {props.types.map(type => (
            <div key={type} className={css.card}>
              <Card interactive={true} elevation={0} selected={false} onClick={() => handleSelect(type)}>
                <Icon name={getConnectorIconByType(type)} size={20} />
              </Card>
              <Text lineClamp={3} color="white" margin={{ top: 'small' }} style={{ textAlign: 'center', width: 80 }}>
                {getString(getConnectorTitleIdByType(type))}
              </Text>
            </div>
          ))}
        </Layout.Horizontal>
        <Button className={wizardCss.crossIcon} minimal icon="cross" iconProps={{ size: 18 }} onClick={handleClose} />
      </Dialog>
    ),
    [props.types]
  )

  return {
    openConnectorMultiTypeModal: (connector?: ConnectorModaldata) => {
      setGitDetails(connector?.gitDetails)
      showModal()
    },
    hideConnectorMultiTypeModal: hideModal
  }
}

export default useCreateConnectorMultiTypeModal
