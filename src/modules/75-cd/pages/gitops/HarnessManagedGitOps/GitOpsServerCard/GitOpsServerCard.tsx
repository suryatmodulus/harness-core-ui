import React, { useState } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { Button, Card, Layout, Text, Popover, Color, ButtonVariation, Container, Icon } from '@wings-software/uicore'
import { Menu, Classes, Position } from '@blueprintjs/core'
import { useConfirmationDialog } from '@common/exports'
import type { GitopsProviderResponse } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { TagsPopover } from '@common/components'
import harnessLogo from '@cd/icons/harness-logo.png'

import css from './GitOpsServerCard.module.scss'

interface ProviderCardProps {
  provider: GitopsProviderResponse
  onDelete?: (provider: GitopsProviderResponse) => Promise<void>
  onEdit?: () => Promise<void>
}

const ProviderCard: React.FC<ProviderCardProps> = props => {
  const { provider, onDelete, onEdit } = props
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    onEdit && onEdit()
  }
  const handleViewApplications = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    // Need to implement the functionality onces product provides information
    e.stopPropagation()
    setMenuOpen(false)
  }

  const getConfirmationDialogContent = (): JSX.Element => {
    return (
      <div className={'connectorDeleteDialog'}>
        <Text margin={{ bottom: 'medium' }} className={css.confirmText} title={provider.name}>
          {`${getString('cd.confirmGitOpsServerDelete')} ${provider.name}?`}
        </Text>
      </div>
    )
  }

  const { openDialog } = useConfirmationDialog({
    contentText: getConfirmationDialogContent(),
    titleText: getString('cd.confirmGitOpsServerDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        onDelete && onDelete(provider)
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!provider.identifier) {
      return
    }
    openDialog()
  }

  return (
    <Card className={css.card}>
      <Container className={css.projectInfo}>
        <div className={css.mainTitle}>
          <img className={css.argoLogo} src={harnessLogo} alt="" aria-hidden />

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
                variation={ButtonVariation.ICON}
                className={css.iconMore}
                icon="more"
                color="grey-450"
                withoutCurrentColor
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(true)
                }}
              />
              <Menu style={{ minWidth: 'unset' }}>
                <Menu.Item icon="edit" text="Edit" onClick={handleEdit} />
                <Menu.Item icon="eye-open" text="View Applications" onClick={handleViewApplications} />
                <Menu.Item icon="trash" text="Delete" onClick={handleDelete} />
              </Menu>
            </Popover>
          </Layout.Horizontal>
        </div>

        <Text
          lineClamp={1}
          font={{ weight: 'bold' }}
          margin={{ top: 'small' }}
          color={Color.GREY_800}
          data-testid={provider.identifier}
        >
          {provider.name}
        </Text>
        <Text lineClamp={1} font="small" color={Color.GREY_600} margin={{ top: 'xsmall' }}>
          {getString('idLabel', { id: provider.identifier })}
        </Text>

        {!!provider.description?.length && (
          <Text
            font="small"
            lineClamp={2}
            color={Color.GREY_600}
            className={css.description}
            margin={{ top: 'xsmall' }}
          >
            {provider.description}
          </Text>
        )}

        {!isEmpty(provider.tags) && (
          <div className={css.tags}>
            <TagsPopover
              className={css.tagsPopover}
              iconProps={{ size: 14, color: Color.GREY_600 }}
              tags={defaultTo(provider.tags, {})}
            />
          </div>
        )}

        <div className={css.applications}>Applications: 5</div>

        <div className={css.gitOpsServerStatusContainer}>
          <div className={css.serverStatusContainer}>
            <div className={css.gitOpsServerStatus}>
              <Icon name="main-more" intent="success" className={css.statusIcon} /> RUNNING
            </div>
          </div>
        </div>
      </Container>
    </Card>
  )
}

export default ProviderCard
