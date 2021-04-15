import React from 'react'
import { Layout, Tabs, Tab } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/exports'
import { MinutesTab, HourlyTab, DailyTab, WeeklyTab, MonthlyTab, YearlyTab, CustomTab } from './subviews'
import { scheduleTabsId, getDefaultExpressionBreakdownValues } from './subviews/ScheduleUtils'
import css from './SchedulePanel.module.scss'
interface SchedulePanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const SchedulePanel: React.FC<SchedulePanelPropsInterface> = ({
  formikProps: {
    values: { selectedScheduleTab },
    values
  },
  formikProps,
  isEdit = false
}): JSX.Element => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical className={cx(css.schedulePanelContainer)} spacing="large" padding="xxlarge">
      <h2 className={css.heading}>{getString('pipeline-triggers.schedulePanel.title')}</h2>
      <Tabs
        id="Wizard"
        onChange={(val: string) => {
          const newDefaultValues = selectedScheduleTab !== val ? getDefaultExpressionBreakdownValues(val) : {}
          formikProps.setValues({ ...values, ...newDefaultValues, selectedScheduleTab: val })
        }}
        defaultSelectedTabId={selectedScheduleTab}
      >
        {!isEdit && (
          <Tab
            id={scheduleTabsId.MINUTES}
            title={getString('pipeline-triggers.schedulePanel.minutesLabel')}
            panel={<MinutesTab formikProps={formikProps} />}
          />
        )}
        {!isEdit && (
          <Tab
            id={scheduleTabsId.HOURLY}
            title={getString('pipeline-triggers.schedulePanel.hourlyTabTitle')}
            panel={<HourlyTab formikProps={formikProps} />}
          />
        )}
        {!isEdit && (
          <Tab
            id={scheduleTabsId.DAILY}
            title={getString('pipeline-triggers.schedulePanel.dailyTabTitle')}
            panel={<DailyTab formikProps={formikProps} />}
          />
        )}
        {!isEdit && (
          <Tab
            id={scheduleTabsId.WEEKLY}
            title={getString('pipeline-triggers.schedulePanel.weeklyTabTitle')}
            panel={<WeeklyTab formikProps={formikProps} />}
          />
        )}
        {!isEdit && (
          <Tab
            id={scheduleTabsId.MONTHLY}
            title={getString('pipeline-triggers.schedulePanel.monthlyTabTitle')}
            panel={<MonthlyTab formikProps={formikProps} />}
          />
        )}
        {!isEdit && (
          <Tab
            id={scheduleTabsId.YEARLY}
            title={getString('pipeline-triggers.schedulePanel.yearlyTabTitle')}
            panel={<YearlyTab formikProps={formikProps} />}
          />
        )}
        <Tab
          id={scheduleTabsId.CUSTOM}
          title={getString('common.repo_provider.customLabel')}
          panel={<CustomTab formikProps={formikProps} />}
        />
      </Tabs>
    </Layout.Vertical>
  )
}
export default SchedulePanel
