/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { Formik } from 'formik'
import { Button, Color, Container, FormikForm, Intent, Text } from '@wings-software/uicore'
import {
  PipelineContextType,
  usePipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components'
import type { ApprovalStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import { createTemplate, getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import type { ApprovalStageMinimalModeProps, ApprovalStageMinimalValues } from './types'
import { ApprovalTypeCards } from './ApprovalTypeCards'
import css from './ApprovalStageMinimalMode.module.scss'

const getInitialValues = (data?: StageElementWrapper<ApprovalStageElementConfig>): ApprovalStageMinimalValues => ({
  identifier: data?.stage?.identifier || '',
  name: data?.stage?.name || '',
  description: data?.stage?.description,
  tags: data?.stage?.tags || {},
  approvalType: (data?.stage?.spec as any)?.approvalType
})

export const ApprovalStageMinimalMode: React.FC<ApprovalStageMinimalModeProps> = props => {
  const { getString } = useStrings()
  const { onChange, onSubmit, data, template } = props

  const {
    state: { pipeline, templateTypes },
    contextType,
    setTemplateTypes
  } = usePipelineContext()

  const handleValidate = (values: ApprovalStageMinimalValues): Record<string, string | undefined> | undefined => {
    const errors: { name?: string } = {}
    if (isDuplicateStageId(values.identifier, pipeline?.stages || [])) {
      errors.name = getString('validation.identifierDuplicate')
    }
    if (data) {
      onChange?.(values)
    }
    return errors
  }

  const handleSubmit = (values: ApprovalStageMinimalValues): void => {
    if (data?.stage) {
      if (template) {
        if (template.identifier && template.childType) {
          templateTypes[template.identifier] = template.childType
          setTemplateTypes(templateTypes)
        }
        onSubmit?.({ stage: createTemplate(values, template) }, values.identifier)
      } else {
        data.stage.identifier = values.identifier
        data.stage.name = values.name
        data.stage.description = values.description
        data.stage.tags = values.tags
        ;(data.stage as any).approvalType = values.approvalType
        onSubmit?.(data, values.identifier)
      }
    }
  }

  return (
    <Container padding="medium" className={css.approvalStageMinimalWrapper}>
      <Formik
        enableReinitialize
        initialValues={getInitialValues(data)}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, contextType),
          ...(!template && {
            approvalType: Yup.string().required(getString('pipeline.approvalTypeRequired'))
          })
        })}
        validate={handleValidate}
        onSubmit={(values: ApprovalStageMinimalValues) => handleSubmit(values)}
      >
        {formikProps => (
          <FormikForm>
            <Text
              icon="pipeline-approval"
              iconProps={{ size: 16, intent: Intent.SUCCESS }}
              margin={{ bottom: 'medium' }}
              className={css.addStageHeading}
            >
              {getString('pipelineSteps.build.create.aboutYourStage')}
            </Text>

            {contextType === PipelineContextType.Pipeline &&
              (template ? (
                <NameId
                  identifierProps={{
                    inputLabel: getString('stageNameLabel')
                  }}
                />
              ) : (
                <NameIdDescriptionTags
                  formikProps={formikProps}
                  identifierProps={{
                    inputLabel: getString('stageNameLabel')
                  }}
                />
              ))}

            {template ? (
              <Text
                icon={'template-library'}
                margin={{ top: 'medium', bottom: 'medium' }}
                font={{ size: 'small' }}
                iconProps={{ size: 12, margin: { right: 'xsmall' } }}
                color={Color.BLACK}
              >
                {`Using Template: ${getTemplateNameWithLabel(template)}`}
              </Text>
            ) : (
              <>
                <Text
                  color={Color.GREY_700}
                  font={{ size: 'normal', weight: 'semi-bold' }}
                  tooltipProps={{ dataTooltipId: 'approvalTypeHeading' }}
                >
                  {getString('approvalStage.approvalTypeHeading')}
                </Text>
                <ApprovalTypeCards formikProps={formikProps} />
              </>
            )}

            <Button
              type="submit"
              intent="primary"
              text={getString('pipelineSteps.build.create.setupStage')}
              margin={{ top: 'small' }}
            />
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}
