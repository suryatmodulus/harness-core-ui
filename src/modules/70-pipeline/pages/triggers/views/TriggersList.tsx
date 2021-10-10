import React, { useState } from 'react'
import { Button, ButtonVariation, Color, TextInput, useModalHook } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGetTriggerListForTarget } from 'services/pipeline-ng'
import { AddDrawer } from '@common/components'
import { DrawerContext } from '@common/components/AddDrawer/AddDrawer'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import {
  manifestTypeIcons,
  manifestTypeLabels,
  ManifestDataType
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import {
  ArtifactIconByType,
  ArtifactTitleIdByType,
  ENABLED_ARTIFACT_TYPES
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { TriggersListSection, GoToEditWizardInterface } from './TriggersListSection'

import { TriggerTypes } from '../utils/TriggersWizardPageUtils'
import { getCategoryItems, ItemInterface, TriggerDataInterface } from '../utils/TriggersListUtils'

import css from './TriggersList.module.scss'

interface TriggersListPropsInterface {
  onNewTriggerClick: (val: TriggerDataInterface) => void
}

export default function TriggersList(props: TriggersListPropsInterface & GitQueryParams): JSX.Element {
  const { onNewTriggerClick, repoIdentifier, branch } = props

  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
    }>
  >()
  const [searchParam, setSearchParam] = useState('')
  const { getString } = useStrings()

  const {
    data: triggerListResponse,
    error,
    refetch,
    loading
  } = useGetTriggerListForTarget({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier,
      searchTerm: searchParam
    },
    debounce: 300
  })
  const triggerList = triggerListResponse?.data?.content || undefined
  const history = useHistory()
  const [isEditable] = usePermission(
    {
      resourceScope: {
        projectIdentifier: projectIdentifier,
        orgIdentifier: orgIdentifier,
        accountIdentifier: accountId
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, pipelineIdentifier]
  )

  const goToEditWizard = ({ triggerIdentifier, triggerType }: GoToEditWizardInterface): void => {
    history.push(
      routes.toTriggersWizardPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        triggerIdentifier,
        triggerType,
        module,
        repoIdentifier,
        branch
      })
    )
  }
  const goToDetails = ({ triggerIdentifier }: GoToEditWizardInterface): void => {
    /* istanbul ignore next */
    history.push(
      routes.toTriggersDetailPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        triggerIdentifier,
        module,
        repoIdentifier,
        branch
      })
    )
  }

  const [openDrawer, hideDrawer] = useModalHook(() => {
    /* istanbul ignore next */
    const onSelect = (val: ItemInterface): void => {
      if (val?.categoryValue) {
        hideDrawer()
        onNewTriggerClick({
          triggerType: val.categoryValue,
          sourceRepo: (val.categoryValue === TriggerTypes.WEBHOOK && val.value) || undefined,
          artifactType: (val.categoryValue === TriggerTypes.ARTIFACT && val.value) || undefined,
          manifestType: (val.categoryValue === TriggerTypes.MANIFEST && val.value) || undefined
        })
      }
    }

    const categoryItems = getCategoryItems(getString)
    /* istanbul ignore next */
    categoryItems.categories.splice(
      1,
      0,
      {
        categoryLabel: getString('pipeline.triggers.artifactTriggerConfigPanel.artifact'),
        categoryValue: 'Artifact',
        items: [
          {
            itemLabel: getString(ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Gcr]),
            value: ENABLED_ARTIFACT_TYPES.Gcr,
            iconName: ArtifactIconByType.Gcr
          },
          {
            itemLabel: getString(ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Ecr]),
            value: ENABLED_ARTIFACT_TYPES.Ecr,
            iconName: ArtifactIconByType.Ecr
          },
          {
            itemLabel: getString(ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.DockerRegistry]),
            value: ENABLED_ARTIFACT_TYPES.DockerRegistry,
            iconName: ArtifactIconByType.DockerRegistry
          }
        ]
      },
      {
        categoryLabel: getString('manifestsText'),
        categoryValue: 'Manifest',
        items: [
          {
            itemLabel: getString(manifestTypeLabels.HelmChart),
            value: ManifestDataType.HelmChart,
            iconName: manifestTypeIcons.HelmChart
          }
        ]
      }
    )

    return (
      <AddDrawer
        addDrawerMap={categoryItems}
        onSelect={onSelect}
        onClose={hideDrawer}
        drawerContext={DrawerContext.STUDIO}
      />
    )
  })

  return (
    <>
      <Page.SubHeader>
        <Button
          disabled={!isEditable}
          text={getString('pipeline.triggers.newTrigger')}
          variation={ButtonVariation.PRIMARY}
          onClick={openDrawer}
        ></Button>
        <TextInput
          leftIcon="thinner-search"
          leftIconProps={{ name: 'thinner-search', size: 14, color: Color.GREY_700 }}
          placeholder={getString('search')}
          data-name="search"
          wrapperClassName={css.searchWrapper}
          value={searchParam}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchParam(e.target.value.trim())
          }}
        />
      </Page.SubHeader>

      <Page.Body
        loading={loading}
        error={error?.message}
        retryOnError={() => refetch()}
        noData={
          !searchParam
            ? {
                when: () => Array.isArray(triggerList) && triggerList.length === 0,
                icon: 'yaml-builder-trigger',
                message: getString('pipeline.triggers.aboutTriggers'),
                buttonText: getString('pipeline.triggers.addNewTrigger'),
                onClick: openDrawer,
                buttonDisabled: !isEditable
              }
            : {
                when: () => Array.isArray(triggerList) && triggerList.length === 0,
                icon: 'yaml-builder-trigger',
                message: getString('pipeline.triggers.noTriggersFound')
              }
        }
      >
        <TriggersListSection
          data={triggerList}
          refetchTriggerList={refetch}
          goToEditWizard={goToEditWizard}
          goToDetails={goToDetails}
        />
      </Page.Body>
    </>
  )
}
