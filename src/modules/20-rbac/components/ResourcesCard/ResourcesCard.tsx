import React from 'react'
import { Layout, Text, Card, Color, Button } from '@wings-software/uicore'
import { Radio } from '@blueprintjs/core'
import { noop } from 'lodash-es'
import RbacFactory from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/exports'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import useAddResourceModal from '@rbac/modals/AddResourceModal/useAddResourceModal'
import { RbacResourceGroupTypes } from '@rbac/constants/utils'
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
  const { getString } = useStrings()
  const { openAddResourceModal } = useAddResourceModal({
    onSuccess: resources => {
      onResourceSelectionChange(resourceType, true, resources)
    }
  })

  const resourceDetails = RbacFactory.getResourceTypeHandler(resourceType)
  if (!resourceDetails) return null
  const { label, icon, addResourceModalBody } = resourceDetails
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
            {label}
          </Text>
          <Radio
            label={getString('resourceGroup.all', { name: label })}
            checked={resourceValues === RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR}
            className={css.radioBtn}
            onChange={noop}
          />
          <Text lineClamp={1} color={Color.GREY_400} className={css.limitAccessCell}>
            {getString('resourceGroup.limitAccess', { name: label })}
          </Text>
          {addResourceModalBody && (
            <Button
              intent="primary"
              minimal
              disabled={disableAddingResources}
              className={css.addResourceBtn}
              onClick={() => {
                openAddResourceModal(resourceType, Array.isArray(resourceValues) ? resourceValues : [])
              }}
            >
              {getString('resourceGroup.add', { name: label })}
            </Button>
          )}
        </Layout.Horizontal>

        {Array.isArray(resourceValues) && (
          <Layout.Vertical padding={{ top: 'large' }}>
            {resourceValues.map(resource => (
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
