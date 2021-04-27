import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import RestrictEmailDomainsForm from '@common/modals/RestrictEmailDomains/views/RestrictEmailDomainsForm'
import css from '@common/modals/RestrictEmailDomains/useRestrictEmailDomains.module.scss'

interface Props {
  onSuccess: () => void
  whitelistedDomains: string[]
}
interface ModalReturn {
  openRestrictEmailDomainsModal: () => void
  closeRestrictEmailDomainsModal: () => void
}

export const useRestrictEmailDomains = ({ onSuccess, whitelistedDomains }: Props): ModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen title="" onClose={hideModal} className={cx(css.dialog, Classes.DIALOG)}>
        <RestrictEmailDomainsForm
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
          onCancel={() => {
            hideModal()
          }}
          whitelistedDomains={whitelistedDomains}
        />
      </Dialog>
    ),
    [whitelistedDomains]
  )

  return {
    openRestrictEmailDomainsModal: () => showModal(),
    closeRestrictEmailDomainsModal: hideModal
  }
}
