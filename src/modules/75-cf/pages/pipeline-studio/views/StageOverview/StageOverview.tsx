/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import * as Yup from 'yup'
import { Formik } from 'formik'
import { cloneDeep, debounce } from 'lodash-es'
import { Heading, Container, FormikForm, Color } from '@wings-software/uicore'
import { NameIdDescription } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import type { StageElementConfig } from 'services/cd-ng'

export default function StageOverview(_props: React.PropsWithChildren<unknown>): JSX.Element {
  const {
    state: {
      pipeline: { stages = [] },
      selectionState: { selectedStageId }
    },
    isReadonly,
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()
  const { stage } = getStageFromPipeline(selectedStageId || '')
  const cloneOriginalData = cloneDeep(stage)

  const { getString } = useStrings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateStageDebounced = useCallback(
    debounce((values: StageElementConfig): void => {
      updateStage({ ...stage?.stage, ...values })
    }, 300),
    [stage?.stage, updateStage]
  )

  return (
    <Container padding={{ top: 'small', right: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge' }}>
      <Heading color={Color.BLACK} level={3} style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px' }}>
        {getString('stageOverview')}
      </Heading>
      <Container id="stageOverview">
        <Formik
          enableReinitialize
          initialValues={{
            identifier: cloneOriginalData?.stage!.identifier,
            name: cloneOriginalData?.stage!.name,
            description: cloneOriginalData?.stage!.description,
            tags: cloneOriginalData?.stage!.tags || {}
          }}
          validationSchema={{
            name: Yup.string().trim().required(getString('approvalStage.stageNameRequired')),
            identifier: Yup.string().when('name', {
              is: val => val?.length,
              then: Yup.string()
                .required(getString('validation.identifierRequired'))
                .matches(regexIdentifier, getString('validation.validIdRegex'))
                .notOneOf(illegalIdentifiers)
            })
          }}
          validate={values => {
            const errors: { name?: string } = {}
            if (isDuplicateStageId(values.identifier!, stages)) {
              errors.name = getString('validation.identifierDuplicate')
            }
            if (cloneOriginalData) {
              updateStageDebounced({
                ...(cloneOriginalData.stage as StageElementConfig),
                name: values?.name || '',
                identifier: values?.identifier || '',
                description: values?.description || ''
              })
            }
            return errors
          }}
          onSubmit={values => {
            if (cloneOriginalData) {
              updateStageDebounced({
                ...(cloneOriginalData.stage as StageElementConfig),
                name: values?.name || '',
                identifier: values?.identifier || '',
                description: values?.description || ''
              })
            }
          }}
        >
          {formikProps => (
            <FormikForm>
              <Container
                margin={{ top: 'large' }}
                padding="large"
                style={{
                  borderRadius: '4px',
                  width: 400,
                  filter: 'drop-shadow(0px 0px 1px rgba(40, 41, 61, 0.16))'
                }}
                background={Color.WHITE}
              >
                <NameIdDescription
                  formikProps={formikProps}
                  descriptionProps={{
                    disabled: isReadonly
                  }}
                  identifierProps={{
                    isIdentifierEditable: false,
                    inputGroupProps: { disabled: isReadonly }
                  }}
                />
              </Container>
            </FormikForm>
          )}
        </Formik>
      </Container>
      {_props.children}
    </Container>
  )
}
