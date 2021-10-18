import React from 'react'
import { noop } from 'lodash-es'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateDrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type { TemplateType } from '@templates-library/utils/templatesUtils'
import { TemplateSelector } from '../TemplateSelector/TemplateSelector'
import css from './TemplateDrawer.module.scss'

export const TemplateDrawer: React.FC = (): JSX.Element => {
  const {
    state: {
      templateView: {
        isTemplateDrawerOpened,
        templateDrawerData: { type, data },
        templateDrawerData
      }
    },
    updateTemplateView
  } = usePipelineContext()

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
        onClick={() => {
          updateTemplateView({
            isTemplateDrawerOpened: false,
            templateDrawerData: { type: TemplateDrawerTypes.UseTemplate }
          })
        }}
      />
      {data?.selectorData?.templateType && (
        <TemplateSelector
          templateType={data?.selectorData?.templateType as TemplateType}
          childTypes={data?.selectorData?.childTypes || []}
          onCopyToPipeline={templateDrawerData.data?.selectorData?.onCopyTemplate}
          onUseTemplate={templateDrawerData.data?.selectorData?.onUseTemplate}
        />
      )}
    </Drawer>
  )
}
