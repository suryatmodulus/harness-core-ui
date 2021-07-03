import React from 'react'
import { Formik, FormikForm, Container, Text, FormInput, Layout, FlexExpander, Button } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
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
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import routes from '@common/RouteDefinitions'
import { PageSpinner } from '@common/components'
import PerspectiveFilters from '../PerspectiveFilters'
import PerspectiveBuilderPreview from '../PerspectiveBuilderPreview/PerspectiveBuilderPreview'
import ProTipIcon from './images/pro-tip.svg'
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

const PerspectiveBuilder: React.FC<{ perspectiveData?: CEView }> = () => {
  const { getString } = useStrings()
  const history = useHistory()

  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()

  const { mutate: createView, loading } = useUpdatePerspective({
    queryParams: {
      accountId: accountId
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
          item.viewConditions.forEach(x => delete x.viewField.identifierName)
        }
      })
      apiObject.viewRules = apiObject.viewRules.filter(x => x !== null)
    } else {
      apiObject['viewRules'] = []
    }

    delete apiObject.viewVisualization.groupBy.identifierName

    const response = await createView(apiObject as CEView)

    const perspectiveName = response.resource?.name || perspectiveId

    history.push(
      routes.toPerspectiveDetails({
        accountId,
        perspectiveId,
        perspectiveName: perspectiveName
      })
    )

    // const { status } = res
    // if (status === 200) {
    //   const apiRes = res.response as any
    // const viewId = apiRes.uuid
    // const viewName = apiRes.name
    // const groupBy = apiRes.viewVisualization.groupBy
    // const timeRange = apiRes.viewTimeRange.viewTimeRangeType
    // const chartType = apiRes.viewVisualization.chartType

    // router.push({
    //   pathname: path.toCloudViewsExplorer({
    //     accountId,
    //     viewId,
    //     viewName
    //   }),
    //   query: {
    //     defaultGroupBy: queryString.stringify(groupBy),
    //     defaultTimeRange: timeRange,
    //     chartType: chartType
    //   }
    // })
    // } else {
    // Show Error here
    // toaster.showError({ message: res.error, timeout: TOASTER_TIMEOUT })
    // }
  }

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
                <Layout.Vertical spacing="medium" height="100%" padding={{ left: 'huge', right: 'xxlarge' }}>
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
