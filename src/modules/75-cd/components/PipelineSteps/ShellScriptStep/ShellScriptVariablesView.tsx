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
import type { ShellScriptData } from './shellScriptTypes'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface ShellScriptVariablesViewProps {
  metadataMap: Record<string, VariableResponseMapValue>
  variablesData: ShellScriptData
  originalData: ShellScriptData
}

export function ShellScriptVariablesView(props: ShellScriptVariablesViewProps): React.ReactElement {
  const { variablesData = {} as ShellScriptData, originalData = {} as ShellScriptData, metadataMap } = props
  const data: Record<string, string> = pick(variablesData.spec, ['shell', 'onDelegate'])

  if (variablesData.spec?.executionTarget?.connectorRef) {
    data['executionTarget.connectorRef'] = variablesData.spec.executionTarget.connectorRef
  }

  if (variablesData.spec?.source?.spec?.script) {
    data['source.spec.script'] = variablesData.spec.source.spec.script
  }

  if (Array.isArray(variablesData.spec?.environmentVariables)) {
    variablesData.spec.environmentVariables.forEach((row, i) => {
      data[`environmentVariables[${i}].value`] = row.value as string
    })
  }

  if (Array.isArray(variablesData.spec?.outputVariables)) {
    variablesData.spec.outputVariables.forEach((row, i) => {
      data[`outputVariables[${i}].value`] = row.value as string
    })
  }

  return (
    <VariablesListTable
      className={pipelineVariableCss.variablePaddingL3}
      metadataMap={metadataMap}
      data={data}
      originalData={originalData?.spec}
    />
  )
}
