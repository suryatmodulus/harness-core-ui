import React from 'react'
import { Card, Color, FontVariation, FormInput, Heading, Icon, Layout, Text, Container } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import SLOTargetChartWrapper from '@cv/pages/slos/components/SLOTargetChart/SLOTargetChart'
import {
  getPeriodLengthOptions,
  getPeriodLengthOptionsForRolling,
  getPeriodTypeOptions,
  getWindowEndOptionsForMonth,
  getWindowEndOptionsForWeek,
  getErrorBudget,
  getCustomOptionsForSLOTargetChart,
  convertSLOFormDataToServiceLevelIndicatorDTO
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.utils'
import {
  SLOTargetAndBudgetPolicyProps,
  PeriodTypes,
  PeriodLengthTypes,
  SLOFormFields
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import SLOTargetContextualHelpText from './components/SLOTargetContextualHelpText'
import css from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.module.scss'

// SONAR recommendation
const flexStart = 'flex-start'

const SLOTargetAndBudgetPolicy: React.FC<SLOTargetAndBudgetPolicyProps> = ({ children, formikProps }) => {
  const { getString } = useStrings()
  const { periodType, periodLengthType } = formikProps.values

  return (
    <>
      <Heading level={2} font={{ variation: FontVariation.FORM_TITLE }} margin={{ bottom: 'xsmall' }}>
        {getString('cv.slos.sloTargetAndBudget.setSLOTarget')}
      </Heading>
      <Card className={css.card}>
        <Layout.Horizontal flex={{ justifyContent: flexStart, alignItems: flexStart }}>
          <Container width="50%" border={{ right: true }}>
            <Layout.Vertical width="100%">
              <Heading
                level={4}
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                margin={{ top: 'small', bottom: 'medium' }}
              >
                {getString('cv.slos.sloTargetAndBudget.complianceTimePeriodTitle')}
              </Heading>
              <Layout.Horizontal spacing="medium">
                <FormInput.Select
                  name={SLOFormFields.PERIOD_TYPE}
                  label={getString('cv.slos.sloTargetAndBudget.periodType')}
                  items={getPeriodTypeOptions(getString)}
                />
                {periodType === PeriodTypes.CALENDAR ? (
                  <>
                    <FormInput.Select
                      name={SLOFormFields.PERIOD_LENGTH_TYPE}
                      label={getString('cv.periodLength')}
                      items={getPeriodLengthOptions(getString)}
                    />
                    {periodLengthType === PeriodLengthTypes.MONTHLY && (
                      <FormInput.Select
                        name={SLOFormFields.DAY_OF_MONTH}
                        label={getString('cv.windowEndsDay')}
                        items={getWindowEndOptionsForMonth()}
                        disabled={!periodLengthType}
                      />
                    )}
                    {periodLengthType === PeriodLengthTypes.WEEKLY && (
                      <FormInput.Select
                        name={SLOFormFields.DAY_OF_WEEK}
                        label={getString('cv.widowEnds')}
                        items={getWindowEndOptionsForWeek(getString)}
                        disabled={!periodLengthType}
                      />
                    )}
                  </>
                ) : (
                  <FormInput.Select
                    name={SLOFormFields.PERIOD_LENGTH}
                    label={getString('cv.periodLengthDays')}
                    items={getPeriodLengthOptionsForRolling()}
                  />
                )}
              </Layout.Horizontal>

              <FormInput.Text
                name={SLOFormFields.SLO_TARGET_PERCENTAGE}
                label={getString('cv.SLOTarget')}
                inputGroup={{
                  type: 'number',
                  min: 0,
                  max: 100,
                  rightElement: <Icon name="percentage" padding="small" />
                }}
                className={css.sloTarget}
              />
              <Layout.Horizontal spacing="xxxlarge" flex={{ alignItems: flexStart, justifyContent: flexStart }}>
                <Container width={450}>
                  <SLOTargetChartWrapper
                    customChartOptions={getCustomOptionsForSLOTargetChart(formikProps.values)}
                    monitoredServiceIdentifier={formikProps.values.monitoredServiceRef}
                    serviceLevelIndicator={convertSLOFormDataToServiceLevelIndicatorDTO(formikProps.values)}
                    bottomLabel={
                      <Text
                        color={Color.GREY_500}
                        font={{ variation: FontVariation.SMALL_SEMI }}
                        margin={{ top: 'large', left: 'xxxlarge' }}
                        icon="symbol-square"
                        iconProps={{ color: Color.PRIMARY_4 }}
                      >
                        {getString('cv.SLIMetricRatio')}
                      </Text>
                    }
                  />
                </Container>

                <Container height={180} background={Color.GREY_100} padding="medium" className={css.errorBudget}>
                  <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_600}>
                    {getString('cv.errorBudget')}
                  </Text>
                  <Heading inline level={1} font={{ variation: FontVariation.DISPLAY2 }}>
                    {getErrorBudget(formikProps.values)}
                  </Heading>
                  <Text inline font={{ variation: FontVariation.FORM_SUB_SECTION }}>
                    {getString('cv.mins')}
                  </Text>
                </Container>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Container>
          <Container className={css.contextualHelp} width="50%" padding={{ left: 'large', right: 'large' }}>
            <SLOTargetContextualHelpText />
          </Container>
        </Layout.Horizontal>
      </Card>
      {children}
    </>
  )
}

export default SLOTargetAndBudgetPolicy
