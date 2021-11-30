import React, { useContext } from 'react'
import { Position } from '@blueprintjs/core'
import { ButtonVariation } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { merge } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { getAllowedTemplateTypes, TemplateType } from '@templates-library/utils/templatesUtils'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  TemplateMenuItem,
  TemplatesActionPopover
} from '@templates-library/components/TemplatesActionPopover/TemplatesActionPopover'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'

export function NewTemplatePopover(): React.ReactElement {
  const handleAddTemplate = () => undefined
  const { getString } = useStrings()
  const history = useHistory()
  const allowedTemplateTypes = getAllowedTemplateTypes(getString)
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { isReadonly } = useContext(TemplateContext)

  const goToTemplateStudio = React.useCallback(
    (templateType: TemplateType) => {
      history.push(
        routes.toTemplateStudio({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module,
          templateType,
          templateIdentifier: DefaultNewTemplateId
        })
      )
    },
    [projectIdentifier, orgIdentifier, accountId, module]
  )

  const getMenu = (): TemplateMenuItem[] => {
    return allowedTemplateTypes.map(templateType => {
      return merge(templateType, {
        onClick: () => goToTemplateStudio(templateType.value as TemplateType)
      })
    })
  }

  return (
    <TemplatesActionPopover
      open={menuOpen}
      minimal={true}
      items={getMenu()}
      position={Position.BOTTOM}
      disabled={isReadonly}
      setMenuOpen={setMenuOpen}
      usePortal={false}
    >
      <RbacButton
        variation={ButtonVariation.PRIMARY}
        icon="plus"
        rightIcon="chevron-down"
        text={getString('templatesLibrary.addNewTemplate')}
        onClick={handleAddTemplate}
        permission={{
          permission: PermissionIdentifier.EDIT_TEMPLATE,
          resource: {
            resourceType: ResourceType.TEMPLATE
          }
        }}
      />
    </TemplatesActionPopover>
  )
}
