import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, Layout } from '@wings-software/uicore'
import type { SelectOption } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { RunPipelineForm } from '@pipeline/components/RunPipelineModal/RunPipelineForm'
import { EntityGitDetails, InputSetSummaryResponse, useGetInputsetYaml } from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import { PageSpinner } from '@common/components'
import css from './RunPipelineModal.module.scss'

interface InputSetValue extends SelectOption {
  type: InputSetSummaryResponse['inputSetType']
  gitDetails?: EntityGitDetails
}

const runModalProps: IDialogProps = {
  isOpen: true,
  // usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  className: css.runModal,
  style: { width: 872, height: 'fit-content', overflow: 'auto' },
  isCloseButtonShown: false
}

export function RunPipelineModal(): React.ReactElement {
  const { projectIdentifier, orgIdentifier, pipelineIdentifier, accountId, module } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>
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
          label: query.inputSetLabel,
          gitDetails: {
            repoIdentifier: query.inputSetRepoIdentifier,
            branch: query.inputSetBranch
          }
        }
      ]
      return inputSetSelected
    }
    return []
  }

  function handleClose(): void {
    history.replace(
      routes.toPipelineStudio({
        accountId,
        projectIdentifier,
        orgIdentifier,
        module,
        pipelineIdentifier,
        repoIdentifier: query.repoIdentifier,
        branch: query.branch
      })
    )
  }

  if (loading) {
    return <PageSpinner />
  }

  return (
    <Dialog onClose={handleClose} {...runModalProps} className={css.dialog}>
      <Layout.Vertical className={css.modalCard}>
        <RunPipelineForm
          pipelineIdentifier={pipelineIdentifier}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          accountId={accountId}
          module={module}
          inputSetYAML={inputSetYaml || ''}
          inputSetSelected={getInputSetSelected()}
          repoIdentifier={query.repoIdentifier}
          branch={query.branch}
          inputSetRepoIdentifier={query.inputSetRepoIdentifier}
          inputSetBranch={query.inputSetBranch}
        />
        <Button
          aria-label="close modal"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={handleClose}
          className={css.crossIcon}
        />
      </Layout.Vertical>
    </Dialog>
  )
}
