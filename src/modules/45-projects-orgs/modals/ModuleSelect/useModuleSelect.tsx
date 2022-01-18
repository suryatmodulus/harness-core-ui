/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import {
  Button,
  Card,
  Container,
  Icon,
  Layout,
  useModalHook,
  Text,
  FontVariation,
  ButtonVariation
} from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { getModuleLink } from '@projects-orgs/components/ModuleListCard/ModuleListCard'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getModuleDescriptionsForModuleSelectionDialog, getModuleFullLengthTitle } from '@projects-orgs/utils/utils'
import { getModuleIcon } from '@common/utils/utils'
import type { Project } from 'services/cd-ng'
import ModuleSelectionFactory from '@projects-orgs/factories/ModuleSelectionFactory'
import css from './useModuleSelect.module.scss'

export interface UseModuleSelectModalProps {
  onSuccess?: () => void
  onCloseModal?: () => void
}
export type RenderElementOnModuleSelection = { [K in ModuleName]?: JSX.Element }
export interface UseModuleSelectModalReturn {
  openModuleSelectModal: (projectData: Project) => void
  closeModuleSelectModal: () => void
}
interface InfoCards {
  name: ModuleName
}

export const useModuleSelectModal = ({
  onSuccess,
  onCloseModal
}: UseModuleSelectModalProps): UseModuleSelectModalReturn => {
  const { getString } = useStrings()

  const history = useHistory()
  const [selectedModuleName, setSelectedModuleName] = React.useState<ModuleName>()
  const [projectData, setProjectData] = React.useState<Project>()
  const { accountId } = useParams<AccountPathProps>()
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()
  const modalProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 1100,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'auto'
    }
  }
  const infoCards: InfoCards[] = []

  if (CDNG_ENABLED) {
    infoCards.push({
      name: ModuleName.CD
    })
  }
  if (CING_ENABLED) {
    infoCards.push({
      name: ModuleName.CI
    })
  }
  if (CFNG_ENABLED) {
    infoCards.push({
      name: ModuleName.CF
    })
  }
  if (CENG_ENABLED) {
    infoCards.push({
      name: ModuleName.CE
    })
  }
  if (CVNG_ENABLED) {
    infoCards.push({
      name: ModuleName.CV
    })
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        onClose={() => {
          onSuccess?.()
          onCloseModal?.()
          hideModal()
        }}
        {...modalProps}
        title={
          <Container padding={{ left: 'xxlarge', top: 'xxlarge' }}>
            <Text font={{ variation: FontVariation.H3 }}>{getString('projectsOrgs.moduleSelectionTitle')}</Text>
          </Container>
        }
      >
        <Layout.Horizontal padding="huge">
          <Layout.Horizontal className={css.cardsContainer}>
            {infoCards.map(module => {
              const desc = getModuleDescriptionsForModuleSelectionDialog(module.name)
              return (
                <Card
                  className={css.card}
                  key={module.name}
                  interactive
                  selected={module.name === selectedModuleName}
                  onClick={() => {
                    setSelectedModuleName(module.name)
                  }}
                >
                  <Layout.Vertical spacing="small">
                    <Layout.Horizontal flex spacing="small">
                      <Icon name={getModuleIcon(module.name)} size={35}></Icon>
                      <Text font={{ variation: FontVariation.H6 }}>
                        {getString(getModuleFullLengthTitle(module.name))}
                      </Text>
                    </Layout.Horizontal>
                    <Text font={{ variation: FontVariation.SMALL }}>{desc && getString(desc)}</Text>
                  </Layout.Vertical>
                </Card>
              )
            })}
          </Layout.Horizontal>
          <Container className={css.moduleActionDiv} padding={{ left: 'huge' }}>
            {selectedModuleName
              ? ModuleSelectionFactory.getModuleSelectionEle(selectedModuleName) || (
                  <Layout.Vertical spacing="medium">
                    <Text font={{ variation: FontVariation.H4 }}>
                      {getString(getModuleFullLengthTitle(selectedModuleName))}
                    </Text>
                    <Button
                      text={getString('projectsOrgs.goToModuleBtn')}
                      width={150}
                      variation={ButtonVariation.PRIMARY}
                      onClick={() => {
                        if (projectData && projectData.orgIdentifier) {
                          history.push(
                            getModuleLink({
                              module: selectedModuleName,
                              orgIdentifier: projectData?.orgIdentifier,
                              projectIdentifier: projectData.identifier,
                              accountId
                            })
                          )
                        }
                      }}
                    ></Button>
                  </Layout.Vertical>
                )
              : null}
          </Container>
        </Layout.Horizontal>
      </Dialog>
    ),
    [selectedModuleName]
  )

  const open = useCallback(
    (projectDataLocal: Project) => {
      setProjectData(projectDataLocal)
      showModal()
    },
    [showModal]
  )

  return {
    openModuleSelectModal: (projectDataLocal: Project) => open(projectDataLocal),
    closeModuleSelectModal: hideModal
  }
}
