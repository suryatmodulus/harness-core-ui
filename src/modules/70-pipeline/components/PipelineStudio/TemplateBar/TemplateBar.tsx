import React from 'react'
import { Color, Container, Icon, IconName, Layout, Popover, Text, useConfirmationDialog } from '@wings-software/uicore'
import { Intent, Menu, Position } from '@blueprintjs/core'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetTemplate } from 'services/template-ng'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { TemplateLinkConfig } from 'services/pipeline-ng'
import css from './TemplateBar.module.scss'

interface TemplateMenuItem {
  icon?: IconName
  label: string
  disabled?: boolean
  onClick: () => void
}

export interface TemplateBarProps {
  templateLinkConfig: TemplateLinkConfig
  onOpenTemplateSelector: () => void
  onRemoveTemplate: () => Promise<void>
  className?: string
}

export const TemplateBar = (props: TemplateBarProps): JSX.Element => {
  const { templateLinkConfig, onOpenTemplateSelector, onRemoveTemplate, className = '' } = props
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const scope = getScopeFromValue(templateLinkConfig.templateRef)
  const { enabled: templatesEnabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.TEMPLATE_SERVICE
    }
  })

  const { data } = useGetTemplate({
    templateIdentifier: getIdentifierFromValue(templateLinkConfig.templateRef),
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined,
      versionLabel: defaultTo(templateLinkConfig.versionLabel, '')
    }
  })

  const { openDialog: openRemoveTemplateDialog } = useConfirmationDialog({
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    cancelButtonText: getString('cancel'),
    contentText: getString('pipeline.removeTemplate'),
    titleText: `${getString('common.remove')} ${getTemplateNameWithLabel(data?.data)}?`,
    confirmButtonText: getString('common.remove'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        await onRemoveTemplate()
      }
    }
  })

  const getItems = (): TemplateMenuItem[] => {
    return [
      {
        icon: 'command-switch',
        label: getString('pipeline.changeTemplateLabel'),
        disabled: !templatesEnabled,
        onClick: onOpenTemplateSelector
      },
      {
        icon: 'main-trash',
        label: getString('pipeline.removeTemplateLabel'),
        onClick: openRemoveTemplateDialog
      }
    ]
  }

  return (
    <Container
      margin={'medium'}
      padding={{ top: 'small', right: 'medium', bottom: 'small', left: 'medium' }}
      background={Color.PRIMARY_6}
      border={{ radius: 4 }}
      className={cx(css.container, className)}
    >
      <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Icon size={11} color={Color.WHITE} name={'template-library'} />
        <Text style={{ flexGrow: 1 }} font={{ size: 'small' }} color={Color.WHITE}>
          {data?.data ? `Using Template: ${getTemplateNameWithLabel(data?.data)}` : getString('loading')}
        </Text>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          position={Position.BOTTOM_RIGHT}
          className={css.main}
          disabled={!data?.data}
          portalClassName={css.popover}
        >
          <Icon
            name={'more'}
            color={Color.WHITE}
            className={css.actionButton}
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(true)
            }}
          />
          <Menu style={{ minWidth: 'unset' }} onClick={e => e.stopPropagation()}>
            {getItems()?.map(item => {
              return (
                <li
                  key={item.label}
                  className={cx(css.menuItem, { [css.disabled]: item.disabled })}
                  onClick={e => {
                    e.stopPropagation()
                    if (!item.disabled) {
                      item.onClick()
                      setMenuOpen(false)
                    }
                  }}
                >
                  {item.icon && <Icon name={item.icon} size={12} />}
                  <Text lineClamp={1}>{item.label}</Text>
                </li>
              )
            })}
          </Menu>
        </Popover>
      </Layout.Horizontal>
    </Container>
  )
}
