import React, { useCallback } from 'react'
import { Layout, ButtonGroup, Button } from '@wings-software/uicore'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import cx from 'classnames'
import { useStrings } from 'framework/exports'
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
  layout?: 'horizontal' | 'vertical'
}

export const CanvasButtons: React.FC<CanvasButtonsProps> = ({
  engine,
  callback,
  className = '',
  tooltipPosition = 'left',
  layout = 'vertical'
}) => {
  const { getString } = useStrings()
  const zoomToFit = useCallback(
    e => {
      e.stopPropagation()
      engine.getModel().setZoomLevel(100)
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
      // Minimum Zoom level should be 40
      if (zoomLevel >= 60) {
        engine.getModel().setZoomLevel(zoomLevel - 20)
        engine.repaintCanvas()
        callback?.(CanvasButtonsActions.ZoomOut)
      }
    },
    [engine, callback]
  )

  const renderButtons = () => (
    <>
      <ButtonGroup>
        <Button
          icon="canvas-position"
          tooltip={getString('canvasButtons.zoomToFit')}
          tooltipProps={{ position: tooltipPosition as any }}
          onClick={zoomToFit}
        />
      </ButtonGroup>
      <ButtonGroup>
        <Button
          icon="canvas-selector"
          tooltip={getString('reset')}
          onClick={zoomReset}
          tooltipProps={{ position: tooltipPosition as any }}
        />
      </ButtonGroup>
      <span className={layout === 'vertical' ? css.verticalButtons : ''}>
        <ButtonGroup>
          <Button
            icon="zoom-in"
            tooltip={getString('canvasButtons.zoomIn')}
            onClick={zoomIn}
            tooltipProps={{ position: tooltipPosition as any }}
          />
          <Button
            icon="zoom-out"
            tooltip={getString('canvasButtons.zoomOut')}
            onClick={zoomOut}
            tooltipProps={{ position: tooltipPosition as any }}
          />
        </ButtonGroup>
      </span>
    </>
  )
  return (
    <span className={cx(css.canvasButtons, className)}>
      {layout === 'horizontal' ? (
        <Layout.Horizontal spacing="medium" id="button-group">
          {renderButtons()}
        </Layout.Horizontal>
      ) : (
        <Layout.Vertical spacing="medium" id="button-group">
          {renderButtons()}
        </Layout.Vertical>
      )}
    </span>
  )
}
