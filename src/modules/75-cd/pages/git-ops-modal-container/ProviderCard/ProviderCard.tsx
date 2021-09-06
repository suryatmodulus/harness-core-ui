import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useModalHook, Button, Card, Layout, Text, Popover, Color } from '@wings-software/uicore'
import { Menu, Classes, Position, Dialog } from '@blueprintjs/core'
import { useConfirmationDialog, useToaster } from '@common/exports'
import { useDeleteConnector } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import argoLogo from '../images/argo-logo.svg'
import harnessLogo from '../images/harness-logo.png'
import css from './ProviderCard.module.scss'

interface ProviderCardProps {
  provider: any
  onDelete?: () => Promise<void>
  onEdit?: () => Promise<void>
}

const ProviderCard: React.FC<ProviderCardProps> = props => {
  const { provider, onDelete, onEdit } = props
  const { projectIdentifier, orgIdentifier, accountId } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const logo = provider.type === 'ArgoConnector' ? argoLogo : harnessLogo
  const [menuOpen, setMenuOpen] = useState(false)

  const { mutate: deleteConnector } = useDeleteConnector({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    onEdit && onEdit()
  }

  const getConfirmationDialogContent = (): JSX.Element => {
    return (
      <div className={'connectorDeleteDialog'}>
        <Text margin={{ bottom: 'medium' }} className={css.confirmText} title={provider.connector?.name}>
          {`${getString('connectors.confirmDelete')} ${provider.name}?`}
        </Text>
      </div>
    )
  }

  const { openDialog } = useConfirmationDialog({
    contentText: getConfirmationDialogContent(),
    titleText: getString('connectors.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteConnector(provider?.identifier || '', {
            headers: { 'content-type': 'application/json' }
          })

          if (deleted) {
            onDelete && onDelete()
            showSuccess(`Connector ${provider?.name} deleted`)
          }
        } catch (err) {
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!provider.identifier) return
    openDialog()
  }

  const [openUploadCertiModal, closeUploadCertiModal] = useModalHook(() => {
    return (
      <Dialog
        onClose={closeUploadCertiModal}
        isOpen={true}
        style={{
          width: '100%',
          padding: '40px',
          position: 'relative',
          height: '100vh',
          background: 'none',
          margin: '0px'
        }}
        enforceFocus={false}
      >
        <div style={{}} className={css.frameContainer}>
          <div className={css.frameHeader}>
            <img className={css.argoLogo} src={logo} alt="" aria-hidden />
            {provider.name} - {provider?.spec?.adapterUrl}
            <Button
              minimal
              icon="cross"
              className={css.closeIcon}
              iconProps={{ size: 18 }}
              onClick={closeUploadCertiModal}
              data-testid={'close-certi-upload-modal'}
            />
          </div>
          <iframe
            id="argoCD"
            className={css.argoFrame}
            width="100%"
            frameBorder="0"
            name="argoCD"
            title="argoCD"
            src={provider?.spec?.adapterUrl}
          ></iframe>
        </div>
      </Dialog>
    )
  })

  return (
    <Card className={css.card} interactive onClick={() => openUploadCertiModal()}>
      <div className={css.mainTitle}>
        <img className={css.argoLogo} src={logo} alt="" aria-hidden />

        <Layout.Horizontal className={css.layout}>
          <Popover
            isOpen={menuOpen}
            onInteraction={nextOpenState => {
              setMenuOpen(nextOpenState)
            }}
            className={Classes.DARK}
            position={Position.RIGHT_TOP}
          >
            <Button
              minimal
              icon="Options"
              onClick={e => {
                e.stopPropagation()
                setMenuOpen(true)
              }}
            />
            <Menu style={{ minWidth: 'unset' }}>
              <Menu.Item icon="edit" text="Edit" onClick={handleEdit} />
              <Menu.Item icon="trash" text="Delete" onClick={handleDelete} />
            </Menu>
          </Popover>
        </Layout.Horizontal>
      </div>

      <Text font="medium" lineClamp={1} color={Color.BLACK} className={css.projectName}>
        {provider.name}
      </Text>

      <div className={css.id}> ID: {provider.identifier} </div>

      <Text font="small" lineClamp={2} color={Color.GREY_600} className={css.description}>
        {provider.description}
      </Text>

      {provider.tags && (
        <Layout.Horizontal padding={{ top: 'small' }}>
          <TagsRenderer tags={provider.tags || /* istanbul ignore next */ {}} length={2} />
        </Layout.Horizontal>
      )}

      <div className={css.urls}>
        <div className={css.serverUrl}>
          <a> Adapter URL: {provider?.spec?.adapterUrl} </a>
        </div>
      </div>
    </Card>
  )
}

export default ProviderCard
