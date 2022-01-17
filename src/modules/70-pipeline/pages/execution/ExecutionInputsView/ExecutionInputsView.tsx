/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useGetInputsetYamlV2 } from 'services/pipeline-ng'
import { PageSpinner } from '@common/components'
import { RunPipelineForm } from '@pipeline/components/RunPipelineModal/RunPipelineForm'
import type { ResponseJsonNode } from 'services/cd-ng'

import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import css from './ExecutionInputsView.module.scss'

interface ExecutionInputsViewInterface {
  mockData?: ResponseJsonNode
}

export default function ExecutionInputsView(props: ExecutionInputsViewInterface): React.ReactElement {
  const { projectIdentifier, orgIdentifier, pipelineIdentifier, accountId, module, executionIdentifier } =
    useParams<PipelineType<ExecutionPathProps>>()

  const { pipelineExecutionDetail } = useExecutionContext()

  const { data, loading } = useGetInputsetYamlV2({
    planExecutionId: executionIdentifier,
    queryParams: {
      orgIdentifier,
      resolveExpressions: true,
      projectIdentifier,
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const [inputSetYaml, setInputSetYaml] = useState('')
  const [inputSetTemplateYaml, setInputSetTemplateYaml] = useState('')
  useEffect(() => {
    // Won't actually render out RunPipelineForm
    /* istanbul ignore else */ if (data?.data?.inputSetYaml) {
      setInputSetYaml(data.data?.inputSetYaml)
    }
    /* istanbul ignore else */ if (data?.data?.inputSetTemplateYaml) {
      setInputSetTemplateYaml(data.data.inputSetTemplateYaml)
    }
  }, [data])

  if (loading) {
    return <PageSpinner />
  }

  return (
    <div className={css.main}>
      <RunPipelineForm
        pipelineIdentifier={pipelineIdentifier}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        accountId={accountId}
        module={module}
        inputSetYAML={inputSetYaml || ''}
        executionView
        branch={pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.branch}
        repoIdentifier={pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoIdentifier}
        mockData={props.mockData}
        executionInputSetTemplateYaml={inputSetTemplateYaml}
      />
    </div>
  )
}
