import React from 'react'
import { Color, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import testReportEmptyState from './images/test_report_empty_state.svg'
import css from './BuildTests.module.scss'

export const BuildZeroState: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical className={css.loadingContainer}>
      <img src={testReportEmptyState} />
      <Text color={Color.GREY_600} style={{ fontSize: '20px', fontWeight: 600 }} padding={{ top: 'medium' }}>
        {getString('pipeline.testsReports.noTestResults')}
      </Text>
      <Text style={{ fontSize: '16px' }} padding={{ top: 'xsmall', bottom: 'large' }}>
        {getString('pipeline.testsReports.testsWillAppear')}
      </Text>
      <a target="_blank" rel="noreferrer" href="https://ngdocs.harness.io/category/zkhvfo7uc6-ci-how-tos">
        <Text
          style={{ fontSize: '16px' }}
          color={Color.PRIMARY_6}
          rightIcon="main-share"
          rightIconProps={{ color: Color.PRIMARY_6 }}
          flex={{ align: 'center-center' }}
        >
          {getString('learnMore')}
        </Text>
      </a>
    </Layout.Vertical>
  )
}
