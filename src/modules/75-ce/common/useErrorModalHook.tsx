import React, { useState } from 'react'
import { useModalHook, Button, Container, Text, Color } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import type { ServiceError } from 'services/lw'
import { useStrings } from 'framework/exports'
import css from './useErrorModalHook.module.scss'

const modalProps: IDialogProps = {
  isOpen: true,
  style: {
    width: 750,
    minHeight: 350,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}

interface UserErrorModalReturn {
  openErrorModal: (_error: ServiceError[]) => void
  hideErrorModal?: () => void
}

interface UseErrorModalHookProps {
  errorSummary?: string
}

const useErrorModalHook = (props: UseErrorModalHookProps): UserErrorModalReturn => {
  const [error, setError] = useState<ServiceError[]>()

  const { getString } = useStrings()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <Container height={'100%'} padding="xxlarge">
          <Text font={{ size: 'medium' }} color={Color.BLACK}>
            {getString('errorDetails')}
          </Text>
          <Container padding={{ top: 'large' }}>
            <Text
              icon={'error'}
              iconProps={{ color: Color.RED_500 }}
              color={Color.GREY_900}
              lineClamp={1}
              font={{ size: 'small', weight: 'semi-bold' }}
              margin={{ top: 'small', bottom: 'small' }}
            >
              {props?.errorSummary}
            </Text>
            <div className={css.errorMsg}>
              <pre>{JSON.stringify({ errors: error }, null, ' ')}</pre>
            </div>
          </Container>
        </Container>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            // props.onClose?.()
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [error]
  )

  return {
    openErrorModal: (_error: any) => {
      setError(_error)
      showModal()
    },
    hideErrorModal: hideModal
  }
}

export default useErrorModalHook
