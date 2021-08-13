import React, { useMemo } from 'react'
import { noop } from 'lodash-es'
import { Container, Select, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useHarnessServicetModal } from '@common/modals/HarnessServiceModal/HarnessServiceModal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ServiceResponseDTO, ServiceRequestDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

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
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

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

  const onSubmit = async (values: ServiceRequestDTO): Promise<void> => {
    props.onNewCreated(values)
  }

  const { openHarnessServiceModal } = useHarnessServicetModal({
    data: { name: '', identifier: '', orgIdentifier, projectIdentifier },
    isService: true,
    isEdit: false,
    onClose: noop,
    onCreateOrUpdate: onSubmit
  })

  const onSelectChange = (val: SelectOption) => {
    if (val.value === ADD_NEW_VALUE) {
      openHarnessServiceModal()
    } else {
      props.onSelect(val)
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      <Select
        name={'service'}
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
