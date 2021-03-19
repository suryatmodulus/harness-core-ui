import React, { useState } from 'react'
import { Button, Color, Container, ExpandingSearchInput, Layout, Text } from '@wings-software/uicore'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/exports'
import css from './AddResourceModal.module.scss'

interface RoleModalData {
  resource: ResourceType
  selectedData: string[]
  onSuccess: (resources: string[]) => void
  onClose: () => void
}

const AddResourceModal: React.FC<RoleModalData> = ({ resource, onSuccess, onClose, selectedData }) => {
  const resourceHandler = RbacFactory.getResourceTypeHandler(resource)
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<string[]>(selectedData)

  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical>
        <Text color={Color.BLACK} font="medium">
          {`${getString('add')} ${resourceHandler?.label}`}
        </Text>
        <Layout.Horizontal padding={{ top: 'large' }} flex>
          <ExpandingSearchInput
            onChange={text => {
              setSearchTerm(text.trim())
            }}
          />
          <Text color={Color.BLUE_500}>
            {getString('addResourceModal.selectedText', { name: resourceHandler?.label, number: selectedItems.length })}
          </Text>
        </Layout.Horizontal>
        <Container className={css.modal}>
          {resourceHandler?.addResourceModalBody?.({
            searchTerm,
            onSelectChange: items => {
              setSelectedItems(items)
            },
            selectedData: selectedItems
          })}
        </Container>
        <Layout.Horizontal spacing="small">
          <Button
            intent="primary"
            text={`${getString('add')} ${selectedItems.length} ${resourceHandler?.label}`}
            onClick={() => onSuccess(selectedItems)}
          />
          <Button text={getString('cancel')} onClick={onClose} />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default AddResourceModal
