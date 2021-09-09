import React, { useState } from 'react'
import { Drawer, Intent, Position } from '@blueprintjs/core'
import { Button, useModalHook } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useConfirmationDialog } from '@common/exports'
import { drawerOffSetLeft } from './useDrawerHook.constant'
import type { UseDrawerInterface, UseDrawerPropsInterface } from './useDrawerHook.types'
import css from './useDrawerHook.module.scss'

export const useDrawer = ({ createHeader, createDrawerContent }: UseDrawerPropsInterface): UseDrawerInterface => {
  const { getString } = useStrings()
  const [drawerContentProps, setDrawerContentProps] = useState({})
  const [showModal, hideModal] = useModalHook(
    () => (
      <>
        <Drawer
          onClose={showWarning}
          usePortal={true}
          autoFocus={true}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          enforceFocus={false}
          hasBackdrop={true}
          size={`calc(100% - ${drawerOffSetLeft})`}
          isOpen
          position={Position.RIGHT}
          title={createHeader()}
          isCloseButtonShown={false}
          portalClassName={'health-source-right-drawer'}
        >
          <div className={css.formFullheight}>{createDrawerContent(drawerContentProps)}</div>
        </Drawer>
        <Button minimal className={css.almostFullScreenCloseBtn} icon="cross" withoutBoxShadow onClick={hideModal} />
      </>
    ),
    [drawerContentProps]
  )

  const { openDialog: showWarning } = useConfirmationDialog({
    intent: Intent.WARNING,
    contentText: getString('common.unsavedChanges'),
    titleText: getString('common.confirmText'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: (isConfirmed: boolean) => isConfirmed && hideModal()
  })

  return {
    showDrawer: showModal,
    hideDrawer: hideModal,
    setDrawerContentProps
  }
}
