import React from 'react'
import { Select as BPSelect, ItemRenderer, ItemListRenderer } from '@blueprintjs/select'
import { Button, Menu } from '@blueprintjs/core'

import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { String, StringKeys } from 'framework/strings'

import css from './StatusSelect.module.scss'

type AllowedStatus = Exclude<
  ExecutionStatus,
  | 'NotStarted'
  | 'Queued'
  | 'Skipped'
  | 'Pausing'
  | 'Suspended'
  | 'AsyncWaiting'
  | 'TaskWaiting'
  | 'TimedWaiting'
  | 'Errored'
  | 'IgnoreFailed'
  | 'Discontinuing'
>
const Select = BPSelect.ofType<AllowedStatus>()
const allowedOptions = [
  ExecutionStatusEnum.Aborted,
  ExecutionStatusEnum.Expired,
  ExecutionStatusEnum.Failed,
  ExecutionStatusEnum.Running,
  ExecutionStatusEnum.Success,
  ExecutionStatusEnum.ApprovalRejected,
  ExecutionStatusEnum.Paused,
  ExecutionStatusEnum.ApprovalWaiting,
  ExecutionStatusEnum.InterventionWaiting,
  ExecutionStatusEnum.ResourceWaiting
] as AllowedStatus[]

const labelMap: Record<AllowedStatus, StringKeys> = {
  Aborted: 'pipeline.executionFilters.labels.Aborted',
  Expired: 'pipeline.executionFilters.labels.Expired',
  Failed: 'pipeline.executionFilters.labels.Failed',
  Running: 'pipeline.executionFilters.labels.Running',
  Success: 'pipeline.executionFilters.labels.Success',
  ApprovalRejected: 'pipeline.executionFilters.labels.ApprovalRejected',
  Paused: 'pipeline.executionFilters.labels.Paused',
  ApprovalWaiting: 'pipeline.executionFilters.labels.ApprovalWaiting',
  InterventionWaiting: 'pipeline.executionFilters.labels.InterventionWaiting',
  ResourceWaiting: 'pipeline.executionFilters.labels.Waiting'
}

const itemRenderer: ItemRenderer<AllowedStatus> = (item, props) => (
  <Menu.Item
    key={item}
    text={<String stringID={labelMap[item]} />}
    active={props.modifiers.active}
    onClick={props.handleClick}
  />
)

export interface StatusSelectProps {
  value?: ExecutionStatus | null
  onSelect(status: ExecutionStatus | null): void
}

export default function StatusSelect(props: StatusSelectProps): React.ReactElement {
  function clearSelection(): void {
    props.onSelect(null)
  }

  const itemListRender: ItemListRenderer<AllowedStatus> = itemListProps => (
    <Menu>
      <React.Fragment>
        {props.value ? <Menu.Item text="Clear Selection" icon="cross" onClick={clearSelection} /> : null}
        {itemListProps.items.map((item, i) => itemListProps.renderItem(item, i))}
      </React.Fragment>
    </Menu>
  )

  return (
    <Select
      itemRenderer={itemRenderer}
      itemListRenderer={itemListRender}
      items={allowedOptions}
      onItemSelect={props.onSelect}
      activeItem={(props.value as AllowedStatus) || null}
      resetOnQuery={false}
      filterable={false}
      popoverProps={{ minimal: true, wrapperTagName: 'div', targetTagName: 'div' }}
    >
      <Button className={css.main} rightIcon="chevron-down" data-testid="status-select">
        {props.value ? props.value : <String stringID="all" />}
      </Button>
    </Select>
  )
}
