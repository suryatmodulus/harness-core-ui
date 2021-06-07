import React, { useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router'
import { CreateConnectorWizard } from '@connectors/components/CreateConnectorWizard/CreateConnectorWizard'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO, ConnectorRequestBody } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import css from '../../components/CreateConnectorWizard/CreateConnectorWizard.module.scss'

export interface UseCreateConnectorModalProps {
  onSuccess?: (data?: ConnectorRequestBody) => void
  onClose?: () => void
}

export interface ConnectorModaldata {
  connectorInfo?: ConnectorInfoDTO
  gitDetails?: IGitContextFormProps
}

export interface UseCreateConnectorModalReturn {
  openConnectorModal: (
    isEditMode: boolean,
    type: ConnectorInfoDTO['type'],
    connector?: ConnectorModaldata,
    modalProps?: IDialogProps
  ) => void
  hideConnectorModal: () => void
}

const useCreateConnectorModal = (props: UseCreateConnectorModalProps): UseCreateConnectorModalReturn => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [type, setType] = useState(Connectors.KUBERNETES_CLUSTER)
  const [connectorInfo, setConnectorInfo] = useState<ConnectorInfoDTO | undefined>()
  const [gitDetails, setGitDetails] = useState<IGitContextFormProps | undefined>()
  const [modalProps, setModalProps] = useState<IDialogProps>({
    isOpen: true,
    style: {
      width: 1175,
      minHeight: 640,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  })
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const handleSuccess = (data?: ConnectorRequestBody): void => {
    props.onSuccess?.(data)
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <CreateConnectorWizard
          accountId={accountId}
          orgIdentifier={(connectorInfo ? connectorInfo.orgIdentifier : orgIdentifier) as string} //For create take scope from url else from entities
          projectIdentifier={(connectorInfo ? connectorInfo.projectIdentifier : projectIdentifier) as string}
          type={type}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          connectorInfo={connectorInfo}
          gitDetails={gitDetails}
          onSuccess={data => {
            handleSuccess(data)
          }}
          onClose={() => {
            props.onClose?.()
            hideModal()
          }}
        />
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            props.onClose?.()
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [type, isEditMode, connectorInfo, gitDetails]
  )

  return {
    openConnectorModal: (
      isEditing: boolean,
      connectorType: ConnectorInfoDTO['type'],
      connector?: ConnectorModaldata,
      _modalProps?: IDialogProps
    ) => {
      setConnectorInfo(connector?.connectorInfo)
      setGitDetails(connector?.gitDetails)
      setIsEditMode(isEditing)
      setType(connectorType)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    hideConnectorModal: hideModal
  }
}

export default useCreateConnectorModal
