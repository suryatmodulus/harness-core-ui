import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { NGTooltipEditorPortal } from '../TooltipEditor'

const getDefaultProps = (showTooltipEditor: boolean) => ({
  onEditorClose: jest.fn(),
  showTooltipEditor
})

describe('Tooltip editor tests', () => {
  const rootParent = document.createElement('div')
  const removeChildSpy = jest.spyOn(rootParent, 'removeChild')
  beforeEach(() => {
    rootParent.id = 'ngTooltipEditorRootParent'
    document.body.appendChild(rootParent)
  })

  afterEach(() => {
    document.body.removeChild(rootParent)
  })

  test('if it renders in portal', async () => {
    const props = getDefaultProps(true)
    const { queryByText, unmount } = render(<NGTooltipEditorPortal {...props} />)
    expect(queryByText('No toolip IDs found in the present context.')).toBeTruthy()

    unmount()
    await waitFor(() => expect(removeChildSpy).toHaveBeenCalled())
  })

  test('if it renders null if flag is toggled', () => {
    const props = getDefaultProps(false)
    const { container } = render(<NGTooltipEditorPortal {...props} />)
    expect(container).toMatchInlineSnapshot('<div />')
  })
})

describe('Test if DOM doesnt have root parent', () => {
  test('if it renders null', () => {
    const props = getDefaultProps(true)
    const { container } = render(<NGTooltipEditorPortal {...props} />)
    expect(container).toMatchInlineSnapshot('<div />')
  })
})
