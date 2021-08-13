import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, SimpleTagInput, TextInput, useToggle } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import {
  SectionContainer,
  SectionContainerTitle,
  SectionLabelValuePair
} from '@delegates/components/SectionContainer/SectionContainer'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components'
import type {
  DelegateConfigProps,
  ProjectPathProps,
  ModulePathParams,
  AccountPathProps
} from '@common/interfaces/RouteInterfaces'
import { useUpdateDelegateConfigNgV2, useGetDelegateConfigNgV2, DelegateProfileDetailsNg } from 'services/cd-ng'
import type { ScopingRuleDetails } from 'services/portal'
import { PageError } from '@common/components/Page/PageError'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { fullSizeContentStyle } from '@delegates/constants'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useToaster } from '@common/exports'
import DelegateConfigScopeEdit from '@delegates/components/DelegateConfigScope/DelegateConfigScopeEdit'
import DelegateConfigScopePreview from '@delegates/components/DelegateConfigScope/DelegateConfigScopePreview'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { DelegateTab } from './utils/DelegateHelper'
import { DetailPageTemplate } from '../../components/DetailPageTemplate/DetailPageTemplate'
import css from './DelegateConfigurationDetailPage.module.scss'

export default function DelegateProfileDetails(): JSX.Element {
  const { getString } = useStrings()
  const [scopingRules, setScopingRules] = useState([] as ScopingRuleDetails[])
  const { delegateConfigIdentifier, accountId, orgIdentifier, projectIdentifier, module } = useParams<
    Partial<ProjectPathProps & ModulePathParams> & AccountPathProps & DelegateConfigProps
  >()
  const { data, loading, refetch, error } = useGetDelegateConfigNgV2({
    accountId,
    delegateConfigIdentifier,
    queryParams: { orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const { showError, showSuccess } = useToaster()
  const profile = data?.resource
  useEffect(() => {
    if (profile) {
      setScopingRules(profile?.scopingRules || [])
    }
  }, [profile])
  const breadcrumbs = [
    {
      title: getString('delegate.delegates'),
      url: routes.toDelegates({
        accountId,
        orgIdentifier,
        projectIdentifier,
        module
      })
    },
    {
      title: getString('delegate.delegatesConfigurations'),
      url:
        routes.toDelegates({
          accountId,
          orgIdentifier,
          projectIdentifier,
          module
        }) + `?tab=${DelegateTab.CONFIGURATIONS}`
    }
  ]
  const [editMode, toggleEditMode] = useToggle(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const [formData, setFormData] = useState<DelegateProfileDetailsNg>({} as DelegateProfileDetailsNg)

  const { mutate: updateConfiguration } = useUpdateDelegateConfigNgV2({
    accountId,
    delegateConfigIdentifier,
    queryParams: { orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const onEdit = async (profileData: DelegateProfileDetailsNg) => {
    setShowSpinner(true)
    const { uuid, name, description, primary, approvalRequired, startupScript, selectors } = profileData
    let response
    try {
      response = await updateConfiguration({
        uuid,
        name,
        accountId,
        description,
        primary,
        approvalRequired,
        startupScript,
        scopingRules: scopingRules,
        selectors
      })
      if ((response as any)?.responseMessages.length) {
        const err = (response as any)?.responseMessages?.[0]?.message
        showError(err)
      } else {
        showSuccess(getString('delegate.successfullyUpdatedConfig'))
        setShowSpinner(true)
        refetch().then(() => {
          setShowSpinner(false)
        })
      }
    } catch (e) {
      showError(e.message)
    } finally {
      setShowSpinner(false)
    }
  }

  const onScopeChange = (newScopingRules: ScopingRuleDetails[]) => {
    setScopingRules(newScopingRules)
  }

  const onValidate = (profileData: DelegateProfileDetailsNg) => {
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
    [editMode, toggleEditMode, scopingRules]
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

  const permissionRequestEditConfiguration = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    permission: PermissionIdentifier.UPDATE_DELEGATE_CONFIGURATION,
    resource: {
      resourceType: ResourceType.DELEGATECONFIGURATION,
      resourceIdentifier: delegateConfigIdentifier
    }
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
            <RbacButton
              icon={editMode ? 'floppy-disk' : 'edit'}
              text={editMode ? getString('save') : getString('edit')}
              permission={permissionRequestEditConfiguration}
              id="editDelegateConfigurationBtn"
              data-test="editDelegateConfigurationButton"
              style={{
                position: 'absolute',
                top: '50px',
                right: '50px',
                color: 'var(--primary-7)',
                borderColor: 'var(--primary-7)'
              }}
              onClick={() => {
                toggleEditModeOrSave(formData)
              }}
            />
          }
        >
          <Container padding="xxlarge">
            <Layout.Horizontal spacing="large">
              <Layout.Vertical spacing="large" width={600}>
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
                            setFormData({ ...formData, name: e.target.value } as DelegateProfileDetailsNg)
                          }}
                        />
                      ) : (
                        profile?.name
                      )
                    }
                  />

                  <SectionLabelValuePair
                    label={getString('delegates.delegateIdentifier')}
                    value={profile?.identifier}
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
                            setFormData({ ...formData, description: e.target.value } as DelegateProfileDetailsNg)
                          }}
                        />
                      }
                    />
                  )}

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
                  {profile && editMode ? (
                    <DelegateConfigScopeEdit
                      onChange={onScopeChange}
                      scopingRules={scopingRules}
                      isPreviewOnly={!editMode}
                    />
                  ) : (
                    <DelegateConfigScopePreview scopingRules={scopingRules} />
                  )}
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
                    setFormData({ ...formData, startupScript: e.target.value } as DelegateProfileDetailsNg)
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
