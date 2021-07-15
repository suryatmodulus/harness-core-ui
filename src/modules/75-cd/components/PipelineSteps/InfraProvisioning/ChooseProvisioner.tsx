import React from 'react'
import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import { Layout, Card, Icon, Text, IconName, Button, useModalHook } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import { ProvisionerTypes } from '../Common/ProvisionerConstants'

import css from './InfraProvisioning.module.scss'

const provisionerTypes: { name: string; icon: IconName; enabled: boolean }[] = [
  {
    name: ProvisionerTypes.Terraform,
    icon: 'terraform-apply-new',
    enabled: true
  },
  {
    name: ProvisionerTypes.CloudFormation,
    icon: 'cloudformation',
    enabled: false
  },
  {
    name: ProvisionerTypes.ARM,
    icon: 'arm',
    enabled: false
  },
  {
    name: ProvisionerTypes.Script,
    icon: 'script',
    enabled: false
  }
]

interface ChooseProvisionerProps {
  onSubmit: any
  onClose: any
}
const useChooseProvisioner = (props: ChooseProvisionerProps) => {
  const { getString } = useStrings()
  const [provData, setProvData] = React.useState()

  const modalProps = {
    isOpen: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true
  }
  const ProvDialog = () => (
    <Dialog
      onClose={hideModal}
      enforceFocus={false}
      className={cx(Classes.DIALOG, css.chooseProvisionerDialog)}
      {...modalProps}
    >
      <Layout.Vertical spacing="large">
        <div className={css.provisionerText}>{getString('cd.chooseProvisionerText')}</div>
        <Layout.Horizontal height={120}>
          {provisionerTypes.map((type: { name: string; icon: IconName; enabled: boolean }) => (
            <div key={type.name} className={css.squareCardContainer}>
              <Card
                disabled={!type.enabled}
                interactive={true}
                selected={type.name === ProvisionerTypes.Terraform ? true : false}
                cornerSelected={type.name === ProvisionerTypes.Terraform ? true : false}
                className={cx({ [css.disabled]: !type.enabled }, css.squareCard)}
              >
                <Icon name={type.icon as IconName} size={26} height={26} />
              </Card>
              <Text
                style={{
                  fontSize: '12px',
                  color: type.enabled ? 'var(--grey-900)' : 'var(--grey-350)',
                  textAlign: 'center'
                }}
              >
                {type.name}
              </Text>
            </div>
          ))}
        </Layout.Horizontal>
        <Button
          intent="primary"
          text={getString('cd.setUpProvisionerBtnText')}
          className={css.provisionerBtnText}
          onClick={() => {
            props.onSubmit(provData)
            hideModal()
          }}
        />
      </Layout.Vertical>
    </Dialog>
  )
  const [showModal, hideModal] = useModalHook(() => <ProvDialog />, [provData])

  const open = (data?: any) => {
    setProvData(data)
    showModal()
  }
  return {
    showModal: (data: any) => open(data),
    hideModal
  }
}

export default useChooseProvisioner
