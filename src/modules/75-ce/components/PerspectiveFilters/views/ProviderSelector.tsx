import React from 'react'
import { Container } from '@wings-software/uicore'
import CustomMenuItem from '@ce/components/CustomMenu/CustomMenuItem'
import type { QlceViewFieldIdentifierData } from 'services/ce/services'

import { FIELD_TO_ICON_MAPPING } from '../constants'
import type { ProviderType } from '../FilterPill'
import css from './views.module.scss'

interface ProviderSelectorProps {
  fieldValueList: QlceViewFieldIdentifierData[]
  setProvider: React.Dispatch<React.SetStateAction<ProviderType | null | undefined>>
  setService: React.Dispatch<React.SetStateAction<ProviderType | null | undefined>>
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ fieldValueList, setProvider, setService }) => {
  const defaultFields = fieldValueList.filter(field => field.identifier !== 'CUSTOM' && field.identifier !== 'COMMON')
  const commonFields = fieldValueList.filter(field => field.identifier === 'COMMON')

  const labelClick: () => void = () => {
    setProvider({
      id: 'LABEL',
      name: 'Label'
    })
    setService({
      id: 'labels.key',
      name: ''
    })
  }

  return (
    <Container className={css.providerDropDown}>
      <ul className={css.providerList}>
        {defaultFields.map(field => {
          const onClick: () => void = () => setProvider({ id: field.identifier, name: field.identifierName })
          return (
            <li key={field.identifier}>
              <CustomMenuItem
                iconName={FIELD_TO_ICON_MAPPING[field.identifier]}
                text={field.identifierName}
                onClick={onClick}
              />
            </li>
          )
        })}

        {commonFields.map(commonField =>
          commonField.values.map(field => {
            if (field) {
              const onClick: () => void = () => {
                setProvider({
                  id: commonField.identifier,
                  name: commonField.identifierName
                })
                setService({
                  id: field.fieldId,
                  name: field.fieldName
                })
                // Set Provider as well as service
              }
              return (
                <li key={field.fieldId}>
                  <CustomMenuItem text={field.fieldName} onClick={field.fieldName === 'Label' ? labelClick : onClick} />
                </li>
              )
            }
          })
        )}
      </ul>
    </Container>
  )
}

export default ProviderSelector
