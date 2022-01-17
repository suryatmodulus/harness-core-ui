/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Button, ButtonVariation, Layout, PageSpinner, useModalHook } from '@wings-software/uicore'

import type { InputSetSelectorProps, InputSetValue } from '@pipeline/components/InputSetSelector/InputSetSelector'
import type { ExecutionPathProps, GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useGetInputsetYaml } from 'services/pipeline-ng'
import { RunPipelineForm } from './RunPipelineForm'
import css from './RunPipelineForm.module.scss'

export interface RunPipelineModalParams {
  pipelineIdentifier: string
  executionId?: string
  inputSetSelected?: InputSetSelectorProps['value']
  stagesExecuted?: string[]
}

export interface UseRunPipelineModalReturn {
  openRunPipelineModal: () => void
  closeRunPipelineModal: () => void
}

export const useRunPipelineModal = (
  runPipelineModaParams: RunPipelineModalParams & GitQueryParams
): UseRunPipelineModalReturn => {
  const { inputSetSelected, pipelineIdentifier, branch, repoIdentifier, executionId, stagesExecuted } =
    runPipelineModaParams
  const { projectIdentifier, orgIdentifier, accountId, module, executionIdentifier } =
    useParams<PipelineType<ExecutionPathProps>>()

  const planExecutionId: string | undefined = executionIdentifier ?? executionId

  const [inputSetYaml, setInputSetYaml] = useState('')

  const {
    data: runPipelineInputsetData,
    loading,
    refetch: fetchExecutionData
  } = useGetInputsetYaml({
    planExecutionId: planExecutionId ?? '',
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    },
    lazy: true
  })

  useEffect(() => {
    if (runPipelineInputsetData) {
      ;(runPipelineInputsetData as unknown as Response).text().then(str => {
        setInputSetYaml(str)
      })
    }
  }, [runPipelineInputsetData])

  const getInputSetSelected = (): InputSetValue[] => {
    if (inputSetSelected) {
      return [
        {
          type: inputSetSelected[0].type,
          value: inputSetSelected[0].value ?? '',
          label: inputSetSelected[0].label ?? '',
          gitDetails: {
            repoIdentifier: inputSetSelected[0].gitDetails?.repoIdentifier,
            branch: inputSetSelected[0].gitDetails?.branch
          }
        }
      ]
    }
    return []
  }

  const runModalProps: IDialogProps = {
    isOpen: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: false,
    enforceFocus: false,
    className: css.runPipelineDialog,
    style: { width: 872, height: 'fit-content', overflow: 'auto' },
    isCloseButtonShown: false
  }

  const [showRunPipelineModal, hideRunPipelineModal] = useModalHook(
    () =>
      loading ? (
        <PageSpinner />
      ) : (
        <Dialog {...runModalProps}>
          <Layout.Vertical className={css.modalContent}>
            <RunPipelineForm
              pipelineIdentifier={pipelineIdentifier}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
              accountId={accountId}
              module={module}
              inputSetYAML={inputSetYaml || ''}
              repoIdentifier={repoIdentifier}
              branch={branch}
              inputSetSelected={getInputSetSelected()}
              onClose={() => {
                hideRunPipelineModal()
              }}
              stagesExecuted={stagesExecuted}
              executionIdentifier={planExecutionId}
            />
            <Button
              aria-label="close modal"
              icon="cross"
              variation={ButtonVariation.ICON}
              onClick={() => hideRunPipelineModal()}
              className={css.crossIcon}
            />
          </Layout.Vertical>
        </Dialog>
      ),
    [
      loading,
      inputSetYaml,
      branch,
      repoIdentifier,
      pipelineIdentifier,
      inputSetSelected,
      stagesExecuted,
      planExecutionId
    ]
  )

  const open = useCallback(() => {
    if (planExecutionId) {
      fetchExecutionData()
    }
    showRunPipelineModal()
  }, [showRunPipelineModal])

  return {
    openRunPipelineModal: () => open(),
    closeRunPipelineModal: hideRunPipelineModal
  }
}
