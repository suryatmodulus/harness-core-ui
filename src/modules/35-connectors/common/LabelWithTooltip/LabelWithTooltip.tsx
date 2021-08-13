import React, { useContext, ReactElement } from 'react'
import { Layout, Icon, Text, Button } from '@wings-software/uicore'
import { Popover, Position, PopoverInteractionKind, Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { DialogExtensionContext } from '@connectors/common/ConnectorExtention/DialogExtention'
import css from './LabelWithTooltip.module.scss'

const LabelWithTooltip = ({
  label,
  extentionComponent
}: {
  label: string
  extentionComponent: ReactElement | React.FC
}) => {
  const { getString } = useStrings()
  const { triggerExtension } = useContext(DialogExtensionContext)
  return (
    <Layout.Horizontal spacing={'xsmall'}>
      <Text inline>{label}</Text>
      <Popover
        popoverClassName={Classes.DARK}
        position={Position.RIGHT}
        interactionKind={PopoverInteractionKind.HOVER}
        content={
          <div className={css.popoverContent}>
            <Text color="grey50" font={'xsmall'}>
              Provided in the delivery options when the template is opened in the AWS console
            </Text>
            <div className={css.btnCtn}>
              <Button
                intent="primary"
                className={css.instructionBtn}
                font={'xsmall'}
                minimal
                text={getString('connectors.showInstructions')}
                onClick={() => triggerExtension(extentionComponent)}
              />
            </div>
          </div>
        }
      >
        <Icon
          name="info"
          size={12}
          color={'primary5'}
          onClick={async (event: React.MouseEvent<HTMLHeadingElement, globalThis.MouseEvent>) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        />
      </Popover>
    </Layout.Horizontal>
  )
}

export default LabelWithTooltip
