import React from 'react'
import { Text, Container, HarnessDocTooltip } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { scheduleTabsId, isCronValid } from './ScheduleUtils'
import css from './Expression.module.scss'

interface ExpressionInterface {
  formikProps: any
}

export default function Expression(props: ExpressionInterface): JSX.Element {
  const {
    formikProps: {
      values: { expression, selectedScheduleTab }
    }
  } = props
  const { getString } = useStrings()
  const showError = selectedScheduleTab === scheduleTabsId.CUSTOM && !isCronValid(expression)
  return (
    <Container data-name="expression" className={css.expression}>
      <Text className={css.label} data-tooltip-id="cronExpression">
        {getString('pipeline.triggers.schedulePanel.cronExpression')}
        <HarnessDocTooltip tooltipId="cronExpression" useStandAlone={true} />
      </Text>
      <Container className={cx(css.field, (showError && css.errorField) || '')}>
        <Text>{expression}</Text>
      </Container>
    </Container>
  )
}
