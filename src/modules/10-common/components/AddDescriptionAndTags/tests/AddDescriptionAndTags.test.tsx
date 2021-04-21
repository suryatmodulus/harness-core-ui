import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { StringsContext } from 'framework/strings/StringsContext'
import { AddDescriptionAndTagsWithIdentifier } from '../AddDescriptionAndTags'

function WrapperComponent(props: { defaultOpenFields?: string[] }): JSX.Element {
  return (
    <StringsContext.Provider value={{ data: {} as any, getString: key => key }}>
      <Formik initialValues={{}} onSubmit={() => undefined}>
        <FormikForm>
          <AddDescriptionAndTagsWithIdentifier identifierProps={{ inputLabel: 'name' }} {...props} />
        </FormikForm>
      </Formik>
    </StringsContext.Provider>
  )
}

describe('Unit tests for AddDescriptionTags Component', () => {
  test('Ensure description and tag fields open and close', async () => {
    const { container, getByText, getAllByText } = render(<WrapperComponent />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    expect(container.querySelector('[class*="expandedDescription"]')).toBeNull()
    expect(container.querySelector('[class*="expandedTags"]')).toBeNull()

    const descriptionButton = getByText('common.addDescription')
    fireEvent.click(descriptionButton)
    await waitFor(() => expect(container.querySelector('[class*="expandedDescription"]')).not.toBeNull())

    const tagsButton = getByText('common.addTags')
    fireEvent.click(tagsButton)
    await waitFor(() => expect(container.querySelector('[class*="expandedTags"]')).not.toBeNull())

    const hideButtons = getAllByText('common.hide')
    expect(hideButtons.length).toBe(2)

    fireEvent.click(hideButtons[0])
    await waitFor(() => expect(container.querySelector('[class*="expandedDescription"]')).toBeNull())

    fireEvent.click(hideButtons[1])
    await waitFor(() => expect(container.querySelector('[class*="expandedTags"]')).toBeNull())
  })

  test('Show default open fields (assuming values exist in formik) (Deprecated)', async () => {
    const { container } = render(<WrapperComponent defaultOpenFields={['description', 'tags']} />)

    await waitFor(() => expect(container.querySelector('textarea')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[class*="tagInput"]')).not.toBeNull())
  })
})
