/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { noop } from 'lodash-es'
import { Container, MultiSelectDropDown, MultiSelectOption, Select, SelectOption } from '@wings-software/uicore'
// eslint-disable-next-line no-restricted-imports
//import _ from 'lodash'

import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { useHarnessEnvironmentModal } from '@common/modals/HarnessEnvironmentModal/HarnessEnvironmentModal'
import { useStrings } from 'framework/strings'

export interface EnvironmentSelectOrCreateProps {
  item?: SelectOption | MultiSelectOption[]
  options: Array<SelectOption | MultiSelectOption>
  onSelect(value: SelectOption | MultiSelectOption[]): void
  disabled?: boolean
  className?: string
  monitoredServiceType?: string
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
  monitoredServiceType,
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

  const onSelectChange = (val: SelectOption | MultiSelectOption[]): void => {
    if (Array.isArray(val) ? val.find(it => it.value === ADD_NEW_VALUE) : val.value === ADD_NEW_VALUE) {
      openHarnessEnvironmentModal()
    } else {
      onSelect(val)
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      {monitoredServiceType && monitoredServiceType === 'Infrastructure' ? (
        <MultiSelectDropDown
          placeholder={getString('cv.selectOrCreateEnv')}
          value={item as MultiSelectOption[]}
          items={selectOptions}
          className={className}
          disabled={disabled}
          onChange={onSelectChange}
          buttonTestId={'sourceFilter'}
        />
      ) : (
        <Select
          name={'environment'}
          value={item as SelectOption}
          className={className}
          disabled={disabled}
          items={selectOptions}
          inputProps={{ placeholder: getString('cv.selectOrCreateEnv') }}
          onChange={onSelectChange}
        />
      )}
    </Container>
  )
}
