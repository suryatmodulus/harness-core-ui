import React, { useMemo } from 'react'
import { Container, Select, SelectOption, useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { NewEditEnvironmentModal } from '@common/modals/NewEditEnvironmentModal/NewEditEnvironmentModal'
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

  const [openModal, hideModal] = useModalHook(() => (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      canEscapeKeyClose
      canOutsideClickClose
      onClose={hideModal}
      isCloseButtonShown
      title={getString('newEnvironment')}
      className={'padded-dialog'}
    >
      <NewEditEnvironmentModal
        data={{
          name: '',
          description: '',
          identifier: '',
          tags: {}
        }}
        isEnvironment
        isEdit={false}
        onCreateOrUpdate={onSubmit}
        closeModal={hideModal}
      />
    </Dialog>
  ))

  const onSelectChange = (val: SelectOption) => {
    if (val.value === ADD_NEW_VALUE) {
      openModal()
    } else {
      onSelect(val)
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      <Select
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
