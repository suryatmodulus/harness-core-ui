import type { DraggableData } from 'react-draggable'
import {
  isLeftHandleWithinBounds,
  isSliderWithinBounds,
  determineSliderPlacementForClick,
  calculateSliderAspectsOnRightHandleDrag,
  calculateSliderAspectsOnLeftHandleDrag,
  calculateSliderAspectsOnDrag,
  calculateRightHandleDragEndData,
  calculateLeftHandleDragEndData,
  calculateSliderDragEndData,
  calculateRightHandleBounds
} from '../TimelineSlider.utils'

describe('Unit tests for TimelineSlider Utils', () => {
  test('Ensure isLeftHandleWithinBounds works', async () => {
    // test for movement within bounds
    expect(
      isLeftHandleWithinBounds({
        draggableEvent: { movementX: 5 } as MouseEvent,
        leftOffset: 50,
        minSliderWidth: 50,
        width: 500
      })
    ).toBe(true)

    // test for movement outside of container bounds
    expect(
      isLeftHandleWithinBounds({
        draggableEvent: { movementX: -5 } as MouseEvent,
        leftOffset: 0,
        minSliderWidth: 50,
        width: 100
      })
    ).toBe(false)

    // test for movement to shrink less than minimum width
    expect(
      isLeftHandleWithinBounds({
        draggableEvent: { movementX: -60 } as MouseEvent,
        leftOffset: 0,
        minSliderWidth: 50,
        width: 100
      })
    ).toBe(false)
  })

  test('Ensure isSliderWithinBounds works', async () => {
    // test for movement within bounds
    expect(
      isSliderWithinBounds({
        draggableEvent: { movementX: 50 } as MouseEvent,
        leftOffset: 40,
        width: 100,
        containerWidth: 500
      })
    ).toBe(true)

    // test for movement outside of container bounds (left side)
    expect(
      isSliderWithinBounds({
        draggableEvent: { movementX: -5 } as MouseEvent,
        leftOffset: 0,
        width: 100,
        containerWidth: 500
      })
    ).toBe(false)

    // test for movement outside of container bounds (right side)
    expect(
      isSliderWithinBounds({
        draggableEvent: { movementX: 200 } as MouseEvent,
        leftOffset: 400,
        width: 100,
        containerWidth: 500
      })
    ).toBe(false)
  })

  test('Ensure determineSliderPlacementForClick works', async () => {
    // clicking outside of slider container region
    expect(
      determineSliderPlacementForClick({
        clickEventX: 10,
        containerOffset: 50,
        containerWidth: 500,
        sliderAspects: { width: 100, leftOffset: 0, rightHandlePosition: 115, leftHandlePosition: 0 }
      })
    ).toBeUndefined()

    expect(
      determineSliderPlacementForClick({
        clickEventX: 600,
        containerOffset: 50,
        containerWidth: 500,
        sliderAspects: { width: 100, leftOffset: 0, rightHandlePosition: 115, leftHandlePosition: 0 }
      })
    ).toBeUndefined()

    // clicking on slider
    expect(
      determineSliderPlacementForClick({
        clickEventX: 50,
        containerOffset: 0,
        containerWidth: 500,
        sliderAspects: { width: 100, leftOffset: 0, rightHandlePosition: 115, leftHandlePosition: 0 }
      })
    ).toBeUndefined()

    // click on valid area
    expect(
      determineSliderPlacementForClick({
        clickEventX: 350,
        containerOffset: 0,
        containerWidth: 500,
        sliderAspects: { width: 100, leftOffset: 0, rightHandlePosition: 115, leftHandlePosition: 0 }
      })
    ).toEqual({
      leftHandlePosition: 0,
      leftOffset: 300,
      onClickTransition: 'left 250ms ease-in-out',
      rightHandlePosition: 115,
      width: 100
    })

    expect(
      determineSliderPlacementForClick({
        clickEventX: 420,
        containerOffset: 0,
        containerWidth: 500,
        sliderAspects: { width: 100, leftOffset: 0, rightHandlePosition: 115, leftHandlePosition: 0 }
      })
    ).toEqual({
      leftHandlePosition: 0,
      leftOffset: 370,
      onClickTransition: 'left 250ms ease-in-out',
      rightHandlePosition: 115,
      width: 100
    })
  })

  test('Ensure calculateSliderAspectsOnRightHandleDrag works', async () => {
    expect(
      calculateSliderAspectsOnRightHandleDrag(
        { width: 150, leftOffset: 20, rightHandlePosition: 200, leftHandlePosition: 20 },
        { deltaX: 10 } as DraggableData
      )
    ).toEqual({
      leftHandlePosition: 20,
      leftOffset: 20,
      onClickTransition: undefined,
      rightHandlePosition: 210,
      width: 160
    })
  })

  test('Ensure calculateSliderAspectsOnLeftHandleDrag works', async () => {
    expect(
      calculateSliderAspectsOnLeftHandleDrag(
        { width: 150, leftOffset: 20, rightHandlePosition: 200, leftHandlePosition: 20 },
        { movementX: -10 } as MouseEvent
      )
    ).toEqual({
      leftHandlePosition: 20,
      leftOffset: 10,
      onClickTransition: undefined,
      rightHandlePosition: 210,
      width: 160
    })

    expect(
      calculateSliderAspectsOnLeftHandleDrag(
        { width: 150, leftOffset: 20, rightHandlePosition: 200, leftHandlePosition: 20 },
        { movementX: 30 } as MouseEvent
      )
    ).toEqual({
      leftHandlePosition: 20,
      leftOffset: 50,
      onClickTransition: undefined,
      rightHandlePosition: 170,
      width: 120
    })
  })

  test('Ensure that calculateSliderAspectsOnDrag works', async () => {
    expect(
      calculateSliderAspectsOnDrag({ width: 150, leftHandlePosition: 0, rightHandlePosition: 150, leftOffset: 0 }, {
        movementX: 10
      } as MouseEvent)
    ).toEqual({
      leftHandlePosition: 0,
      leftOffset: 10,
      onClickTransition: undefined,
      rightHandlePosition: 150,
      width: 150
    })
  })

  test('Ensure that calculateRightHandleDragEndData works', async () => {
    // drag to end of container
    expect(
      calculateRightHandleDragEndData(
        { width: 150, leftHandlePosition: 300, rightHandlePosition: 450, leftOffset: 300 },
        { deltaX: 50 } as DraggableData,
        500
      )
    ).toEqual({
      endX: 500,
      endXPercentage: 1,
      startX: 300,
      startXPercentage: 0.6
    })

    // drag left
    expect(
      calculateRightHandleDragEndData(
        { width: 150, leftHandlePosition: 300, rightHandlePosition: 450, leftOffset: 300 },
        { deltaX: -50 } as DraggableData,
        500
      )
    ).toEqual({
      endX: 400,
      endXPercentage: 0.8,
      startX: 300,
      startXPercentage: 0.6
    })
  })

  test('Ensure calculateLeftHandleDragEndData works correctly', async () => {
    // drag left to the beginning of container
    expect(
      calculateLeftHandleDragEndData(
        { width: 150, leftHandlePosition: 200, rightHandlePosition: 350, leftOffset: 200 },
        { movementX: -200 } as MouseEvent,
        500
      )
    ).toEqual({
      endX: 350,
      endXPercentage: 0.7,
      startX: 0,
      startXPercentage: 0
    })

    // drag right
    expect(
      calculateLeftHandleDragEndData(
        { width: 150, leftHandlePosition: 200, rightHandlePosition: 350, leftOffset: 200 },
        { movementX: -200 } as MouseEvent,
        500
      )
    ).toEqual({
      endX: 350,
      endXPercentage: 0.7,
      startX: 0,
      startXPercentage: 0
    })
  })

  test('Ensure calculateSliderDragEndData works correctly', async () => {
    // move to end of container
    expect(
      calculateSliderDragEndData(
        { width: 150, leftHandlePosition: 200, rightHandlePosition: 350, leftOffset: 200 },
        { movementX: 200 } as MouseEvent,
        500
      )
    ).toEqual({
      endX: 550,
      endXPercentage: 1.1,
      startX: 400,
      startXPercentage: 0.8
    })

    // move to edge of container
    expect(
      calculateSliderDragEndData(
        { width: 150, leftHandlePosition: 200, rightHandlePosition: 350, leftOffset: 200 },
        { movementX: 100 } as MouseEvent,
        500
      )
    ).toEqual({
      endX: 450,
      endXPercentage: 0.9,
      startX: 300,
      startXPercentage: 0.6
    })

    //  move left
    expect(
      calculateSliderDragEndData(
        { width: 150, leftHandlePosition: 200, rightHandlePosition: 350, leftOffset: 200 },
        { movementX: -150 } as MouseEvent,
        500
      )
    ).toEqual({
      endX: 200,
      endXPercentage: 0.4,
      startX: 50,
      startXPercentage: 0.1
    })
  })

  test('Ensure calculateRightHandleBounds works correctly', async () => {
    expect(
      calculateRightHandleBounds({ width: 50, leftOffset: 0, leftHandlePosition: 0, rightHandlePosition: 50 }, 150, 25)
    ).toEqual({
      left: 25,
      right: 150
    })
  })
})
