import React from 'react'
import { Formik, FormikForm, Container, Text, FormInput, Layout, FlexExpander, Button } from '@wings-software/uicore'
import * as Yup from 'yup'
import { QlceViewRuleInput, QlceViewFieldInputInput, ViewChartType } from 'services/ce/services'
import { useStrings } from 'framework/strings'
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import PerspectiveFilters from '../PerspectiveFilters'
import PerspectiveBuilderPreview from '../PerspectiveBuilderPreview/PerspectiveBuilderPreview'
import ProTipIcon from './images/pro-tip.svg'
import css from './PerspectiveBuilder.module.scss'

export interface PerspectiveFormValues {
  name: string
  viewRules?: QlceViewRuleInput[]
  viewVisualization: {
    groupBy: QlceViewFieldInputInput
    chartType: ViewChartType
  }
}

const PerspectiveBuilder: React.FC = () => {
  const { getString } = useStrings()

  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required(getString('ce.perspectives.createPerspective.validationErrors.nameError')),
    viewRules: Yup.array().of(
      Yup.object().shape({
        viewConditions: Yup.array().of(
          Yup.object().shape({
            viewOperator: Yup.string(),
            viewField: Yup.object().shape({
              fieldId: Yup.string().required(),
              fieldName: Yup.string(),
              identifier: Yup.string().required(),
              identifierName: Yup.string().nullable()
            }),
            values: Yup.array().min(1, getString('ce.perspectives.createPerspective.validationErrors.ruleError'))
          })
        )
      })
    )
  })

  return (
    <Container className={css.mainContainer}>
      <Formik<PerspectiveFormValues>
        formName="createPerspective"
        initialValues={{
          name: '',
          viewVisualization: {
            groupBy: DEFAULT_GROUP_BY,
            chartType: ViewChartType.StackedLineChart
          }
        }}
        enableReinitialize={true}
        onSubmit={() => {
          Promise.resolve()
        }}
        validationSchema={validationSchema}
        render={formikProps => {
          return (
            <FormikForm className={css.formContainer}>
              <Container className={css.innerContainer}>
                <Layout.Vertical spacing="medium" height="100%" padding="xxlarge">
                  <Text color="grey800">{getString('ce.perspectives.createPerspective.title')}</Text>
                  <FormInput.Text
                    name="name"
                    label={getString('ce.perspectives.createPerspective.nameLabel')}
                    placeholder={getString('ce.perspectives.createPerspective.name')}
                    tooltipProps={{
                      dataTooltipId: 'perspectiveNameInput'
                    }}
                    className={css.perspectiveNameInput}
                  />
                  <div>
                    <PerspectiveFilters formikProps={formikProps} />
                  </div>
                  <FlexExpander />
                  <Container padding="medium" background="grey100" className={css.proTipContainer}>
                    <Layout.Horizontal spacing="medium">
                      <img src={ProTipIcon} />
                      <Container>
                        <Text font="small">{getString('ce.perspectives.createPerspective.proTipText')}</Text>
                        <Layout.Horizontal
                          spacing="xlarge"
                          margin={{
                            top: 'medium'
                          }}
                        >
                          <Text font="small" color="primary7" className={css.linkText}>
                            {getString('ce.perspectives.createPerspective.createCustomField')}
                          </Text>
                          <Text font="small" color="primary7" className={css.linkText}>
                            {getString('ce.perspectives.createPerspective.learnMoreCustomField')}
                          </Text>
                        </Layout.Horizontal>
                      </Container>
                    </Layout.Horizontal>
                  </Container>
                  <Layout.Horizontal
                    padding={{
                      top: 'medium'
                    }}
                    spacing="large"
                  >
                    <Button icon="chevron-left" text={getString('ce.perspectives.createPerspective.prevButton')} />
                    <Button
                      icon="chevron-right"
                      intent="primary"
                      text={getString('ce.perspectives.createPerspective.prevButton')}
                    />
                  </Layout.Horizontal>
                </Layout.Vertical>
                <PerspectiveBuilderPreview
                  setGroupBy={(groupBy: QlceViewFieldInputInput) => {
                    formikProps.setFieldValue('viewVisualization.groupBy', groupBy)
                  }}
                  groupBy={formikProps.values.viewVisualization.groupBy}
                  chartType={formikProps.values.viewVisualization.chartType}
                  setChartType={(type: ViewChartType) => {
                    formikProps.setFieldValue('viewVisualization.chartType', type)
                  }}
                />
              </Container>
            </FormikForm>
          )
        }}
      />
    </Container>
  )
}

export default PerspectiveBuilder
