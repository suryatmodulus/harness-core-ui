import React, { useState } from 'react'
import { Dialog } from '@blueprintjs/core'
import { Color, useModalHook, Button, Container, Text, Icon } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { FlagTypeVariations } from './FlagDialogUtils'
import FlagWizard from '../CreateFlagWizard/FlagWizard'
import FlagTypeElement from '../CreateFlagType/FlagTypeElement'
import css from './FlagDialog.module.scss'

export interface FlagModalProps {
  disabled?: boolean
  environment: string
}

const FlagModal: React.FC<FlagModalProps> = ({ disabled, environment }) => {
  const { getString } = useStrings()
  const [flagTypeClicked, setFlagTypeClicked] = useState(false)
  const [flagTypeView, setFlagTypeView] = useState('')

  const booleanFlagBtn = (typeOfFlag: boolean, type: string): void => {
    setFlagTypeClicked(typeOfFlag)
    setFlagTypeView(type)
  }

  const multiFlagBtn = (typeOfFlag: boolean, type: string): void => {
    setFlagTypeClicked(typeOfFlag)
    setFlagTypeView(type)
  }

  const toggleFlagType = (newFlagType: string): void => {
    setFlagTypeView(newFlagType)
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          setFlagTypeClicked(false)
          hideModal()
        }}
        className={css.modal}
      >
        {flagTypeClicked ? (
          <FlagWizard
            flagTypeView={flagTypeView}
            environmentIdentifier={environment}
            toggleFlagType={toggleFlagType}
            hideModal={hideModal}
            goBackToTypeSelections={() => {
              setFlagTypeClicked(false)
            }}
          />
        ) : (
          <Container className={css.typeFlagContainer} padding="huge">
            <Text color={Color.WHITE} margin={{ bottom: 'small' }} style={{ fontSize: '24px' }}>
              {getString('cf.featureFlags.typeOfFlag')}
            </Text>
            <Text font="small" color={Color.WHITE} margin={{ bottom: 'xxxlarge' }}>
              {getString('cf.featureFlags.startVariation')}
            </Text>
            <Container className={css.typeFlagBtns}>
              <FlagTypeElement
                type={FlagTypeVariations.booleanFlag}
                text={getString('cf.boolean')}
                textDesc={getString('cf.featureFlags.booleanBtnText')}
                typeOfFlagFnc={booleanFlagBtn}
              >
                <Icon name="full-circle" color={Color.BLUE_800} />
                <Icon name="full-circle" color={Color.BLUE_500} className={css.iconMl} />
              </FlagTypeElement>

              <FlagTypeElement
                type={FlagTypeVariations.multiFlag}
                text={getString('cf.multivariate')}
                textDesc={getString('cf.featureFlags.multiBtnText')}
                typeOfFlagFnc={multiFlagBtn}
              >
                <Icon name="full-circle" color={Color.BLUE_800} />
                <Icon name="full-circle" color={Color.BLUE_500} className={css.iconMl} />
                <Icon name="full-circle" color={Color.YELLOW_700} className={css.iconMl} />
                <Icon name="small-plus" color={Color.GREY_600} className={css.iconMl} />
              </FlagTypeElement>
            </Container>
          </Container>
        )}

        <Button
          minimal
          icon="small-cross"
          iconProps={{ size: 25 }}
          onClick={() => {
            setFlagTypeClicked(false)
            hideModal()
          }}
          className={css.closeIcon}
        />
      </Dialog>
    ),
    [flagTypeClicked, flagTypeView]
  )

  return (
    <RbacButton
      disabled={disabled}
      text={getString('cf.featureFlags.newFlag')}
      intent="primary"
      onClick={showModal}
      className={css.openModalBtn}
      permission={{
        permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG,
        resource: { resourceType: ResourceType.FEATUREFLAG }
      }}
    />
  )
}

export default FlagModal
