import React from 'react'
import { Icon, Layout, Link, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import css from './BuildTests.module.scss'

export const BuildLoadingState: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical className={css.loadingContainer}>
      <Icon name="report-gear-grey" size={100} style={{ margin: '0 auto', paddingBottom: 'var(--spacing-xxlarge)' }} />

      <Text font={{ size: 'medium' }} padding={{ top: 'medium' }}>
        {getString('ci.testsReports.nothing')}
      </Text>
      <Text padding={{ top: 'xsmall', bottom: 'large' }}>
        {getString('ci.testsReports.willBeDisplayedIfAvailable')}
      </Text>
      <Link target="_blank" href="https://docs.harness.io">
        {getString('ci.testsReports.learnMore')}
      </Link>
    </Layout.Vertical>
  )
}
