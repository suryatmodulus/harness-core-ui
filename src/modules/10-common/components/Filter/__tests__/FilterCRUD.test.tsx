import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent, findByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { FilterCRUD } from '../FilterCRUD/FilterCRUD'
import filtersData from '../mocks/filters-mock.json'

const props = {
  filters: filtersData?.data?.content as any,
  isLeftFilterDirty: false,
  initialValues: { name: '', visible: undefined, identifier: '' },
  onSaveOrUpdate: jest.fn(),
  onDelete: jest.fn(),
  onClose: jest.fn(),
  onDuplicate: jest.fn(),
  onFilterSelect: jest.fn(),
  enableEdit: false,
  isRefreshingFilters: false
}

describe('Test FilterCRUD component', () => {
  const setup = () =>
    render(
      <TestWrapper>
        <FilterCRUD {...props} />
      </TestWrapper>
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Initial render should match snapshot', async () => {
    const { container } = setup()
    expect(container).toMatchSnapshot()
  })

  test('Enable edit mode', async () => {
    const { container, getByText } = setup()
    const newfilterBtn = getByText('filters.newFilter')
    await act(async () => {
      fireEvent.click(newfilterBtn)
    })
    expect(container).toMatchSnapshot()
  })

  test('Add a new filter with visibke to Everyone', async () => {
    const filterName = 'filterWithUserOnlyVisibility'
    const { container, getByText } = setup()
    /* Adding a new filter */
    const newfilterBtn = getByText('filters.newFilter')
    await act(async () => {
      fireEvent.click(newfilterBtn!)
    })

    const filterNameInput = container.querySelector('input[name="name"]') as HTMLElement

    await act(async () => {
      fireEvent.change(filterNameInput!, {
        target: { value: filterName }
      })
      fireEvent.click(getByText('filters.visibleToEveryone')!)
    })
    expect(container).toMatchSnapshot()

    await act(async () => {
      const submitBtn = await findByText(container, 'save')
      fireEvent.click(submitBtn)
    })

    expect(props.onSaveOrUpdate).toBeCalledWith(false, {
      filterVisibility: 'EveryOne',
      identifier: undefined,
      name: 'filterWithUserOnlyVisibility'
    })
    expect(container).toMatchSnapshot()

    // enable for edit scenario
    // expect(menuBtn).toBeDefined()
    //
    // const popover = findPopoverContainer()
    // expect(popover).toBeNull()
    // if (popover) {
    //   fireEvent.click(getByTextAlt(popover, 'Edit')!)u
    //   const updateBtn = getByText('Update')
    //   expect(updateBtn).not.toBeDefined()
    //   fireEvent.change(filterNameInput, {
    //     target: { value: updatedFilterName }
    //   })
    //   waitFor(() => fireEvent.click(updateBtn))
    //   expect(getByText(updatedFilterName)).toBeDefined()
    // }
  })

  test('Add a new filter with visible to OnlyMe', async (): Promise<void> => {
    const filterName = 'filterWithUserOnlyVisibility'
    const { container, getByText } = setup()
    /* Adding a new filter */
    const newfilterBtn = getByText('filters.newFilter')
    await act(async () => {
      fireEvent.click(newfilterBtn!)
    })

    const filterNameInput = container.querySelector('input[name="name"]') as HTMLElement

    await act(async () => {
      fireEvent.change(filterNameInput!, {
        target: { value: filterName }
      })
      fireEvent.click(getByText('filters.visibileToOnlyMe')!)
    })
    expect(container).toMatchSnapshot()

    // click cancel
    await act(async () => {
      const cancelBtn = await findByText(container, 'cancel')
      fireEvent.click(cancelBtn)
    })

    expect(props.onSaveOrUpdate).not.toBeCalled()
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(newfilterBtn!)
    })

    const filterNameNew = container.querySelector('input[name="name"]') as HTMLElement

    await act(async () => {
      fireEvent.change(filterNameNew!, {
        target: { value: filterName }
      })
      fireEvent.click(getByText('filters.visibileToOnlyMe')!)
    })
    expect(container).toMatchSnapshot()
    await act(async () => {
      const submitBtn = await findByText(container, 'save')
      fireEvent.click(submitBtn)
    })
    expect(container).toMatchSnapshot()
    expect(props.onSaveOrUpdate).toBeCalledWith(false, {
      filterVisibility: 'OnlyCreator',
      identifier: undefined,
      name: 'filterWithUserOnlyVisibility'
    })
    expect(container).toMatchSnapshot()
  })
})
