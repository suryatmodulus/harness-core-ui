import React, { useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router'
import type { AlertRuleDTO } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import CreateCVNotification from './CreateCVNotification/CreateCVNotification'
import css from './useCVNotificationsModal.module.scss'

export interface UseCVNotificationsModalReturn {
  openNotificationModal: (isEditMode?: boolean, notification?: AlertRuleDTO) => void
  hideNotificationModal: () => void
}

export interface UseCVNotificationsModalProps {
  onSuccess?: () => void
}
const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    minWidth: 1000,
    minHeight: 530,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}

const useCVNotificationsModal = (props: UseCVNotificationsModalProps): UseCVNotificationsModalReturn => {
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [isEdit, setIsEdit] = useState(false)
  const [notification, setNotification] = useState<AlertRuleDTO | void>()
  const handleSuccess = (): void => {
    hideModal()
    props.onSuccess?.()
  }

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog
        {...modalProps}
        onClose={() => {
          hideModal()
        }}
      >
        <CreateCVNotification
          onSuccess={handleSuccess}
          hideModal={hideModal}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          notificationData={notification}
          isEditMode={isEdit}
        />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    [isEdit, notification]
  )

  return {
    openNotificationModal: (isEditMode?: boolean, _notification?: AlertRuleDTO) => {
      setIsEdit(!!isEditMode)
      setNotification(_notification)
      openModal()
    },
    hideNotificationModal: hideModal
  }
}

export default useCVNotificationsModal
