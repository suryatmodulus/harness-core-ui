/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { FormInput, FormikForm, Container, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'

import { parse } from 'yaml'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { useGetPipeline } from 'services/pipeline-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { spec } from '../../types'
import { checkIfRunTimeInput } from '../../utils'
import type { ContinousVerificationProps } from './types'
import {
  baseLineOptions,
  durationOptions,
  trafficSplitPercentageOptions,
  VerificationSensitivityOptions
} from '../../constants'
import RunTimeMonitoredService from './components/RunTimeMonitoredService/RunTimeMonitoredService'
import {
  getInfraAndServiceData,
  getInfraAndServiceFromStage
} from './components/ContinousVerificationInputSetStep.utils'

import css from './ContinousVerificationInputSetStep.module.scss'

export function ContinousVerificationInputSetStep(
  props: ContinousVerificationProps & { formik?: any }
): React.ReactElement {
  const { template, path, initialValues, readonly, onUpdate, formik, allowableTypes } = props
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [pipeline, setPipeline] = useState<{ pipeline: PipelineInfoConfig } | undefined>()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { sensitivity, duration, baseline, trafficsplit, deploymentTag } = (template?.spec?.spec as spec) || {}
  const { data: pipelineData, refetch: fetchPipeline } = useGetPipeline({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  useEffect(() => {
    fetchPipeline()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (pipelineData?.data?.yamlPipeline) {
      setPipeline(parse(pipelineData?.data?.yamlPipeline))
    }
  }, [pipelineData?.data?.yamlPipeline])

  const { serviceIdentifierFromStage, envIdentifierDataFromStage } = useMemo(() => {
    return getInfraAndServiceFromStage(pipeline)
  }, [pipeline])

  const { serviceIdentifier, envIdentifier } = useMemo(() => {
    const { serviceIdentifierData, envIdentifierData } = getInfraAndServiceData(pipeline, formik)
    return { serviceIdentifier: serviceIdentifierData, envIdentifier: envIdentifierData }
  }, [pipeline, formik])

  return (
    <FormikForm>
      {(serviceIdentifierFromStage === RUNTIME_INPUT_VALUE || envIdentifierDataFromStage === RUNTIME_INPUT_VALUE) && (
        <RunTimeMonitoredService
          serviceIdentifier={serviceIdentifier}
          envIdentifier={envIdentifier}
          onUpdate={onUpdate}
          initialValues={initialValues}
          prefix={prefix}
        />
      )}

      <Container className={css.container}>
        {checkIfRunTimeInput(sensitivity) && (
          <Container className={css.item}>
            <FormInput.MultiTypeInput
              label={getString('sensitivity')}
              name={`${prefix}spec.spec.sensitivity`}
              selectItems={VerificationSensitivityOptions}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes
              }}
              disabled={readonly}
            />
          </Container>
        )}

        {checkIfRunTimeInput(duration) && (
          <Container className={css.item}>
            <FormInput.MultiTypeInput
              label={getString('duration')}
              name={`${prefix}spec.spec.duration`}
              selectItems={durationOptions}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes
              }}
              disabled={readonly}
            />
          </Container>
        )}

        {checkIfRunTimeInput(baseline) && (
          <Container className={css.item}>
            <FormInput.MultiTypeInput
              label={getString('connectors.cdng.baseline')}
              name={`${prefix}spec.spec.baseline`}
              selectItems={baseLineOptions}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes
              }}
              disabled={readonly}
            />
          </Container>
        )}

        {checkIfRunTimeInput(trafficsplit) && (
          <Container className={css.item}>
            <FormInput.MultiTypeInput
              label={getString('connectors.cdng.trafficsplit')}
              name={`${prefix}spec.spec.trafficsplit`}
              selectItems={trafficSplitPercentageOptions}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes
              }}
              disabled={readonly}
            />
          </Container>
        )}

        {checkIfRunTimeInput(deploymentTag) && (
          <Container className={css.item}>
            <FormInput.MultiTextInput
              label={getString('connectors.cdng.artifactTag')}
              name={`${prefix}spec.spec.deploymentTag`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              disabled={readonly}
            />
          </Container>
        )}

        {checkIfRunTimeInput(template?.timeout) && (
          <Container className={css.item}>
            <FormMultiTypeDurationField
              name={`${prefix}timeout`}
              label={getString('pipelineSteps.timeoutLabel')}
              disabled={readonly}
              multiTypeDurationProps={{
                expressions,
                enableConfigureOptions: false,
                allowableTypes
              }}
            />
          </Container>
        )}
      </Container>
    </FormikForm>
  )
}
