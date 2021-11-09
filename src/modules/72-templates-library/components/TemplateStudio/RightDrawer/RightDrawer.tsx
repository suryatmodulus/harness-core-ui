import React, { SyntheticEvent } from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { StepData } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepPalette } from '@pipeline/components/PipelineStudio/StepPalette/StepPalette'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { DrawerSizes, DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { StepElementConfig } from 'services/cd-ng'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getAllStepPaletteModuleInfos, getStepPaletteModuleInfosFromStage } from '@pipeline/utils/stepUtils'
import type { StepPalleteModuleInfo } from 'services/pipeline-ng'
import css from './RightDrawer.module.scss'

export const RightDrawer: React.FC = (): JSX.Element => {
  const {
    state: {
      templateView: { drawerData, isDrawerOpened },
      templateView
    },
    updateTemplateView
  } = React.useContext(TemplateContext)
  const { type, data, ...restDrawerProps } = drawerData
  const { module } = useParams<ModulePathParams>()
  const { CDNG_ENABLED, CING_ENABLED } = useFeatureFlags()
  const [stepPaletteModuleInfos, setStepPaletteModuleInfos] = React.useState<StepPalleteModuleInfo[]>([])

  const closeDrawer = (e?: SyntheticEvent<HTMLElement, Event> | undefined): void => {
    e?.persist()
    updateTemplateView({ ...templateView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
  }

  const onStepSelection = async (item: StepData): Promise<void> => {
    const stepData: StepElementConfig = {
      identifier: '',
      name: '',
      type: item.type
    }
    data?.paletteData?.onSelection?.(stepData)
  }

  React.useEffect(() => {
    if (module === 'cd') {
      setStepPaletteModuleInfos(getStepPaletteModuleInfosFromStage(StageType.DEPLOY))
    } else if (module === 'ci') {
      setStepPaletteModuleInfos(getStepPaletteModuleInfosFromStage(StageType.BUILD))
    } else {
      if (CDNG_ENABLED && CING_ENABLED) {
        setStepPaletteModuleInfos(getAllStepPaletteModuleInfos())
      } else if (CDNG_ENABLED) {
        setStepPaletteModuleInfos(getStepPaletteModuleInfosFromStage(StageType.DEPLOY))
      } else if (CING_ENABLED) {
        setStepPaletteModuleInfos(getStepPaletteModuleInfosFromStage(StageType.BUILD))
      }
    }
  }, [module])

  return (
    <Drawer
      onClose={closeDrawer}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={DrawerSizes[type]}
      isOpen={isDrawerOpened}
      position={Position.RIGHT}
      data-type={type}
      className={cx(css.main, css.almostFullScreen, css.fullScreen)}
      portalClassName={'pipeline-studio-right-drawer'}
      {...restDrawerProps}
    >
      <Button
        minimal
        className={css.almostFullScreenCloseBtn}
        icon="cross"
        withoutBoxShadow
        onClick={() => {
          updateTemplateView({ ...templateView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
        }}
      />

      {type === DrawerTypes.AddStep && (
        <StepPalette
          stepsFactory={factory}
          stepPaletteModuleInfos={stepPaletteModuleInfos}
          stageType={StageType.BUILD}
          onSelect={onStepSelection}
        />
      )}
    </Drawer>
  )
}
