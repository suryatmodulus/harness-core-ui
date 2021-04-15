import React from 'react'
import { Select as BPSelect, ISelectProps, IItemRendererProps } from '@blueprintjs/select'
import { Button, IconName, Icon } from '@wings-software/uicore'
import { Menu } from '@blueprintjs/core'
import cx from 'classnames'

import { String } from 'framework/exports'
import type { StageSelectOption } from '@pipeline/components/PipelineStudio/CommonUtils/CommonUtils'
import { getIconFromStageModule } from '@pipeline/utils/executionUtils'
import css from './StageSelection.module.scss'

const Select = BPSelect.ofType<StageSelectOption>()

export type { StageSelectOption }

export interface StageSelectionProps
  extends Omit<ISelectProps<StageSelectOption>, 'itemRenderer' | 'items' | 'onItemSelect'> {
  selectedStageId?: string
  selectOptions: StageSelectOption[]
  onStageChange(item: StageSelectOption): void
  chevronIcon?: IconName
}

export function StageSelection(props: StageSelectionProps): React.ReactElement {
  const { selectOptions, onStageChange, selectedStageId, chevronIcon = 'chevron-down', className, ...rest } = props
  const selectedStage = selectOptions.find(({ value }) => value === selectedStageId)

  return (
    <Select
      className={cx(css.select, className)}
      itemRenderer={(
        item: StageSelectOption,
        { modifiers: { disabled }, handleClick }: IItemRendererProps
      ): React.ReactElement => {
        return (
          <Menu.Item
            key={item.value as string}
            className={css.menuItem}
            active={item.value === selectedStageId}
            onClick={handleClick}
            disabled={disabled}
            text={
              <React.Fragment>
                <Icon
                  className={css.icon}
                  name={getIconFromStageModule(item.type.toLowerCase(), item.node?.nodeType)}
                />
                <span>{item.label}</span>
              </React.Fragment>
            }
          />
        )
      }}
      items={selectOptions}
      onItemSelect={onStageChange}
      filterable={false}
      itemsEqual={(a, b) => a.value === b.value}
      {...rest}
      popoverProps={{ minimal: true, wrapperTagName: 'div', targetTagName: 'div', ...rest.popoverProps }}
    >
      <Button className={css.btn} rightIcon={chevronIcon} iconProps={{ className: css.icon }}>
        {selectedStage ? (
          <React.Fragment>
            <Icon
              className={css.icon}
              name={getIconFromStageModule(selectedStage.type.toLowerCase(), selectedStage.node.nodeType)}
            />
            <span>{selectedStage.label}</span>
          </React.Fragment>
        ) : (
          <String stringID="selectStage" />
        )}
      </Button>
    </Select>
  )
}
