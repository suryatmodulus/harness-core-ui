import React, { useState } from 'react'
import { Button, TextInput, useModalHook } from '@wings-software/uicore'
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
import { manifestTypeIcons, manifestTypeLabels } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { TriggersListSection, GoToEditWizardInterface } from './TriggersListSection'

import { TriggerTypes } from '../utils/TriggersWizardPageUtils'
import { getCategoryItems, ItemInterface, TriggerDataInterface } from '../utils/TriggersListUtils'
import css from './TriggersList.module.scss'

interface TriggersListPropsInterface {
  onNewTriggerClick: (val: TriggerDataInterface) => void
}
// This is temporary feature flag for NewArtifact Trigger
const NG_NEWARTIFACT_TRIGGER = (false && window.location.href.includes('localhost')) || false
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

  /*
    this is used temporarily for mocking newArtifact trigger data
  */

  // if (NG_NEWARTIFACT_TRIGGER) {
  //   triggerList?.push({
  //     name: 'test-newartifact-trigger',
  //     description: "",
  //     enabled: true,
  //     executions: [0, 0, 0, 0, 0, 0, 0],
  //     identifier: "testnewArtifactTrigger",
  //     tags: {},
  //     type: "NewArtifact",
  //     webhookDetails: { webhookSecret: 'test', webhookSourceRepo: "NewArtifact" },
  //     webhookUrl: "http://localhost:12001/api/webhook/custom?accountIdentifier=kmpySmUISimoRrJL6NL73w&orgIdentifier=default&projectIdentifier=test&pipelineIdentifier=K8sRolling&triggerIdentifier=testcustomtrigger",
  //     yaml: "trigger:\n    name: test-custom-trigger\n    identifier: testcustomtrigger\n    enabled: true\n    description: \"\"\n    tags: {}\n    orgIdentifier: default\n    projectIdentifier: test\n    pipelineIdentifier: K8sRolling\n    source:\n        type: Webhook\n        spec:\n            type: Custom\n            spec:\n                payloadConditions: []\n                headerConditions:\n                    - key: test\n                      operator: NotEquals\n                      value: \"123\"\n                jexlCondition: test\n    inputYaml: |\n        pipeline:\n            identifier: K8sRolling\n            stages:\n                - stage:\n                      identifier: stagea\n                      type: Deployment\n                      spec:\n                          serviceConfig:\n                              serviceDefinition:\n                                  type: Kubernetes\n                                  spec:\n                                      manifests:\n                                          - manifest:\n                                                identifier: dsfsf\n                                                type: Kustomize\n                                                spec:\n                                                    store:\n                                                        type: Git\n                                                        spec:\n                                                            folderPath: sdsf\n                                                            repoName: test\n                                          - manifest:\n                                                identifier: dsfsdf\n                                                type: Kustomize\n                                                spec:\n                                                    store:\n                                                        type: Git\n                                                        spec:\n                                                            folderPath: sdfd\n                                                    pluginPath: dsfd\n                          infrastructure:\n                              infrastructureDefinition:\n                                  type: KubernetesDirect\n                                  spec:\n                                      namespace: sdfds\n                                      releaseName: sdfds\n                              infrastructureKey: \"\"\n"

  //   })
  // }

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
    if (NG_NEWARTIFACT_TRIGGER) {
      categoryItems.categories.splice(1, 0, {
        categoryLabel: getString('manifestsText'),
        categoryValue: 'Manifest',
        items: [
          {
            itemLabel: getString(manifestTypeLabels.HelmChart),
            value: 'HelmChart',
            iconName: manifestTypeIcons.HelmChart
          }
        ]
      })
    }

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
          intent="primary"
          onClick={openDrawer}
        ></Button>
        <TextInput
          leftIcon="search"
          placeholder={getString('search')}
          data-name="search"
          className={css.search}
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
