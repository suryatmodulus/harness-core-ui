import React, { ReactElement } from 'react'
import { FlexExpander, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ListingPageTitle } from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import SectionToggle from '@cf/components/SectionToggle/SectionToggle'
import { CFEnvironmentSelect } from '@cf/components/CFEnvironmentSelect/CFEnvironmentSelect'

const TargetManagementHeader = ({
  environmentSelect,
  hasEnvironments
}: {
  environmentSelect: ReactElement
  hasEnvironments: boolean
}): ReactElement => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal flex={{ align: 'center-center' }} style={{ flexGrow: 1 }} padding={{ right: 'xlarge' }}>
      <ListingPageTitle style={{ borderBottom: 'none' }}>{getString('cf.shared.targetManagement')}</ListingPageTitle>
      <FlexExpander />
      <SectionToggle />
      <FlexExpander />
      {hasEnvironments ? (
        <CFEnvironmentSelect component={environmentSelect} />
      ) : (
        <div data-testid="CFTargetManagementHeaderSpacer" style={{ width: '325px' }} />
      )}
    </Layout.Horizontal>
  )
}

export default TargetManagementHeader
