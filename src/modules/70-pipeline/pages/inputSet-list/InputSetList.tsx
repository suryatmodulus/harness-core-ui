import React, { useEffect, useState } from 'react'
import { isEmpty } from 'lodash-es'
import { Popover, Layout, TextInput, useModalHook, Text, Color } from '@wings-software/uicore'
import { Menu, MenuItem, Position } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import {
  InputSetSummaryResponse,
  useGetInputSetsListForPipeline,
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
import { useQueryParams } from '@common/hooks'
import { InputSetListView } from './InputSetListView'
import css from './InputSetList.module.scss'

const InputSetList: React.FC = (): JSX.Element => {
  const [searchParam, setSearchParam] = React.useState('')
  const [page, setPage] = React.useState(0)
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<PipelinePathProps> & { accountId: string }
  >()

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
      pageSize: 10,
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

  const { data: template } = useGetTemplateFromPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
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
  useDocumentTitle([getString('pipelines'), getString('inputSetsText')])

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
              intent="primary"
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
        loading={loading}
        error={error?.message}
        retryOnError={/* istanbul ignore next */ () => refetch()}
        noData={{
          when: () => !inputSet?.data?.content?.length,
          icon: 'yaml-builder-input-sets',
          message: getString('inputSets.aboutInputSets'),
          buttonText: getString('inputSets.addInputSet'),
          onClick: () => goToInputSetForm(),
          buttonDisabled: !canUpdateInputSet || !pipelineHasRuntimeInputs,
          buttonDisabledTooltip: getString('pipeline.inputSets.noRuntimeInputsCurrently')
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
          canUpdate={canUpdateInputSet}
        />
      </Page.Body>
    </>
  )
}

export default InputSetList
