import React from 'react'
import {
  Text,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Collapse,
  Button,
  Icon,
  Card,
  CardSelect,
  CardSelectType
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import type { IconName } from '@blueprintjs/core'
import type { StageElementWrapper } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/exports'
import { useStrings } from 'framework/exports'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import css from './FeatureAddStageView.module.scss'

const newStageData = [
  {
    text: 'Feature rollout',
    value: 'featureRollout',
    icon: 'service',
    disabled: false
  },
  {
    text: 'A/B testing',
    value: 'ab-service',
    icon: 'multi-service',
    disabled: true
  }
]

export interface FeatureAddEditStageViewProps {
  data?: StageElementWrapper
  onSubmit?: (values: StageElementWrapper, identifier: string) => void
  onChange?: (values: StageElementWrapper) => void
}

interface Values {
  identifier: string
  name: string
  description?: string
  environment?: string
  featureType?: string
}

export const FeatureAddEditStageView: React.FC<FeatureAddEditStageViewProps> = ({
  data,
  onSubmit,
  onChange
}): JSX.Element => {
  const { getString } = useStrings()

  const {
    state: { pipeline }
  } = React.useContext(PipelineContext)

  const initialValues: Values = {
    identifier: data?.stage.identifier,
    name: data?.stage.name,
    description: data?.stage.description,
    environment: data?.stage.environment,
    featureType: data?.stage.featureType
  }

  const validationSchema = () =>
    Yup.lazy((_values: Values): any =>
      Yup.object().shape({
        name: Yup.string()
          .trim()
          .required(getString('fieldRequired', { field: getString('stageNameLabel') })),
        identifier: Yup.string().when('name', {
          is: val => val?.length,
          then: Yup.string()
            .required(getString('validation.identifierRequired'))
            .matches(regexIdentifier, getString('validation.validIdRegex'))
            .notOneOf(illegalIdentifiers)
        })
      })
    )

  const handleValidate = (values: Values): {} => {
    const errors: { name?: string } = {}
    if (isDuplicateStageId(values.identifier, pipeline?.stages || [])) {
      errors.name = getString('validation.identifierDuplicate')
    }
    if (data) {
      onChange?.(values)
    }
    return errors
  }

  const handleSubmit = (values: Values): void => {
    if (data) {
      data.stage.identifier = values.identifier
      data.stage.name = values.name
      if (values.description) data.stage.description = values.description
      data.stage.environment = values.environment
      data.stage.featureFlag = values.featureType
      if (!data.stage.spec) data.stage.spec = {}

      onSubmit?.(data, values.identifier)
    }
  }

  const collapseProps = {
    collapsedIcon: 'small-plus' as IconName,
    expandedIcon: 'small-minus' as IconName,
    isOpen: false,
    isRemovable: false,
    className: 'collapse',
    heading: getString('description')
  }

  return (
    <div className={css.stageCreate}>
      <Container padding="medium">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          validate={handleValidate}
          onSubmit={handleSubmit}
        >
          {formikProps => (
            <FormikForm>
              <Text
                font={{ size: 'medium', weight: 'semi-bold' }}
                icon="cf-main"
                iconProps={{ size: 16 }}
                margin={{ bottom: 'medium' }}
              >
                {getString('pipelineSteps.build.create.aboutYourStage')}
              </Text>
              <FormInput.InputWithIdentifier inputLabel={getString('stageNameLabel')} />
              <div className={css.collapseDiv}>
                <Collapse
                  {...collapseProps}
                  isOpen={(formikProps.values.description && formikProps.values.description?.length > 0) || false}
                >
                  <FormInput.TextArea name="description" />
                </Collapse>
              </div>

              <div className={css.tabHeading}>{getString('pipelineSteps.feature.create.specifyEnvironment')}</div>
              <MultiTypeTextField
                name="environment"
                label={''}
                multiTextInputProps={{
                  placeholder: 'Placeholder...'
                }}
                style={{ marginTop: 'var(--spacing-small)' }}
              />

              <div className={css.tabHeading}>{getString('pipelineSteps.feature.create.whatIsFor')}</div>
              <Card className={cx(css.sectionCard, css.shadow)}>
                <CardSelect
                  type={CardSelectType.Any} // TODO: Remove this by publishing uikit with exported CardSelectType
                  selected={newStageData.find(item => item.value === formikProps.values.featureType)}
                  onChange={item => formikProps.setFieldValue('featureType', item.value)}
                  renderItem={(item, selected) => (
                    <div
                      key={item.text}
                      onClick={e => {
                        if (item.disabled) {
                          e.stopPropagation()
                        }
                      }}
                    >
                      <Card
                        selected={selected}
                        cornerSelected={selected}
                        interactive={!item.disabled}
                        disabled={item.disabled}
                        className={css.squareCard}
                      >
                        <Icon name={item.icon as IconName} size={26} height={26} />
                      </Card>
                      <Text
                        style={{
                          fontSize: '12px',
                          color: selected ? 'var(--grey-900)' : 'var(--grey-350)',
                          textAlign: 'center'
                        }}
                      >
                        {item.text}
                      </Text>
                    </div>
                  )}
                  data={newStageData}
                  className={css.grid}
                />
              </Card>
              <Button
                type="submit"
                intent="primary"
                text={getString('pipelineSteps.build.create.setupStage')}
                onClick={() => formikProps.submitForm()}
                margin={{ top: 'small' }}
              />
            </FormikForm>
          )}
        </Formik>
      </Container>
    </div>
  )
}
