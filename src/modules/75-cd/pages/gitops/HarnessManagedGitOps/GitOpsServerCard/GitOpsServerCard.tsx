import React, { useState } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import {
  Button,
  Card,
  Layout,
  Text,
  Popover,
  Color,
  ButtonVariation,
  Container,
  ButtonSize
} from '@wings-software/uicore'
import { Menu, Classes, Position } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import { useConfirmationDialog } from '@common/exports'
import type { V1Agent } from 'services/gitops'
import { useStrings } from 'framework/strings'
import { TagsPopover } from '@common/components'
import harnessLogo from '@cd/icons/harness-logo.png'

import type {
  PipelinePathProps,
  ConnectorPathProps,
  SecretsPathProps,
  UserPathProps,
  UserGroupPathProps,
  ResourceGroupPathProps,
  RolePathProps
} from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import css from './GitOpsServerCard.module.scss'

interface ProviderCardProps {
  provider: V1Agent
  onDelete?: (provider: V1Agent) => Promise<void>
  onEdit?: () => Promise<void>
}

const ProviderCard: React.FC<ProviderCardProps> = props => {
  const { provider, onDelete } = props
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)
  const history = useHistory()
  const params = useParams<
    PipelinePathProps &
      ConnectorPathProps &
      SecretsPathProps &
      UserPathProps &
      UserGroupPathProps &
      ResourceGroupPathProps &
      RolePathProps
  >()

  const gotoOverview = (): void =>
    history.push(
      routes.toGitOpsOverView({
        ...params,
        module: 'cd',
        agentId: provider.identifier as string
      })
    )

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
    <Card className={css.card} onClick={gotoOverview}>
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
                <Menu.Item icon="eye-open" text="Details" onClick={gotoOverview} />
                <Menu.Item icon="trash" text="Delete" onClick={handleDelete} />
              </Menu>
            </Popover>
          </Layout.Horizontal>
        </div>

        <Text
          lineClamp={2}
          margin={{ top: 'medium', bottom: 'small' }}
          color={Color.GREY_800}
          data-testid={provider.identifier}
          style={{
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '32px',
            wordBreak: 'break-word'
          }}
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
            margin={{ top: 'xsmall', bottom: 'xsmall' }}
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

        <div className={css.applications}>
          Applications: <b> 5 </b>
        </div>

        <div className={css.gitOpsStatusContainer}>
          <div className={css.connectionStatus}>
            <Text font="small"> Connection Status</Text>

            <Button
              icon="command-artifact-check"
              variation={ButtonVariation.PRIMARY}
              text="CONNECTED"
              intent="success"
              size={ButtonSize.SMALL}
              className={css.statusText}
            />
          </div>
          <div className={css.healthStatus}>
            <Text font="small"> Health Status </Text>

            <Button
              icon="command-artifact-check"
              variation={ButtonVariation.PRIMARY}
              text="HEALTHY"
              size={ButtonSize.SMALL}
              intent="success"
              style={{
                color: '#1B841D !important',
                backgroundColor: '#D8F3D4 !important'
              }}
              className={css.statusText}
            />
          </div>
        </div>
      </Container>
    </Card>
  )
}

export default ProviderCard
