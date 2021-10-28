import React from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import type { Module } from '@common/interfaces/RouteInterfaces'
import type { EntityGitDetails } from 'services/template-ng'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { TemplateDetails } from '../TemplateDetails/TemplateDetails'
import css from './TemplateDetailDrawer.module.scss'

export interface TemplateDetailsProps {
  templateIdentifier?: string
  versionLabel?: string
  onClose: () => void
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  module?: Module
  gitDetails?: EntityGitDetails
}

export const TemplateDetailsDrawer: React.FC<TemplateDetailsProps> = props => {
  const { templateIdentifier, versionLabel, onClose, accountId, orgIdentifier, projectIdentifier, module, gitDetails } =
    props

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
        <GitSyncStoreProvider>
          <TemplateDetails
            templateIdentifier={templateIdentifier}
            versionLabel={versionLabel}
            onClose={onClose}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
            module={module}
            gitDetails={gitDetails}
          />
        </GitSyncStoreProvider>
      )}
    </Drawer>
  )
}
