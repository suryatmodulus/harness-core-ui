import React from 'react'
import { Icon, Color, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import testReportEmptyState from './images/test_report_empty_state.svg'
import css from './BuildTests.module.scss'

interface BuildZeroStateProps {
  isLoading?: boolean
}

const ciHowTos = 'https://ngdocs.harness.io/category/zkhvfo7uc6-ci-how-tos'
const harnessDocs = 'https://docs.harness.io'

export const BuildZeroState: React.FC<BuildZeroStateProps> = props => {
  const { getString } = useStrings()
  const { isLoading = false } = props
  return (
    <Layout.Vertical className={css.loadingContainer}>
      {isLoading && (
        <Icon
          name="report-gear-grey"
          size={100}
          style={{ margin: '0 auto', paddingBottom: 'var(--spacing-xxlarge)' }}
        />
      )}
      {!isLoading && <img src={testReportEmptyState} alt="" />}
      <Text color={Color.GREY_600} style={{ fontSize: '20px', fontWeight: 600 }} padding={{ top: 'medium' }}>
        {isLoading
          ? getString('pipeline.testsReports.willBeDisplayedIfAvailable')
          : getString('pipeline.testsReports.noTestResults')}
      </Text>
      <Text style={{ fontSize: '16px' }} padding={{ top: 'xsmall', bottom: 'large' }}>
        {!isLoading && getString('pipeline.testsReports.testsWillAppear')}
      </Text>
      <a target="_blank" rel="noreferrer" href={isLoading ? harnessDocs : ciHowTos}>
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
