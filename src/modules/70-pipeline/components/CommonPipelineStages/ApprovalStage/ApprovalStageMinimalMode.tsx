import React from 'react'
import * as Yup from 'yup'
import { Formik } from 'formik'
import { Button, Color, Container, FormikForm, Intent, Text } from '@wings-software/uicore'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components'
import type { ApprovalStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { ApprovalStageMinimalModeProps, ApprovalStageMinimalValues } from './types'
import { ApprovalTypeCards, approvalTypeCardsData } from './ApprovalTypeCards'

import css from './ApprovalStageMinimalMode.module.scss'

const getInitialValues = (data?: StageElementWrapper<ApprovalStageElementConfig>): ApprovalStageMinimalValues => ({
  identifier: data?.stage?.identifier || '',
  name: data?.stage?.name || '',
  description: data?.stage?.description,
  tags: data?.stage?.tags || {},
  approvalType: (data?.stage?.spec as any)?.approvalType || approvalTypeCardsData[0].value
})

export const ApprovalStageMinimalMode: React.FC<ApprovalStageMinimalModeProps> = props => {
  const { getString } = useStrings()
  const { onChange, onSubmit, data } = props

  const {
    state: { pipeline }
  } = React.useContext(PipelineContext)

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
      data.stage.identifier = values.identifier
      data.stage.name = values.name
      data.stage.description = values.description
      data.stage.tags = values.tags
      ;(data.stage as any).approvalType = values.approvalType
      onSubmit?.(data, values.identifier)
    }
  }

  return (
    <Container padding="medium" className={css.approvalStageMinimalWrapper}>
      <Formik
        enableReinitialize
        initialValues={getInitialValues(data)}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('approvalStage.stageNameRequired') }),
          identifier: IdentifierSchema()
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
            >
              {getString('pipelineSteps.build.create.aboutYourStage')}
            </Text>

            <NameIdDescriptionTags formikProps={formikProps} />

            <Text
              color={Color.BLACK_100}
              font={{ size: 'normal' }}
              tooltipProps={{ dataTooltipId: 'approvalTypeHeading' }}
            >
              {getString('approvalStage.approvalTypeHeading')}
            </Text>
            <ApprovalTypeCards formikProps={formikProps} />

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
