import React from 'react'
import { Color, Container, Icon, IconName, Layout, Popover, Text } from '@wings-software/uicore'
import { Menu, Position } from '@blueprintjs/core'
import cx from 'classnames'
import type { TemplateStepData } from '@pipeline/utils/tempates'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import { useStrings } from 'framework/strings'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import css from './TemplateBar.module.scss'

export interface TemplateBarProps {
  step: StepOrStepGroupOrTemplateStepData
  onChangeTemplate?: (step: StepOrStepGroupOrTemplateStepData) => void
  onRemoveTemplate?: () => void
}

interface TemplateMenuItem {
  icon?: IconName
  label: string
  disabled?: boolean
  onClick: () => void
}

export const TemplateBar: React.FC<TemplateBarProps> = (props): JSX.Element => {
  const { step, onChangeTemplate, onRemoveTemplate } = props
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { getString } = useStrings()
  const { enabled: templatesEnabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.TEMPLATE_SERVICE
    }
  })

  const getItems = (): TemplateMenuItem[] => {
    return [
      {
        icon: 'command-switch',
        label: getString('pipeline.changeTemplateLabel'),
        disabled: !templatesEnabled,
        onClick: () => onChangeTemplate?.(step)
      },
      {
        icon: 'main-trash',
        label: getString('pipeline.removeTemplateLabel'),
        onClick: () => onRemoveTemplate?.()
      }
    ]
  }

  return (
    <Container
      margin={'medium'}
      padding={{ top: 'small', right: 'medium', bottom: 'small', left: 'medium' }}
      background={Color.PRIMARY_6}
      className={css.container}
      border={{ radius: 4 }}
    >
      <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Icon size={11} color={Color.WHITE} name={'template-library'} />
        <Text style={{ flexGrow: 1 }} font={{ size: 'small' }} color={Color.WHITE}>
          {`Using Template: ${getTemplateNameWithLabel((step as TemplateStepData)?.template)}`}
        </Text>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          position={Position.BOTTOM_RIGHT}
          className={css.main}
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
