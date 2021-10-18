import React from 'react'
import { Color, Container, Icon, Layout, Popover, Text } from '@wings-software/uicore'
import { Menu, Position } from '@blueprintjs/core'
import type { TemplateStepData } from '@pipeline/utils/tempates'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import css from './TemplateBar.module.scss'

export interface TemplateBarProps {
  step: StepOrStepGroupOrTemplateStepData
  onChangeTemplate?: (step: StepOrStepGroupOrTemplateStepData) => void
  onRemoveTemplate?: () => void
}

export const TemplateBar: React.FC<TemplateBarProps> = (props): JSX.Element => {
  const { step, onChangeTemplate, onRemoveTemplate } = props
  const [menuOpen, setMenuOpen] = React.useState(false)

  const getItems = (): { label: string; onClick: () => void }[] => {
    return [
      {
        label: 'Change Template',
        onClick: () => onChangeTemplate?.(step)
      },
      {
        label: 'Remove Template',
        onClick: () => onRemoveTemplate?.()
      }
    ]
  }

  return (
    <Container
      margin={'medium'}
      padding={{ top: 'small', right: 'medium', bottom: 'small', left: 'medium' }}
      background={Color.PRIMARY_6}
      border={{ radius: 4 }}
    >
      <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Icon size={11} color={Color.WHITE} name={'template-library'} />
        <Text style={{ flexGrow: 1 }} font={{ size: 'small' }} color={Color.WHITE}>
          {`Using Template: ${(step as TemplateStepData)?.template?.templateRef} (${
            (step as TemplateStepData)?.template?.versionLabel
          })`}
        </Text>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          position={Position.BOTTOM_RIGHT}
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
                <Menu.Item
                  text={item.label}
                  key={item.label}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    item.onClick()
                    setMenuOpen(false)
                  }}
                />
              )
            })}
          </Menu>
        </Popover>
      </Layout.Horizontal>
    </Container>
  )
}
