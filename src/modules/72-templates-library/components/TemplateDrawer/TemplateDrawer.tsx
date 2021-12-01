import React, { useCallback } from 'react'
import { noop } from 'lodash-es'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateDrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { TemplateSelector } from '../TemplateSelector/TemplateSelector'
import css from './TemplateDrawer.module.scss'

export const TemplateDrawer: React.FC = (): JSX.Element => {
  const {
    state: {
      isLoading,
      templateView: {
        isTemplateDrawerOpened,
        templateDrawerData: { type }
      }
    },
    updateTemplateView
  } = usePipelineContext()

  const closeTemplateView = useCallback(() => {
    updateTemplateView({
      isTemplateDrawerOpened: false,
      templateDrawerData: { type: TemplateDrawerTypes.UseTemplate }
    })
  }, [updateTemplateView])

  if (isLoading) {
    return <></>
  }

  return (
    <Drawer
      onClose={() => {
        noop()
      }}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={'1287px'}
      isOpen={isTemplateDrawerOpened}
      position={Position.RIGHT}
      data-type={type}
    >
      <Button
        minimal
        className={css.almostFullScreenCloseBtn}
        icon="cross"
        withoutBoxShadow
        onClick={closeTemplateView}
      />
      <TemplateSelector />
    </Drawer>
  )
}
