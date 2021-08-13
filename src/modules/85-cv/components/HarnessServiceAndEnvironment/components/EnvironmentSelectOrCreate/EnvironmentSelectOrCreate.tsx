import React, { useMemo } from 'react'
import { noop } from 'lodash-es'
import { Container, Select, SelectOption } from '@wings-software/uicore'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { useHarnessEnvironmentModal } from '@common/modals/HarnessEnvironmentModal/HarnessEnvironmentModal'
import { useStrings } from 'framework/strings'

export interface EnvironmentSelectOrCreateProps {
  item?: SelectOption
  options: Array<SelectOption>
  onSelect(value: SelectOption): void
  disabled?: boolean
  className?: string
  onNewCreated(value: EnvironmentResponseDTO): void
}

export const EnvironmentTypes = [
  {
    label: 'Production',
    value: 'Production'
  },
  {
    label: 'PreProduction',
    value: 'PreProduction'
  }
]

const ADD_NEW_VALUE = '@@add_new'

export function generateOptions(response?: EnvironmentResponseDTO[]): SelectOption[] {
  return response
    ? (response
        .filter(entity => entity && entity.identifier && entity.name)
        .map(entity => ({ value: entity.identifier, label: entity.name })) as SelectOption[])
    : []
}

export function EnvironmentSelectOrCreate({
  item,
  options,
  onSelect,
  disabled,
  onNewCreated,
  className
}: EnvironmentSelectOrCreateProps): JSX.Element {
  const { getString } = useStrings()
  const selectOptions = useMemo(
    () => [
      {
        label: '+ Add New',
        value: ADD_NEW_VALUE
      },
      ...options
    ],
    [options]
  )

  const onSubmit = async (values: any): Promise<void> => {
    onNewCreated(values)
  }

  const { openHarnessEnvironmentModal } = useHarnessEnvironmentModal({
    data: {
      name: '',
      description: '',
      identifier: '',
      tags: {}
    },
    isEnvironment: true,
    isEdit: false,
    onClose: noop,
    modalTitle: getString('newEnvironment'),
    onCreateOrUpdate: onSubmit
  })

  const onSelectChange = (val: SelectOption): void => {
    if (val.value === ADD_NEW_VALUE) {
      openHarnessEnvironmentModal()
    } else {
      onSelect(val)
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      <Select
        name={'environment'}
        value={item}
        className={className}
        disabled={disabled}
        items={selectOptions}
        inputProps={{ placeholder: getString('cv.selectOrCreateEnv') }}
        onChange={onSelectChange}
      />
    </Container>
  )
}
