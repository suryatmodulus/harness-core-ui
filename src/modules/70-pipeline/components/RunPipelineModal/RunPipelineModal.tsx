import React from 'react'
import { Layout } from '@wings-software/uicore'

import { useHistory, useParams } from 'react-router-dom'
import type { SelectOption } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'

import { RunPipelineForm } from '@pipeline/components/RunPipelineModal/RunPipelineForm'
import { InputSetSummaryResponse, useGetInputsetYaml } from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import { PageSpinner } from '@common/components'
import css from './RunPipelineModal.module.scss'

interface InputSetValue extends SelectOption {
  type: InputSetSummaryResponse['inputSetType']
}

const runModalProps: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  title: '',
  className: css.runModal,
  style: { width: 872, height: 'fit-content', overflow: 'auto' }
}

export function RunPipelineModal(): React.ReactElement {
  const { projectIdentifier, orgIdentifier, pipelineIdentifier, accountId, module } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()
  const query = useQueryParams<Record<string, string>>()
  const history = useHistory()

  const { data, refetch, loading } = useGetInputsetYaml({
    planExecutionId: query.executionId,
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId
    },
    lazy: true,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  React.useEffect(() => {
    if (query.executionId && query.executionId !== null) {
      refetch()
    }
  }, [query.executionId])

  const [inputSetYaml, setInputSetYaml] = React.useState('')
  React.useEffect(() => {
    if (data) {
      ;((data as unknown) as Response).text().then(str => {
        setInputSetYaml(str)
      })
    }
  }, [data])

  const getInputSetSelected = (): InputSetValue[] => {
    if (query && query.inputSetType) {
      const inputSetSelected: InputSetValue[] = [
        {
          type: query.inputSetType as InputSetSummaryResponse['inputSetType'],
          value: query.inputSetValue,
          label: query.inputSetLabel
        }
      ]
      return inputSetSelected
    }
    return []
  }

  if (loading) {
    return <PageSpinner />
  }

  return (
    <Dialog onClose={() => history.goBack()} {...runModalProps}>
      <Layout.Vertical className={css.modalCard}>
        <RunPipelineForm
          pipelineIdentifier={pipelineIdentifier}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          accountId={accountId}
          module={module}
          inputSetYAML={inputSetYaml || ''}
          inputSetSelected={getInputSetSelected()}
        />
      </Layout.Vertical>
    </Dialog>
  )
}
