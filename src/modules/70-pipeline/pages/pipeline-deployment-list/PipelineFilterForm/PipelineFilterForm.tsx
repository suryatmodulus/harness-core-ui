import React from 'react'
import type { FormikProps } from 'formik'
import { FormInput, SelectOption, Text } from '@wings-software/uicore'
import { useParams } from 'react-router'
import { useStrings } from 'framework/exports'
import type { FilterProperties } from 'services/pipeline-ng'
import {
  getOptionsForMultiSelect,
  BUILD_TYPE,
  DeploymentTypeContext,
  BuildTypeContext
} from '@pipeline/utils/PipelineExecutionFilterRequestUtils'

import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import css from './PipelineFilterForm.module.scss'

export type FormView = 'PIPELINE-META'
interface PipelineFilterFormProps<T> {
  formikProps?: FormikProps<T>
  type: FilterProperties['filterType']
  isCDEnabled: boolean
  isCIEnabled: boolean
  initialValues: FormikProps<T>['initialValues']
}

const NO_SELECTION = { label: '', value: '' }

export default function PipelineFilterForm<
  T extends {
    buildType?: BuildTypeContext['buildType']
    deploymentType?: DeploymentTypeContext['deploymentType']
    infrastructureType?: DeploymentTypeContext['infrastructureType']
  }
>(props: PipelineFilterFormProps<T>): React.ReactElement {
  const { getString } = useStrings()
  const { module } = useParams<ModulePathParams>()
  const { type, formikProps, isCDEnabled, isCIEnabled, initialValues } = props
  const getBuildTypeOptions = (): React.ReactElement => {
    let buildTypeField: JSX.Element = <></>
    const buildType = formikProps?.values?.buildType as BuildTypeContext['buildType']
    const buildTypeOptions = [
      { label: getString('filters.executions.pullOrMergeRequest'), value: BUILD_TYPE.PULL_OR_MERGE_REQUEST },
      { label: getString('pipelineSteps.deploy.inputSet.branch'), value: BUILD_TYPE.BRANCH },
      { label: getString('tagLabel'), value: BUILD_TYPE.TAG }
    ]
    switch (buildType) {
      case BUILD_TYPE.PULL_OR_MERGE_REQUEST:
        buildTypeField = (
          <div className={css.subfilter} key="buildSubType">
            <FormInput.Text
              name={'sourceBranch'}
              label={getString('pipeline-triggers.conditionsPanel.sourceBranch')}
              key={'sourceBranch'}
              placeholder={getString('enterNamePlaceholder')}
            />
            <FormInput.Text
              name={'targetBranch'}
              label={getString('pipeline-triggers.conditionsPanel.targetBranch')}
              key={'targetBranch'}
              placeholder={getString('enterNamePlaceholder')}
            />
          </div>
        )
        break
      case BUILD_TYPE.BRANCH:
        buildTypeField = (
          <div className={css.subfilter} key="buildSubType">
            <FormInput.Text
              name={'branch'}
              label={getString('pipelineSteps.deploy.inputSet.branch')}
              key={'branch'}
              placeholder={getString('enterNamePlaceholder')}
            />
          </div>
        )
        break
      case BUILD_TYPE.TAG:
        buildTypeField = (
          <div className={css.subfilter} key="buildSubType">
            <FormInput.Text
              name={'tag'}
              label={getString('tagLabel')}
              key={'tag'}
              placeholder={getString('filters.executions.tagPlaceholder')}
            />
          </div>
        )
        break
      default:
        break
    }
    return (
      <>
        <>
          <span className={css.separator} key="buildsSeparator">
            <Text>{getString('buildsText').toUpperCase()}</Text>
          </span>
          {(type === 'PipelineExecution' && module === 'ci') || type === 'PipelineSetup' ? (
            <FormInput.Text
              name={'repositoryName'}
              label={getString('pipelineSteps.build.create.repositoryNameLabel')}
              key={'repositoryName'}
              placeholder={getString('enterNamePlaceholder')}
            />
          ) : null}
          <FormInput.Select
            items={buildTypeOptions}
            name="buildType"
            label={getString('filters.executions.buildType')}
            key="buildType"
            value={
              buildType ? buildTypeOptions.find((option: SelectOption) => option.value === buildType) : NO_SELECTION
            }
          />
        </>
        {buildTypeField}
      </>
    )
  }

  const getDeploymentTypeOptions = (): React.ReactElement => {
    const { environments, services } = initialValues as DeploymentTypeContext
    const deploymentTypeLabel = { label: getString('kubernetesText'), value: 'Kubernetes' }
    const infrastructureTypeLabel = { label: getString('kubernetesDirectText'), value: 'Kubernetes Direct' }
    return (
      <>
        <span className={css.separator} key="deploymentSeparator">
          <Text>{getString('deploymentsText').toUpperCase()}</Text>
        </span>
        <FormInput.Select
          items={[deploymentTypeLabel]}
          name="deploymentType"
          label={getString('deploymentTypeText')}
          key="deploymentType"
          value={
            (formikProps?.values?.deploymentType as DeploymentTypeContext['deploymentType'])
              ? deploymentTypeLabel
              : NO_SELECTION
          }
        />
        <FormInput.Select
          items={[infrastructureTypeLabel]}
          name="infrastructureType"
          label={getString('infrastructureTypeText')}
          key="infrastructureType"
          value={
            (formikProps?.values?.infrastructureType as DeploymentTypeContext['infrastructureType'])
              ? infrastructureTypeLabel
              : NO_SELECTION
          }
        />
        <FormInput.MultiSelect
          items={services || []}
          name="services"
          label={getString('services')}
          key="services"
          multiSelectProps={{
            allowCreatingNewItems: false
          }}
        />
        <FormInput.MultiSelect
          items={environments || []}
          name="environments"
          label={getString('environments')}
          key="environments"
          multiSelectProps={{
            allowCreatingNewItems: false
          }}
        />
      </>
    )
  }

  const getPipelineFormCommonFields = (): React.ReactElement => {
    const isPipeSetupType = type === 'PipelineSetup'
    return (
      <>
        <FormInput.Text
          name={isPipeSetupType ? 'name' : 'pipelineName'}
          label={isPipeSetupType ? getString('name') : getString('filters.executions.pipelineName')}
          key={isPipeSetupType ? 'name' : 'pipelineName'}
          placeholder={getString('enterNamePlaceholder')}
        />
        {isPipeSetupType ? (
          <>
            <FormInput.Text name={'description'} label={getString('description')} key={'description'} />
            <FormInput.KVTagInput name="pipelineTags" label={getString('tagsLabel')} key="pipelineTags" />
          </>
        ) : null}
        {type === 'PipelineExecution' ? (
          <FormInput.MultiSelect
            items={getOptionsForMultiSelect()}
            name="status"
            label={getString('status')}
            key="status"
            multiSelectProps={{
              allowCreatingNewItems: false
            }}
          />
        ) : null}
      </>
    )
  }

  if (isCDEnabled && isCIEnabled) {
    return (
      <>
        <>{getPipelineFormCommonFields()}</>
        <>{getDeploymentTypeOptions()}</>
        <>{getBuildTypeOptions()}</>
      </>
    )
  } else if (isCDEnabled) {
    return (
      <>
        <>{getPipelineFormCommonFields()}</>
        <>{getDeploymentTypeOptions()}</>
      </>
    )
  } else if (isCIEnabled) {
    return (
      <>
        <>{getPipelineFormCommonFields()}</>
        <>{getBuildTypeOptions()}</>
      </>
    )
  }
  return <></>
}
