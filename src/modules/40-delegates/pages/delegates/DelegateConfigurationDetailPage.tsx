import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { Button, Container, Layout, SimpleTagInput, Text, TextInput, useToggle } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import {
  SectionContainer,
  SectionContainerTitle,
  SectionLabelValuePair
} from '@delegates/components/SectionContainer/SectionContainer'
import { useStrings } from 'framework/exports'
import { PageSpinner } from '@common/components'
import { DelegateProfile, useGetDelegateConfigFromId } from 'services/portal'
import { useUpdateDelegateProfileNg } from 'services/cd-ng'
import { PageError } from '@common/components/Page/PageError'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { fullSizeContentStyle, EnvironmentType } from '@delegates/constants'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useToaster } from '@common/exports'
import { DelegateTab } from './utils/DelegateHelper'
import { DetailPageTemplate } from '../../components/DetailPageTemplate/DetailPageTemplate'
import css from './DelegateConfigurationDetailPage.module.scss'

// TODO: This field needs to be supported by profile API
// Place-holder for now until backend supports it
const ENVIRONMENT_TYPE_FIELD = 'environmentTypes'

export default function DelegateProfileDetails(): JSX.Element {
  const { getString } = useStrings()
  const { delegateConfigId, accountId } = useParams<Record<string, string>>()
  const { data, loading, refetch, error } = useGetDelegateConfigFromId({
    delegateProfileId: delegateConfigId,
    queryParams: { accountId }
  })

  const { showError, showSuccess } = useToaster()
  const profile = data?.resource
  const breadcrumbs = [
    {
      title: getString('resources'),
      url: routes.toResources({
        accountId
      })
    },
    {
      title: getString('delegate.delegates'),
      url: routes.toResourcesDelegates({
        accountId
      })
    },
    {
      title: getString('delegate.delegatesConfigurations'),
      url:
        routes.toResourcesDelegates({
          accountId
        }) + `?tab=${DelegateTab.CONFIGURATIONS}`
    }
  ]
  const [editMode, toggleEditMode] = useToggle(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const [formData, setFormData] = useState<DelegateProfile>({} as DelegateProfile)
  const LABEL_PROD = getString('production')
  const LABEL_NON_PROD = getString('nonProduction')
  const environmentTags: string[] = useMemo(() => {
    const types: string[] = get(formData, ENVIRONMENT_TYPE_FIELD, [])
    return types.map(type => {
      if (type === EnvironmentType.PROD) {
        return LABEL_PROD
      }
      return LABEL_NON_PROD
    })
  }, [formData, LABEL_PROD, LABEL_NON_PROD])

  const { mutate: updateConfiguration } = useUpdateDelegateProfileNg({
    queryParams: { accountId },
    delegateProfileId: delegateConfigId
  })

  const onEdit = async (profileData: DelegateProfile) => {
    setShowSpinner(true)
    const { uuid, name, description, primary, approvalRequired, startupScript, selectors } = profileData
    const response = await updateConfiguration({
      uuid,
      name,
      accountId,
      description,
      primary,
      approvalRequired,
      startupScript,
      scopingRules: [],
      selectors
    })
    setShowSpinner(false)
    if ((response as any)?.responseMessages.length) {
      const err = (response as any)?.responseMessages?.[0]?.message
      showError(err)
    } else {
      showSuccess(getString('delegate.successfullyUpdatedConfig'))
    }
  }

  const onValidate = (profileData: DelegateProfile) => {
    for (const key of Object.keys(profileData)) {
      if (key === 'name' && !profileData['name']) {
        showError(getString('delegate.configNameRequired'))
        return false
      }
    }

    return true
  }

  const toggleEditModeOrSave = useCallback(
    delConfig => {
      if (!editMode) {
        toggleEditMode()
      } else {
        if (onValidate(delConfig)) {
          onEdit(delConfig)

          toggleEditMode()
        }
      }
    },
    [editMode, toggleEditMode]
  )

  useEffect(() => {
    if (profile) {
      setFormData(profile)
    }
  }, [profile])

  useEffect(() => {
    const url = window.location.href

    if (url.includes('edit')) {
      toggleEditMode()
    }
  }, [])

  if (loading && !data) {
    return (
      <Container style={fullSizeContentStyle}>
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    return (
      <Container style={fullSizeContentStyle}>
        <PageError message={error.message} onClick={() => refetch()} />
      </Container>
    )
  }

  return (
    <>
      {showSpinner && <PageSpinner />}
      {!showSpinner && (
        <DetailPageTemplate
          breadcrumbs={breadcrumbs}
          title={profile?.name as string}
          subTittle={profile?.description}
          tags={profile?.selectors}
          headerExtras={
            <Button
              icon={editMode ? 'floppy-disk' : 'edit'}
              text={editMode ? getString('save') : getString('edit')}
              style={{
                position: 'absolute',
                top: '50px',
                right: '50px',
                color: 'var(--blue-500)',
                borderColor: 'var(--blue-500)'
              }}
              onClick={() => {
                toggleEditModeOrSave(formData)
              }}
            />
          }
        >
          <Container padding="xxlarge">
            <Layout.Horizontal spacing="large">
              <Layout.Vertical spacing="large" width={400}>
                <SectionContainer>
                  <SectionContainerTitle>{getString('overview')}</SectionContainerTitle>

                  {/* Name */}
                  <SectionLabelValuePair
                    label={getString('delegate.CONFIGURATION_NAME')}
                    value={
                      editMode ? (
                        <TextInput
                          autoFocus
                          defaultValue={profile?.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData({ ...formData, name: e.target.value } as DelegateProfile)
                          }}
                        />
                      ) : (
                        profile?.name
                      )
                    }
                  />

                  {/* Description */}
                  {!editMode && profile?.description && (
                    <SectionLabelValuePair label={getString('description')} value={formData.description} />
                  )}
                  {editMode && (
                    <SectionLabelValuePair
                      label={getString('description')}
                      value={
                        <TextInput
                          defaultValue={formData.description}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData({ ...formData, description: e.target.value } as DelegateProfile)
                          }}
                        />
                      }
                    />
                  )}

                  {/* Identifier */}
                  <SectionLabelValuePair
                    label={getString('identifier')}
                    value={
                      editMode ? (
                        <TextInput disabled defaultValue={get(profile, 'identifier') || profile?.uuid} />
                      ) : (
                        get(profile, 'identifier') || profile?.uuid
                      )
                    }
                  />

                  {/* Tags */}
                  {!editMode && profile?.selectors && (
                    <SectionLabelValuePair
                      label={getString('tagsLabel')}
                      value={<TagsViewer tags={formData.selectors || []} />}
                    />
                  )}
                  {editMode && (
                    <SectionLabelValuePair
                      label={getString('tagsLabel')}
                      value={
                        <SimpleTagInput
                          fill
                          openOnKeyDown={false}
                          showClearAllButton
                          showNewlyCreatedItemsInList={true}
                          allowNewTag
                          placeholder={getString('delegate.enterTags')}
                          selectedItems={formData.selectors || []}
                          validateNewTag={tag => {
                            return !!tag // TODO: Note to Sahithi: Copy the logic from wingsui to check  for new profile tag
                          }}
                          items={formData.selectors || []}
                          onChange={(selectedItems, _createdItems, _items) => {
                            setFormData({ ...formData, selectors: selectedItems as string[] })
                          }}
                        />
                      }
                    />
                  )}
                </SectionContainer>

                <SectionContainer>
                  <SectionContainerTitle>{getString('delegate.Scope')}</SectionContainerTitle>
                  <Text style={{ fontSize: '14px', color: '#22272D', lineHeight: '24px', fontWeight: 500 }}>
                    {getString('delegate.ScopeDescription')}
                  </Text>

                  {/* TODO: EnvironmentTypes, still needs backend support */}
                  <SectionLabelValuePair
                    label={getString('delegate.envTypes')}
                    value={
                      editMode ? (
                        <SimpleTagInput
                          fill
                          showClearAllButton
                          placeholder={getString('delegate.selectEnvType')}
                          selectedItems={environmentTags}
                          items={[LABEL_PROD, LABEL_NON_PROD]}
                          onChange={(selectedItems, _createdItems, _items) => {
                            setFormData({
                              ...formData,
                              [ENVIRONMENT_TYPE_FIELD]: selectedItems.map(item =>
                                item === LABEL_PROD ? EnvironmentType.PROD : EnvironmentType.NON_PROD
                              )
                            } as DelegateProfile)
                          }}
                        />
                      ) : (
                        <TagsViewer tags={environmentTags} />
                      )
                    }
                  />

                  {/* TODO: Environments, needs backend support */}
                  <SectionLabelValuePair
                    label={getString('environments')}
                    value={
                      editMode ? (
                        <SimpleTagInput
                          fill
                          showClearAllButton
                          placeholder={getString('delegate.selectEnvs')}
                          selectedItems={[]}
                          items={[]}
                          // onChange={(selectedItems, createdItems, items) => {
                          //   console.log('onChange', { selectedItems, createdItems, items })
                          // }}
                        />
                      ) : (
                        <TagsViewer tags={[]} />
                      )
                    }
                  />
                </SectionContainer>
              </Layout.Vertical>
              <SectionContainer width={550}>
                <SectionContainerTitle>{getString('delegate.Init_Script')}</SectionContainerTitle>

                <textarea
                  placeholder={editMode ? getString('delegate.initScriptPlaceholder') : undefined}
                  className={css.codeEditor}
                  {...(editMode ? undefined : { disabled: true })}
                  value={formData?.startupScript || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setFormData({ ...formData, startupScript: e.target.value } as DelegateProfile)
                  }}
                />
              </SectionContainer>
            </Layout.Horizontal>
          </Container>
        </DetailPageTemplate>
      )}
    </>
  )
}
