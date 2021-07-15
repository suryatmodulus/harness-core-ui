import React, { useCallback, useState } from 'react'
import { useModalHook, Button, Color, Text } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import type { SecretDTOV2 } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import VerifyConnection from './views/VerifyConnection'
import css from './useCreateSSHCredModal.module.scss'

export interface UseVerifyModalReturn {
  openVerifyModal: (project?: SecretDTOV2) => void
  closeVerifyModal: () => void
}

export const useVerifyModal = (): UseVerifyModalReturn => {
  const [data, setData] = useState<SecretDTOV2>()
  const { getString } = useStrings()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} onClose={hideModal} className={cx(Classes.DIALOG, css.verifyDialog)}>
        <Text margin={{ bottom: 'xlarge' }} font={{ size: 'medium' }} color={Color.BLACK}>
          {getString('secrets.createSSHCredWizard.btnVerifyConnection')}
        </Text>
        <VerifyConnection identifier={data?.identifier as string} closeModal={hideModal} />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    [data]
  )

  const open = useCallback(
    (_data?: SecretDTOV2) => {
      setData(_data)
      showModal()
    },
    [showModal]
  )

  return {
    openVerifyModal: (sshData?: SecretDTOV2) => open(sshData),
    closeVerifyModal: hideModal
  }
}
