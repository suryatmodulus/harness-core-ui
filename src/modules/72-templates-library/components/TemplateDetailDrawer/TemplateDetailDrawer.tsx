import React from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { TemplateDetails, TemplateDetailsProps } from '../TemplateDetails/TemplateDetails'
import css from './TemplateDetailDrawer.module.scss'

export interface TemplateDetailsDrawerProps extends TemplateDetailsProps {
  onClose: () => void
}

export const TemplateDetailsDrawer: React.FC<TemplateDetailsDrawerProps> = props => {
  const { onClose, ...rest } = props
  const { templateIdentifier } = rest
  const { isGitSyncEnabled } = useAppStore()

  const getTemplateDetails: React.ReactElement = React.useMemo(
    () => (templateIdentifier ? <TemplateDetails {...rest} /> : <></>),
    [rest]
  )

  return (
    <Drawer
      onClose={onClose}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={600}
      isOpen={!!templateIdentifier}
      position={Position.RIGHT}
    >
      <Button minimal className={css.almostFullScreenCloseBtn} icon="cross" withoutBoxShadow onClick={onClose} />
      {templateIdentifier && (
        <>{isGitSyncEnabled ? <GitSyncStoreProvider>{getTemplateDetails}</GitSyncStoreProvider> : getTemplateDetails}</>
      )}
    </Drawer>
  )
}
