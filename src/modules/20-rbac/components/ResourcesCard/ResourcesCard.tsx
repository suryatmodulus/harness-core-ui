import React from 'react'
import { Layout, Text, Card, Color, Button, Radio } from '@wings-software/uicore'
import { useParams } from 'react-router'
import RbacFactory from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import useAddResourceModal from '@rbac/modals/AddResourceModal/useAddResourceModal'
import { RbacResourceGroupTypes } from '@rbac/constants/utils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './ResourcesCard.module.scss'

interface ResourcesCardProps {
  resourceType: ResourceType
  resourceValues: string | string[]
  onResourceSelectionChange: (resourceType: ResourceType, isAdd: boolean, identifiers?: string[] | undefined) => void
  disableAddingResources?: boolean
}

const ResourcesCard: React.FC<ResourcesCardProps> = ({
  resourceType,
  resourceValues,
  onResourceSelectionChange,
  disableAddingResources
}) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { openAddResourceModal } = useAddResourceModal({
    onSuccess: resources => {
      onResourceSelectionChange(resourceType, true, resources)
    }
  })

  const resourceDetails = RbacFactory.getResourceTypeHandler(resourceType)
  if (!resourceDetails) return null
  const { label, icon, addResourceModalBody, staticResourceRenderer } = resourceDetails
  return (
    <Card className={css.selectedResourceGroupCardDetails} key={resourceType}>
      <Layout.Vertical>
        <Layout.Horizontal className={css.resourceFields}>
          <Text
            color={Color.BLACK}
            font={{ weight: 'semi-bold' }}
            lineClamp={1}
            icon={icon}
            iconProps={{ size: 20, padding: { right: 'medium' } }}
          >
            {getString(label)}
          </Text>
          <Radio
            label={getString('resourceGroup.all', { name: getString(label) })}
            checked={resourceValues === RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR}
            className={css.radioBtn}
            onChange={e => onResourceSelectionChange(resourceType, e.currentTarget.checked)}
          />
          {addResourceModalBody && (
            <>
              <Text lineClamp={1} color={Color.GREY_400} className={css.limitAccessCell}>
                {getString('resourceGroup.limitAccess', { name: getString(label) })}
              </Text>
              <Button
                intent="primary"
                minimal
                disabled={disableAddingResources}
                className={css.addResourceBtn}
                onClick={() => {
                  openAddResourceModal(resourceType, Array.isArray(resourceValues) ? resourceValues : [])
                }}
              >
                {getString('resourceGroup.add', { name: getString(label) })}
              </Button>
            </>
          )}
        </Layout.Horizontal>

        {Array.isArray(resourceValues) && (
          <Layout.Vertical padding={{ top: 'large' }}>
            {staticResourceRenderer
              ? staticResourceRenderer({
                  identifiers: resourceValues,
                  resourceScope: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
                  onResourceSelectionChange,
                  resourceType
                })
              : resourceValues.map(resource => (
                  <Layout.Horizontal padding="large" className={css.staticResource} key={resource} flex>
                    <Text>{resource}</Text>
                    <Button
                      icon="trash"
                      minimal
                      onClick={() => {
                        onResourceSelectionChange(resourceType, false, [resource])
                      }}
                    />
                  </Layout.Horizontal>
                ))}
          </Layout.Vertical>
        )}
      </Layout.Vertical>
    </Card>
  )
}
export default ResourcesCard
