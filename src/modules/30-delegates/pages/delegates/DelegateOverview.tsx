import React from 'react'
import { Container, Text, FlexExpander } from '@wings-software/uicore'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import type { Delegate, DelegateProfile } from 'services/portal'
import { useStrings } from 'framework/strings'
import {
  SectionContainer,
  SectionContainerTitle,
  SectionLabelValuePair
} from '@delegates/components/SectionContainer/SectionContainer'

interface DelegateOverviewProps {
  delegate: Delegate
  delegateProfile: DelegateProfile
}

export const DelegateOverview: React.FC<DelegateOverviewProps> = ({ delegate, delegateProfile }) => {
  const { getString } = useStrings()

  return (
    <SectionContainer>
      <SectionContainerTitle>{getString('overview')}</SectionContainerTitle>

      <Container flex style={{ borderBottom: '0.5px solid #dce0e7' }}>
        <SectionLabelValuePair
          label={getString('delegate.hostName')}
          value={delegate.hostName}
          style={{ borderBottom: 'none' }}
        />

        <FlexExpander />

        <SectionLabelValuePair
          label={getString('delegate.delegateType')}
          value={
            <Text
              style={{ fontSize: '14px', color: 'var(--black)' }}
              icon={delegateTypeToIcon(delegate.delegateType as string)}
              iconProps={{ size: 21 }}
            >
              {delegate.delegateType}
            </Text>
          }
          style={{ borderBottom: 'none' }}
          ignoreLastElementStyling
        />
      </Container>

      <SectionLabelValuePair label={getString('delegate.delegateName')} value={delegate.delegateName} />

      <SectionLabelValuePair
        label={getString('delegate.delegateConfiguration')}
        value={
          <Text style={{ fontSize: '14px', lineHeight: '24px', color: '#25A6F7', letterSpacing: '-0.01px' }}>
            {delegateProfile.name}
          </Text>
        }
      />

      {delegate.description && <SectionLabelValuePair label={getString('description')} value={delegate.description} />}
    </SectionContainer>
  )
}
