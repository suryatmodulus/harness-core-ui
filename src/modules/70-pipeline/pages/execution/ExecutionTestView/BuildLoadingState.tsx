import React from 'react'
import { Icon, Layout, Text, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './BuildTests.module.scss'

export const BuildLoadingState: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical className={css.loadingContainer}>
      <Icon name="report-gear-grey" size={100} style={{ margin: '0 auto', paddingBottom: 'var(--spacing-xxlarge)' }} />

      <Text color={Color.GREY_600} style={{ fontSize: '20px', fontWeight: 600 }} padding={{ top: 'medium' }}>
        {getString('pipeline.testsReports.noTestResults')}
      </Text>
      <Text style={{ fontSize: '16px' }} padding={{ top: 'xsmall', bottom: 'large' }}>
        {getString('pipeline.testsReports.willBeDisplayedIfAvailable')}
      </Text>
      <a target="_blank" rel="noreferrer" href="https://docs.harness.io">
        <Text
          style={{ fontSize: '16px' }}
          color={Color.PRIMARY_6}
          rightIcon="main-share"
          rightIconProps={{ color: Color.PRIMARY_6 }}
          flex={{ align: 'center-center' }}
        >
          {getString('learnMore')}
        </Text>{' '}
      </a>
    </Layout.Vertical>
  )
}
