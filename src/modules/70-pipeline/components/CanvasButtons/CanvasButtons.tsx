import React, { useCallback } from 'react'
import { Layout, ButtonGroup, Button } from '@wings-software/uicore'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import cx from 'classnames'
import i18n from './CanvasButtons.i18n'
import css from './CanvasButtons.module.scss'

export enum CanvasButtonsActions {
  ZoomIn,
  ZoomOut,
  Reset,
  ZoomToFit
}

interface CanvasButtonsProps {
  engine: DiagramEngine
  className?: string
  callback?: (action: CanvasButtonsActions) => void
  tooltipPosition?: string
}

export const CanvasButtons: React.FC<CanvasButtonsProps> = ({
  engine,
  callback,
  className = '',
  tooltipPosition = 'top'
}) => {
  const zoomToFit = useCallback(
    e => {
      e.stopPropagation()
      engine.zoomToFit()
      callback?.(CanvasButtonsActions.ZoomToFit)
    },
    [engine, callback]
  )

  const zoomReset = useCallback(
    e => {
      e.stopPropagation()
      engine.getModel().setZoomLevel(100)
      engine.getModel().setOffset(0, 0)
      engine.repaintCanvas()
      callback?.(CanvasButtonsActions.ZoomToFit)
    },
    [engine, callback]
  )

  const zoomIn = useCallback(
    e => {
      e.stopPropagation()
      const zoomLevel = engine.getModel().getZoomLevel()
      engine.getModel().setZoomLevel(zoomLevel + 20)
      engine.repaintCanvas()
      callback?.(CanvasButtonsActions.ZoomIn)
    },
    [engine, callback]
  )

  const zoomOut = useCallback(
    e => {
      e.stopPropagation()
      const zoomLevel = engine.getModel().getZoomLevel()
      engine.getModel().setZoomLevel(zoomLevel - 20)
      engine.repaintCanvas()
      callback?.(CanvasButtonsActions.ZoomOut)
    },
    [engine, callback]
  )

  return (
    <span className={cx(css.canvasButtons, className)}>
      <Layout.Vertical spacing="medium" id="button-group">
        <ButtonGroup>
          <Button
            icon="canvas-position"
            tooltip={i18n.zoomToFit}
            tooltipProps={{ position: tooltipPosition as any }}
            onClick={zoomToFit}
          />
        </ButtonGroup>
        <ButtonGroup>
          <Button
            icon="canvas-selector"
            tooltip={i18n.reset}
            onClick={zoomReset}
            tooltipProps={{ position: tooltipPosition as any }}
          />
        </ButtonGroup>
        <span className={css.verticalButtons}>
          <ButtonGroup>
            <Button
              icon="zoom-in"
              tooltip={i18n.zoomIn}
              onClick={zoomIn}
              tooltipProps={{ position: tooltipPosition as any }}
            />
            <Button
              icon="zoom-out"
              tooltip={i18n.zoomOut}
              onClick={zoomOut}
              tooltipProps={{ position: tooltipPosition as any }}
            />
          </ButtonGroup>
        </span>
      </Layout.Vertical>
    </span>
  )
}
