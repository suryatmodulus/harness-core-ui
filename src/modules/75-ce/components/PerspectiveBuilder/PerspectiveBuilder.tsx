import React from 'react'
import { Formik, FormikForm, Container, FormInput, Layout, FlexExpander, Button, Heading } from '@wings-software/uicore'
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { useParams, useHistory } from 'react-router-dom'
import * as Yup from 'yup'
import { useUpdatePerspective, CEView } from 'services/ce'
import {
  QlceViewRuleInput,
  QlceViewFieldInputInput,
  ViewChartType,
  ViewTimeRangeType,
  QlceViewTimeGroupType
} from 'services/ce/services'
import { useStrings } from 'framework/strings'
import type { ViewIdCondition } from 'services/ce/'
import { useToaster } from '@common/components'
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import { PageSpinner } from '@common/components'
import PerspectiveFilters from '../PerspectiveFilters'
import PerspectiveBuilderPreview from '../PerspectiveBuilderPreview/PerspectiveBuilderPreview'
// import ProTipIcon from './images/pro-tip.svg'
import css from './PerspectiveBuilder.module.scss'

export const CREATE_CALL_OBJECT = {
  viewVersion: 'v1',
  viewTimeRange: {
    viewTimeRangeType: ViewTimeRangeType.Last_7
  },
  viewType: 'CUSTOMER',
  viewVisualization: {
    granularity: QlceViewTimeGroupType.Day
  }
}

export interface PerspectiveFormValues {
  name: string
  viewRules?: QlceViewRuleInput[]
  viewVisualization: {
    groupBy: QlceViewFieldInputInput
    chartType: ViewChartType
  }
}

const PerspectiveBuilder: React.FC<{ perspectiveData?: CEView; onNext: (resource: CEView) => void }> = props => {
  const { getString } = useStrings()
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()
  const history = useHistory()
  const { showError } = useToaster()

  const { perspectiveData } = props

  const { mutate: createView, loading } = useUpdatePerspective({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const makeCreateCall: (value: CEView) => void = async values => {
    const apiObject = {
      ...CREATE_CALL_OBJECT,
      ...values,
      viewState: 'DRAFT',
      viewType: 'CUSTOMER',
      uuid: perspectiveId
    }

    if (apiObject.viewRules) {
      apiObject.viewRules.forEach((item, index) => {
        if (item?.viewConditions && item.viewConditions.length === 0 && apiObject.viewRules) {
          delete apiObject.viewRules[index]
        } else if (item.viewConditions) {
          item.viewConditions.forEach(x => {
            const viewFieldObj = x as ViewIdCondition
            if (viewFieldObj.viewField?.identifierName) {
              delete viewFieldObj.viewField.identifierName
            }
          })
        }
      })
      apiObject.viewRules = apiObject.viewRules.filter(x => x !== null)
    } else {
      apiObject['viewRules'] = []
    }

    try {
      const { resource } = await createView(apiObject as CEView)
      if (resource) {
        props.onNext(resource)
      }
    } catch (err) {
      const errMessage = err.data.message
      showError(errMessage)
    }
  }

  const goBack: () => void = () => {
    history.goBack()
  }

  const dateLabelToDisplayText: Record<string, string> = {
    [ViewTimeRangeType.Last_7]: getString('ce.perspectives.timeRangeConstants.last7Days'),
    [ViewTimeRangeType.Last_30]: getString('projectsOrgs.landingDashboard.last30Days'),
    [ViewTimeRangeType.LastMonth]: getString('ce.perspectives.timeRangeConstants.lastMonth')
  }

  const ViewTimeRange = [
    {
      value: ViewTimeRangeType.Last_7,
      label: dateLabelToDisplayText[ViewTimeRangeType.Last_7]
    },
    {
      value: ViewTimeRangeType.Last_30,
      label: dateLabelToDisplayText[ViewTimeRangeType.Last_30]
    },
    {
      value: ViewTimeRangeType.LastMonth,
      label: dateLabelToDisplayText[ViewTimeRangeType.LastMonth]
    }
  ]

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
            })
          })
        )
      })
    )
  })

  return (
    <Container className={css.mainContainer}>
      {loading && <PageSpinner />}
      <Formik<CEView>
        formName="createPerspective"
        initialValues={{
          name: perspectiveData?.name,
          viewVisualization: {
            groupBy: perspectiveData?.viewVisualization?.groupBy || DEFAULT_GROUP_BY,
            chartType: perspectiveData?.viewVisualization?.chartType || ViewChartType.StackedLineChart
          },
          viewTimeRange: {
            viewTimeRangeType: perspectiveData?.viewTimeRange?.viewTimeRangeType || ViewTimeRangeType.Last_7
          },
          viewRules: perspectiveData?.viewRules || []
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
                <Layout.Vertical
                  spacing="medium"
                  height="100%"
                  className={css.builderContainer}
                  padding={{ left: 'large', right: 'xxlarge', bottom: 'xxlarge', top: 'xxlarge' }}
                >
                  <Heading color="grey800" margin={{ bottom: 'large' }} level={5}>
                    {getString('ce.perspectives.createPerspective.title')}
                  </Heading>
                  <Layout.Horizontal>
                    <FormInput.Text
                      name="name"
                      label={getString('ce.perspectives.createPerspective.nameLabel')}
                      placeholder={getString('ce.perspectives.createPerspective.name')}
                      tooltipProps={{
                        dataTooltipId: 'perspectiveNameInput'
                      }}
                      className={css.perspectiveNameInput}
                    />
                    <FlexExpander />
                    <Popover
                      position={Position.BOTTOM_LEFT}
                      modifiers={{
                        arrow: { enabled: false },
                        flip: { enabled: true },
                        keepTogether: { enabled: true },
                        preventOverflow: { enabled: true }
                      }}
                      content={
                        <Menu>
                          {ViewTimeRange.map(timeRange => (
                            <MenuItem
                              onClick={() => {
                                formikProps.setFieldValue('viewTimeRange.viewTimeRangeType', timeRange.value)
                              }}
                              text={timeRange.label}
                              key={timeRange.value}
                            />
                          ))}
                        </Menu>
                      }
                    >
                      <Button
                        minimal
                        text={
                          formikProps.values.viewTimeRange?.viewTimeRangeType
                            ? dateLabelToDisplayText[formikProps.values.viewTimeRange?.viewTimeRangeType]
                            : 'Select Time Range'
                        }
                        rightIcon="calendar"
                      />
                    </Popover>
                  </Layout.Horizontal>

                  <div>
                    <PerspectiveFilters formikProps={formikProps} />
                  </div>
                  <FlexExpander />

                  {/* 
                    this block is commented out, we will uncomment it once custom fields are Done
                    
                  {<Container padding="medium" background="grey100" className={css.proTipContainer}>
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
                  </Container>} */}
                  <Layout.Horizontal
                    padding={{
                      top: 'medium'
                    }}
                    spacing="large"
                  >
                    <Button
                      icon="chevron-left"
                      text={getString('ce.perspectives.createPerspective.prevButton')}
                      onClick={goBack}
                    />
                    <Button
                      icon="chevron-right"
                      intent="primary"
                      disabled={!!Object.keys(formikProps.errors).length}
                      text={getString('ce.perspectives.createPerspective.nextButton')}
                      onClick={() => {
                        makeCreateCall(formikProps.values)
                      }}
                    />
                  </Layout.Horizontal>
                </Layout.Vertical>
                <PerspectiveBuilderPreview
                  setGroupBy={(groupBy: QlceViewFieldInputInput) => {
                    formikProps.setFieldValue('viewVisualization.groupBy', groupBy)
                  }}
                  formValues={formikProps.values}
                  groupBy={formikProps?.values?.viewVisualization?.groupBy as any}
                  chartType={formikProps?.values?.viewVisualization?.chartType as any}
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
