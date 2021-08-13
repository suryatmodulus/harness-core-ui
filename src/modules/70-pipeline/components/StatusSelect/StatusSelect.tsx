import React from 'react'
import { DropDown } from '@wings-software/uicore'
import type { SelectOption } from '@wings-software/uicore'
import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { StringKeys, useStrings } from 'framework/strings'

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

export interface StatusSelectProps {
  value?: ExecutionStatus | null
  onSelect(status: ExecutionStatus | null): void
}

export default function StatusSelect(props: StatusSelectProps): React.ReactElement {
  const { value, onSelect } = props
  const { getString } = useStrings()

  const getAllowedOptions = React.useMemo(
    () =>
      allowedOptions.map(item => ({
        label: getString(labelMap[item]),
        value: item
      })) as SelectOption[],
    [allowedOptions, labelMap]
  )

  return (
    <DropDown
      buttonTestId="status-select"
      value={value}
      onChange={option => {
        onSelect((option.value as ExecutionStatus) || null)
      }}
      items={getAllowedOptions}
      usePortal={true}
      filterable={false}
      placeholder={getString('status')}
    />
  )
}
