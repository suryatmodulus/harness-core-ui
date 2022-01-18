/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { pick } from 'lodash-es'

import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import type { FlagConfigurationStepData } from './types'

import css from './FlagConfiguration.module.scss'

export interface FlagConfigurationStepVariablesViewProps {
  metadataMap: Record<string, VariableResponseMapValue>
  variablesData: FlagConfigurationStepData
  originalData: FlagConfigurationStepData
}

export function FlagConfigurationStepVariablesView(props: FlagConfigurationStepVariablesViewProps): React.ReactElement {
  const {
    variablesData = {} as FlagConfigurationStepData,
    originalData = {} as FlagConfigurationStepData,
    metadataMap
  } = props

  const data: Record<string, string> = pick(variablesData.spec, ['feature', 'environment']) as unknown as Record<
    string,
    string
  >

  if (Array.isArray(variablesData.spec?.instructions)) {
    variablesData.spec.instructions.forEach((row, i) => {
      data[`instructions[${i}].value`] = row.type as string // TODO: Correct this
    })
  }

  return (
    <VariablesListTable
      className={css.variablesList}
      metadataMap={metadataMap}
      data={data}
      originalData={originalData?.spec as unknown as Record<string, string>} // TODO: Correct this
    />
  )
}
