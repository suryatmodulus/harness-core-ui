/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'

import { getMultiTypeFromValue, MultiTypeInputType, FormInput, Label, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import type { TerraformData, TerraformProps } from '../TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function ConfigSection<T extends TerraformData = TerraformData>(
  props: TerraformProps<T>
): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { inputSetData, readonly, initialValues, path, allowableTypes } = props
  const config = inputSetData?.template?.spec?.configuration
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  return (
    <>
      {(config?.spec?.configFiles?.store?.spec?.connectorRef ||
        config?.spec?.workspace ||
        config?.spec?.configFiles?.store?.spec?.branch ||
        config?.spec?.configFiles?.store?.spec?.commitId ||
        config?.spec?.configFiles?.store?.spec?.folderPath) && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {getString('cd.configurationFile')}
        </Label>
      )}
      {getMultiTypeFromValue(config?.spec?.workspace) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.configuration.spec.workspace`}
            label={getString('pipelineSteps.workspace')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(config?.spec?.configFiles?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            selected={get(initialValues, 'spec.configuration.spec.configFiles.store.spec.connectorRef', '')}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            multiTypeProps={{ allowableTypes, expressions }}
            width={445}
            type={[Connectors.GIT, Connectors.GITHUB, Connectors.GITLAB, Connectors.BITBUCKET]}
            name={`${path}.spec.configuration.spec.configFiles.store.spec.connectorRef`}
            label={getString('connector')}
            placeholder={getString('select')}
            disabled={readonly}
            setRefValue
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}

      {getMultiTypeFromValue(config?.spec?.configFiles?.store?.spec?.branch) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipelineSteps.deploy.inputSet.branch')}
            name={`${path}.spec.configuration.spec.configFiles.store.spec.branch`}
            placeholder={getString('pipeline.manifestType.branchPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(config?.spec?.configFiles?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipeline.manifestType.commitId')}
            name={`${path}.spec.configuration.spec.configFiles.store.spec.commitId`}
            placeholder={getString('pipeline.manifestType.commitPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(config?.spec?.configFiles?.store?.spec?.folderPath) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('cd.folderPath')}
            name={`${path}.spec.configuration.spec.configFiles.store.spec.folderPath`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
    </>
  )
}
