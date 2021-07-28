import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container, Layout, Text, IconName, Color, FlexExpander, SimpleTagInput } from '@wings-software/uicore'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type {
  ProjectPathProps,
  ModulePathParams,
  DelegatePathProps,
  AccountPathProps
} from '@common/interfaces/RouteInterfaces'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import { useStrings } from 'framework/strings'
import { useGetDelegateGroupByIdentifier, useGetV2, DelegateProfile } from 'services/portal'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { SectionContainer } from '@delegates/components/SectionContainer/SectionContainer'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { DelegateOverview } from './DelegateOverview'
import css from './DelegateDetails.module.scss'

export default function DelegateDetails(): JSX.Element {
  const { delegateIdentifier, accountId, orgIdentifier, projectIdentifier, module } = useParams<
    Partial<ProjectPathProps & ModulePathParams> & DelegatePathProps & AccountPathProps
  >()
  const { getString } = useStrings()
  const { data } = useGetDelegateGroupByIdentifier({
    identifier: delegateIdentifier,
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const delegate = data?.resource

  const {
    loading,
    error,
    data: profileResponse,
    refetch
  } = useGetV2({
    delegateProfileId: delegate?.delegateConfigurationId || '',
    queryParams: { accountId }
  })

  const tags = Object.entries(delegate?.groupImplicitSelectors || {})
    .filter(tag => tag[1] !== 'PROFILE_SELECTORS')
    .map(tag => tag[0])
  const [newTags, setNewTags] = useState(tags)

  const delegateProfile = profileResponse?.resource as DelegateProfile
  const icon: IconName = delegateTypeToIcon(delegate?.delegateType as string)

  const renderTitle = (): React.ReactNode => {
    return (
      <Layout.Vertical spacing="small">
        <Layout.Horizontal spacing="small">
          <Link
            style={{ color: '#0092E4', fontSize: '12px' }}
            to={routes.toDelegates({
              accountId,
              orgIdentifier,
              projectIdentifier,
              module
            })}
          >
            {getString('delegate.delegates')}
          </Link>
          <span>/</span>
        </Layout.Horizontal>
        <Text style={{ fontSize: '20px', color: 'var(--black)' }} icon={icon} iconProps={{ size: 21 }}>
          {delegate?.groupName}
        </Text>
        <Text color={Color.GREY_400}>{delegate?.groupHostName}</Text>
        <Container>
          <TagsViewer tags={Object.keys(delegate?.groupImplicitSelectors || {})} style={{ background: '#CDF4FE' }} />
        </Container>
      </Layout.Vertical>
    )
  }

  if (loading) {
    return (
      <Container
        style={{
          position: 'fixed',
          top: '0',
          left: '270px',
          width: 'calc(100% - 270px)',
          height: '100%'
        }}
      >
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    return <Page.Error message={error.message} onClick={() => refetch()} />
  }

  const size = delegate?.sizeDetails

  return (
    <>
      <Container
        height={143}
        padding={{ top: 'large', right: 'xlarge', bottom: 'large', left: 'xlarge' }}
        style={{ backgroundColor: 'rgba(219, 241, 255, .46)' }}
      >
        {renderTitle()}
      </Container>
      <Page.Body className={css.main}>
        <Layout.Vertical>
          <Layout.Horizontal spacing="large">
            <Container className={css.cardContainer}>
              {delegate && delegateProfile && (
                <Layout.Vertical spacing="large" width={550}>
                  <DelegateOverview delegate={delegate} delegateProfile={delegateProfile} />
                  <SectionContainer style={{ paddingTop: 'var(--spacing-large)' }}>
                    <Container flex>
                      <div className={css.addSpacing}>
                        <Text style={{ margin: '0 0 var(--spacing-small) 0', color: '#4F4F4F', fontSize: '12px' }}>
                          {getString('delegate.delegateTags')}
                        </Text>
                        <Text font="small" style={{ lineHeight: '16px' }}>
                          {getString('delegate.delegateTagDescription')}
                        </Text>
                        <Text
                          font="small"
                          color="#4F4F4F"
                          style={{ lineHeight: '16px', padding: 'var(--spacing-small) 0' }}
                        >
                          {getString('delegate.delegateSpecificTags')}
                        </Text>
                        <SimpleTagInput
                          fill
                          openOnKeyDown={false}
                          showClearAllButton
                          showNewlyCreatedItemsInList={true}
                          allowNewTag
                          placeholder={getString('delegate.enterTags')}
                          selectedItems={newTags || []}
                          validateNewTag={tag => {
                            return !!tag // TODO: Note to Sahithi: Copy the logic from wingsui to check  for new profile tag
                          }}
                          items={newTags || []}
                          onChange={(selectedItems: string[]) => {
                            setNewTags(selectedItems)
                          }}
                        />
                        {!!delegateProfile?.selectors?.length && (
                          <Text
                            font="small"
                            color="#4F4F4F"
                            style={{ lineHeight: '16px', padding: 'var(--spacing-small) 0' }}
                          >
                            {getString('delegate.tagsFromDelegateConfig')}
                          </Text>
                        )}
                        <TagsViewer tags={delegateProfile?.selectors} />
                      </div>
                    </Container>
                  </SectionContainer>
                </Layout.Vertical>
              )}
            </Container>
            <SectionContainer width={398} height={150}>
              <Container flex>
                <Text color={Color.GREY_800} style={{ fontWeight: 600 }}>
                  {getString('delegate.delegateSizeLower')}
                </Text>
                <FlexExpander />
                <Text
                  style={{
                    background: '#CFB4FF',
                    borderRadius: '10px',
                    color: '#4D0B8F',
                    textAlign: 'center',
                    marginRight: 'var(--spacing-xxlarge)',
                    padding: '3px 34px',
                    fontWeight: 600
                  }}
                >
                  {size?.label}
                </Text>
              </Container>
              <Container flex style={{ marginTop: 'var(--spacing-xxlarge)' }}>
                <Layout.Horizontal style={{ flexGrow: 1, flexBasis: 0, justifyContent: 'space-around' }}>
                  <Text className={css.delegateMachineSpec}>
                    {getString('delegate.delegateMEM')}{' '}
                    <span>
                      {(Number(size?.ram) / 1000).toFixed(1)}
                      <span>GB</span>
                    </span>
                  </Text>
                  <Text className={css.delegateMachineSpec}>
                    {getString('delegate.delegateCPU')} <span>{size?.cpu}</span>
                  </Text>
                </Layout.Horizontal>
              </Container>
            </SectionContainer>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}
