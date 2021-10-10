import React from 'react'
import { useParams, NavLink } from 'react-router-dom'
import { Container, Text, FlexExpander, FontVariation } from '@wings-software/uicore'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import routes from '@common/RouteDefinitions'
import type {
  DelegateConfigProps,
  ProjectPathProps,
  ModulePathParams,
  AccountPathProps
} from '@common/interfaces/RouteInterfaces'
import type { DelegateGroupDetails, DelegateProfile } from 'services/portal'
import { useStrings } from 'framework/strings'
import {
  SectionContainer,
  SectionContainerTitle,
  SectionLabelValuePair
} from '@delegates/components/SectionContainer/SectionContainer'

import css from './DelegateDetails.module.scss'

interface DelegateOverviewProps {
  delegate: DelegateGroupDetails
  delegateProfile: DelegateProfile
}

export const DelegateOverview: React.FC<DelegateOverviewProps> = ({ delegate, delegateProfile }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<
    Partial<DelegateConfigProps & ProjectPathProps & ModulePathParams> & AccountPathProps
  >()

  const tags = Object.entries(delegate?.groupImplicitSelectors || {})
    .filter(([, tag]) => tag !== 'PROFILE_SELECTORS')
    .map(([tag]) => tag)

  return (
    <SectionContainer>
      <SectionContainerTitle>{getString('overview')}</SectionContainerTitle>

      <Container className={css.delegateDetailsContainer}>
        <Container flex style={{ borderBottom: '0.5px solid #dce0e7' }}>
          <SectionLabelValuePair
            label={getString('delegate.hostName')}
            value={delegate.groupHostName || getString('na')}
            style={{ borderBottom: 'none' }}
          />

          <FlexExpander />

          <SectionLabelValuePair
            label={getString('delegate.delegateType')}
            value={
              <Text
                style={{ color: 'var(--black)' }}
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

        <SectionLabelValuePair label={getString('delegate.delegateName')} value={delegate.groupName} />

        <SectionLabelValuePair
          label={getString('delegates.delegateIdentifier')}
          value={delegate.delegateGroupIdentifier}
        />

        <SectionLabelValuePair
          label={getString('delegate.delegateConfiguration')}
          value={
            <NavLink
              to={routes.toDelegateConfigsDetails({
                accountId,
                delegateConfigIdentifier: delegateProfile.identifier as string,
                orgIdentifier,
                projectIdentifier,
                module
              })}
            >
              <Text font={{ variation: FontVariation.BODY }}>{delegateProfile.name}</Text>
            </NavLink>
          }
        />

        {delegate.delegateDescription && (
          <SectionLabelValuePair label={getString('description')} value={delegate.delegateDescription} />
        )}

        <SectionLabelValuePair
          label={getString('delegate.delegateSize')}
          value={
            delegate.sizeDetails?.cpu +
            getString('delegate.delegateCPU') +
            ', ' +
            (delegate.sizeDetails?.ram ? delegate.sizeDetails.ram / 1024 : '') +
            getString('delegates.GBRam')
          }
        />
      </Container>

      <Container className={css.tagsContainer}>
        <Text className={css.tagTitle} font={{ variation: FontVariation.BODY }}>
          {getString('delegate.delegateTags')}
        </Text>
        <Container flex>
          <TagsViewer tags={tags} />
        </Container>
      </Container>
      {!!delegateProfile?.selectors?.length && (
        <Container className={css.tagsContainer}>
          {!!delegateProfile?.selectors?.length && (
            <Text className={css.tagTitle} font={{ variation: FontVariation.BODY }}>
              {getString('delegate.tagsFromDelegateConfig')}
            </Text>
          )}
          <TagsViewer tags={delegateProfile?.selectors} />
        </Container>
      )}
    </SectionContainer>
  )
}
