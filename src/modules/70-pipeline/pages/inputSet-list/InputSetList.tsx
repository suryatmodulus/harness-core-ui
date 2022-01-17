/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, isEmpty, pick } from 'lodash-es'
import {
  Popover,
  Layout,
  TextInput,
  useModalHook,
  Text,
  Color,
  ButtonVariation,
  useToaster
} from '@wings-software/uicore'
import { Menu, MenuItem, Position } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import {
  InputSetSummaryResponse,
  useDeleteInputSetForPipeline,
  useGetInputSetsListForPipeline,
  useGetPipelineSummary,
  useGetTemplateFromPipeline
} from 'services/pipeline-ng'
import { OverlayInputSetForm } from '@pipeline/components/OverlayInputSetForm/OverlayInputSetForm'
import routes from '@common/RouteDefinitions'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { InputSetListView } from './InputSetListView'
import css from './InputSetList.module.scss'

const InputSetList: React.FC = (): JSX.Element => {
  const [searchParam, setSearchParam] = React.useState('')
  const [page, setPage] = React.useState(0)
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<PipelinePathProps> & { accountId: string }
  >()
  const { showSuccess, showError } = useToaster()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputSetToDelete, setInputSetToDelete] = useState<InputSetSummaryResponse>()

  const {
    data: inputSet,
    loading,
    refetch,
    error
  } = useGetInputSetsListForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      pageIndex: page,
      pageSize: 20,
      searchTerm: searchParam,
      ...(!isEmpty(repoIdentifier) && !isEmpty(branch)
        ? {
            repoIdentifier,
            branch,
            getDefaultFromOtherRepo: true
          }
        : {})
    },
    debounce: 300
  })

  const { data: template } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    body: {
      stageIdentifiers: []
    }
  })

  const { data: pipeline } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })

  const { mutate: deleteInputSet } = useDeleteInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier, pipelineIdentifier }
  })

  // These flags will be used to disable the Add Input set buttons in the page.
  const [pipelineHasRuntimeInputs, setPipelineHasRuntimeInputs] = useState(true)
  useEffect(() => {
    if (!template?.data?.inputSetTemplateYaml) {
      setPipelineHasRuntimeInputs(false)
    } else {
      setPipelineHasRuntimeInputs(true)
    }
  }, [template])

  const [selectedInputSet, setSelectedInputSet] = React.useState<{
    identifier?: string
    repoIdentifier?: string
    branch?: string
  }>()
  const history = useHistory()
  const { getString } = useStrings()

  useDocumentTitle([pipeline?.data?.name || getString('pipelines'), getString('inputSetsText')])

  const goToInputSetForm = React.useCallback(
    (inputSetTemp?: InputSetSummaryResponse) => {
      history.push(
        routes.toInputSetForm({
          accountId,
          orgIdentifier,
          projectIdentifier,
          pipelineIdentifier,
          inputSetIdentifier: typeof inputSetTemp?.identifier !== 'string' ? '-1' : inputSetTemp.identifier,
          module,
          inputSetRepoIdentifier: inputSetTemp?.gitDetails?.repoIdentifier,
          inputSetBranch: inputSetTemp?.gitDetails?.branch,
          repoIdentifier,
          branch
        })
      )
    },
    [accountId, orgIdentifier, projectIdentifier, pipelineIdentifier, module, history, repoIdentifier, branch]
  )

  const [canUpdateInputSet] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE]
    },
    [accountId, orgIdentifier, projectIdentifier, pipelineIdentifier]
  )

  const [showOverlayInputSetForm, hideOverlayInputSetForm] = useModalHook(
    () => (
      <OverlayInputSetForm
        identifier={selectedInputSet?.identifier}
        overlayInputSetRepoIdentifier={selectedInputSet?.repoIdentifier}
        overlayInputSetBranch={selectedInputSet?.branch}
        hideForm={() => {
          refetch()
          hideOverlayInputSetForm()
        }}
        isReadOnly={!canUpdateInputSet}
      />
    ),
    [selectedInputSet]
  )

  const onDeleteInputSet = async (commitMsg: string): Promise<void> => {
    try {
      setIsLoading(true)
      const gitParams = inputSetToDelete?.gitDetails?.objectId
        ? {
            ...pick(inputSetToDelete?.gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
            commitMsg,
            lastObjectId: inputSetToDelete?.gitDetails?.objectId
          }
        : {}

      const deleted = await deleteInputSet(defaultTo(inputSetToDelete?.identifier, ''), {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          pipelineIdentifier: defaultTo(inputSetToDelete?.pipelineIdentifier, ''),
          ...gitParams
        },
        headers: { 'content-type': 'application/json' }
      })
      setIsLoading(false)

      /* istanbul ignore else */
      if (deleted?.status === 'SUCCESS') {
        showSuccess(getString('inputSets.inputSetDeleted', { name: inputSetToDelete?.name }))
      } else {
        throw getString('somethingWentWrong')
      }
      refetch()
    } catch (err) {
      setIsLoading(false)
      /* istanbul ignore next */
      showError(err?.data?.message || err?.message, undefined, 'pipeline.delete.inputset.error')
    }
  }

  return (
    <>
      <Page.SubHeader>
        <Layout.Horizontal>
          <Popover
            minimal
            content={
              <Menu className={css.menuList}>
                <MenuItem
                  text={getString('inputSets.inputSetLabel')}
                  onClick={() => {
                    goToInputSetForm()
                  }}
                />
                <MenuItem
                  text={getString('inputSets.overlayInputSet')}
                  onClick={() => {
                    setSelectedInputSet({ identifier: '', repoIdentifier, branch })
                    showOverlayInputSetForm()
                  }}
                />
              </Menu>
            }
            position={Position.BOTTOM}
            disabled={!canUpdateInputSet || !pipelineHasRuntimeInputs}
          >
            <RbacButton
              text={getString('inputSets.newInputSet')}
              rightIcon="caret-down"
              variation={ButtonVariation.PRIMARY}
              permission={{
                resource: {
                  resourceType: ResourceType.PIPELINE,
                  resourceIdentifier: pipelineIdentifier
                },
                permission: PermissionIdentifier.EDIT_PIPELINE
              }}
              disabled={!pipelineHasRuntimeInputs}
              tooltip={
                !pipelineHasRuntimeInputs ? (
                  <Text padding="medium">{getString('pipeline.inputSets.noRuntimeInputsCurrently')}</Text>
                ) : undefined
              }
            />
          </Popover>
        </Layout.Horizontal>

        <Layout.Horizontal spacing="small">
          <TextInput
            leftIcon={'thinner-search'}
            leftIconProps={{ name: 'thinner-search', size: 14, color: Color.GREY_700 }}
            placeholder={getString('inputSets.searchInputSet')}
            wrapperClassName={css.searchWrapper}
            value={searchParam}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchParam(e.target.value.trim())
            }}
          />
        </Layout.Horizontal>
      </Page.SubHeader>

      <Page.Body
        loading={loading || isLoading}
        error={error?.message}
        retryOnError={/* istanbul ignore next */ () => refetch()}
        noData={{
          when: () => !inputSet?.data?.content?.length,
          icon: 'yaml-builder-input-sets',
          message: getString('inputSets.aboutInputSets'),
          buttonText: getString('inputSets.newInputSet'),
          onClick: () => goToInputSetForm(),
          buttonDisabled: !canUpdateInputSet || !pipelineHasRuntimeInputs,
          buttonDisabledTooltip: !pipelineHasRuntimeInputs
            ? getString('pipeline.inputSets.noRuntimeInputsCurrently')
            : undefined
        }}
      >
        <InputSetListView
          data={inputSet?.data}
          gotoPage={setPage}
          pipelineHasRuntimeInputs={pipelineHasRuntimeInputs}
          goToInputSetDetail={inputSetTemp => {
            setSelectedInputSet({
              identifier: inputSetTemp?.identifier,
              repoIdentifier: inputSetTemp?.gitDetails?.repoIdentifier,
              branch: inputSetTemp?.gitDetails?.branch
            })
            if (inputSetTemp?.inputSetType === 'INPUT_SET') {
              goToInputSetForm(inputSetTemp)
            } else {
              showOverlayInputSetForm()
            }
          }}
          refetchInputSet={refetch}
          template={template}
          canUpdate={canUpdateInputSet}
          onDeleteInputSet={onDeleteInputSet}
          onDelete={(inputSetSelected: InputSetSummaryResponse) => {
            setInputSetToDelete(inputSetSelected)
          }}
        />
      </Page.Body>
    </>
  )
}

export default InputSetList
