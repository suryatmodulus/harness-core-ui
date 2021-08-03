import React, { useMemo } from 'react'
import { Container, Select, SelectOption, useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import type { ServiceResponseDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import NewServiceForm from './components/NewServiceForm'

export interface ServiceSelectOrCreateProps {
  item?: SelectOption
  options: Array<SelectOption>
  onSelect(value: SelectOption): void
  className?: string
  onNewCreated(value: ServiceResponseDTO): void
  disabled?: boolean
}

const ADD_NEW_VALUE = '@@add_new'

export function generateOptions(response?: ServiceResponseDTO[]): SelectOption[] {
  return response
    ? (response
        .filter(entity => entity && entity.identifier && entity.name)
        .map(entity => ({ value: entity.identifier, label: entity.name })) as SelectOption[])
    : []
}

export const ServiceSelectOrCreate: React.FC<ServiceSelectOrCreateProps> = props => {
  const { getString } = useStrings()

  const selectOptions = useMemo(
    () => [
      {
        label: '+ Add New',
        value: ADD_NEW_VALUE
      },
      ...props.options
    ],
    [props.options]
  )

  const [openModal, hideModal] = useModalHook(() => (
    <Dialog
      isOpen
      usePortal
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      enforceFocus={false}
      onClose={hideModal}
      style={{ width: 600, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }}
    >
      <NewServiceForm onSubmit={props.onNewCreated} onClose={hideModal} />
    </Dialog>
  ))

  const onSelectChange = (val: SelectOption) => {
    if (val.value === ADD_NEW_VALUE) {
      openModal()
    } else {
      props.onSelect(val)
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      <Select
        value={props.item}
        className={props.className}
        disabled={props.disabled}
        items={selectOptions}
        inputProps={{ placeholder: getString('cv.selectCreateService') }}
        onChange={onSelectChange}
      />
    </Container>
  )
}
