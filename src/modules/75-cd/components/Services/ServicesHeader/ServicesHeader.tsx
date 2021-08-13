import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Color, Layout, Text, useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import routes from '@common/RouteDefinitions'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Page } from '@common/exports'
import { ParamsType, useServiceStore, Views } from '@cd/components/Services/common'
import { NewEditServiceModal } from '@cd/components/PipelineSteps/DeployServiceStep/DeployServiceStep'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import css from '@cd/components/Services/ServicesHeader/ServicesHeader.module.scss'

const useSetView = (fn: (arg: Views) => void, arg: Views): (() => void) => useCallback(() => fn(arg), [arg, fn])

export const ServicesHeader: React.FC = () => {
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<ParamsType>()
  const { selectedProject: { name: selectedProjectName = '' } = {} } = useAppStore()
  const { getString } = useStrings()
  const { view, setView, fetchDeploymentList } = useServiceStore()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={hideModal}
        title={getString('newService')}
        isCloseButtonShown
        className={'padded-dialog'}
      >
        <NewEditServiceModal
          data={{ name: '', identifier: '', orgIdentifier, projectIdentifier }}
          isEdit={false}
          isService
          onCreateOrUpdate={() => {
            ;(fetchDeploymentList.current as () => void)?.()
            hideModal()
          }}
          closeModal={hideModal}
        />
      </Dialog>
    ),
    [fetchDeploymentList, orgIdentifier, projectIdentifier]
  )

  return (
    <>
      <Page.Header
        title={
          <Layout.Vertical spacing="xsmall">
            <Breadcrumbs
              links={[
                {
                  url: routes.toServices({ orgIdentifier, projectIdentifier, accountId, module }),
                  label: selectedProjectName
                },
                { url: '#', label: getString('services') }
              ]}
            />
            <Text font={{ size: 'medium' }} color={Color.GREY_700}>
              {getString('services')}
            </Text>
          </Layout.Vertical>
        }
      />
      <Layout.Horizontal className={css.header} flex={{ distribution: 'space-between' }}>
        <Layout.Horizontal>
          <RbacButton
            intent="primary"
            data-testid="add-service"
            icon="plus"
            iconProps={{ size: 10 }}
            text={getString('newService')}
            permission={{
              permission: PermissionIdentifier.EDIT_SERVICE,
              resource: {
                resourceType: ResourceType.SERVICE
              }
            }}
            onClick={showModal}
          />
        </Layout.Horizontal>
        <Layout.Horizontal flex>
          <Button
            minimal
            icon="insight-view"
            intent={view === Views.INSIGHT ? 'primary' : 'none'}
            onClick={useSetView(setView, Views.INSIGHT)}
          />
          <Button
            minimal
            icon="list-view"
            intent={view === Views.LIST ? 'primary' : 'none'}
            onClick={useSetView(setView, Views.LIST)}
          />
        </Layout.Horizontal>
      </Layout.Horizontal>
    </>
  )
}
