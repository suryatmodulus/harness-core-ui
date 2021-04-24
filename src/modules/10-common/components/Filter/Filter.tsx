import React, { ReactElement, useEffect } from 'react'
import * as Yup from 'yup'
import { Drawer, IDrawerProps } from '@blueprintjs/core'
import { Formik, FormikProps, FormikErrors } from 'formik'
import { truncate } from 'lodash-es'
import { FormikForm, Button, Layout, OverlaySpinner } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { CrudOperation, FilterCRUD, FilterCRUDRef } from './FilterCRUD/FilterCRUD'
import type { FilterInterface, FilterDataInterface } from './Constants'

import css from './Filter.module.scss'

const MAX_FILTER_NAME_LENGTH = 30
const KEY_CODE_FOR_ENTER_KEY = 13

export interface FilterProps<T, U> extends Partial<Omit<FormikProps<T>, 'onSubmit' | 'initialValues'>> {
  formFields: React.ReactElement
  initialFilter: FilterDataInterface<T, U>
  filters?: U[]
  isRefreshingFilters: boolean
  /*TODO @vardan fix the type later on*/
  // onApply: FormikProps<T>['onSubmit']
  onApply: (formData: T) => void
  onClose: () => void
  onSaveOrUpdate: (isUpdate: boolean, data: FilterDataInterface<T, U>) => Promise<void>
  onDelete: (identifier: string) => Promise<void>
  onFilterSelect: (identifier: string) => void
  onValidate?: (values: Partial<T>) => FormikErrors<Partial<T>>
  onClear?: () => void
  dataSvcConfig?: Map<CrudOperation, (...rest: any[]) => Promise<any>>
  ref?: FilterFowardRef<U>
  onSuccessfulCrudOperation?: () => Promise<void>
  validationSchema?: Yup.ObjectSchema
  isOpen?: boolean
}

export interface FilterRef<U> {
  saveOrUpdateFilterHandler: ((isUpdate: boolean, payload: U) => Promise<U | undefined>) | undefined
  deleteFilterHandler: ((identifier: string) => Promise<void>) | undefined
  duplicateFilterHandler: ((identifier: string) => Promise<void>) | undefined
}

export type FilterFowardRef<U> =
  | ((instance: FilterRef<U> | null) => void)
  | React.MutableRefObject<FilterRef<U> | null>
  | null

const FilterRef = <T, U extends FilterInterface>(props: FilterProps<T, U>, filterRef: FilterFowardRef<U>) => {
  const {
    formFields,
    onApply,
    onClose,
    initialFilter,
    filters,
    onSaveOrUpdate,
    onDelete,
    onFilterSelect,
    onValidate,
    isRefreshingFilters,
    onClear,
    dataSvcConfig,
    onSuccessfulCrudOperation,
    validationSchema,
    isOpen
  } = props
  const { getString } = useStrings()
  const filterCRUDRef = React.useRef<FilterCRUDRef<U> | null>(null)

  useEffect(() => {
    if (!filterRef) return

    if (typeof filterRef === 'function') {
      return
    }

    filterRef.current = {
      deleteFilterHandler: filterCRUDRef.current?.deleteFilterHandler,
      saveOrUpdateFilterHandler: filterCRUDRef.current?.saveOrUpdateFilterHandler,
      duplicateFilterHandler: filterCRUDRef.current?.duplicateFilterHandler
    }
  })

  const defaultPageDrawerProps: IDrawerProps = {
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    isOpen: typeof isOpen === 'undefined' ? true : isOpen,
    size: 700,
    position: 'right'
  }

  const getDrawerTitle = (isUpdate: boolean, filterName?: string): JSX.Element => {
    return (
      <Layout.Horizontal spacing="small" className={css.titleLayout}>
        <div className={css.title} title={filterName}>
          {isUpdate
            ? truncate(filterName, {
                length: MAX_FILTER_NAME_LENGTH
              })
            : getString('filters.newFilter')}
        </div>
      </Layout.Horizontal>
    )
  }

  const { name, filterVisibility, identifier } = initialFilter?.metadata
  const isUpdate = (name !== '' && filterVisibility !== undefined) as boolean

  return (
    <Drawer {...defaultPageDrawerProps} onClose={onClose}>
      <Formik<T>
        onSubmit={onApply}
        initialValues={initialFilter.formValues}
        enableReinitialize={true}
        validate={values => {
          return onValidate?.(values)
        }}
        validationSchema={validationSchema ?? Yup.object()}
      >
        {formik => {
          return (
            <FormikForm
              onKeyDown={(keyEvent: KeyboardEvent) => {
                /* istanbul ignore else */ if ((keyEvent.charCode || keyEvent.keyCode) === KEY_CODE_FOR_ENTER_KEY) {
                  keyEvent.preventDefault()
                }
              }}
            >
              <div className={css.main}>
                <section className={css.formSection}>
                  <Layout.Vertical
                    spacing="large"
                    padding={{ top: 'xlarge', left: 'xlarge', right: 'xlarge' }}
                    height="100%"
                  >
                    {getDrawerTitle(isUpdate, name)}
                    <Layout.Vertical className={css.layout} padding={{ top: 'medium' }}>
                      {isRefreshingFilters ? (
                        <OverlaySpinner show={true} className={css.loading}>
                          <></>
                        </OverlaySpinner>
                      ) : (
                        <>
                          <div>
                            {formFields && React.cloneElement(formFields, { ...formFields.props, formikProps: formik })}
                          </div>
                          <Layout.Horizontal spacing={'medium'} padding={{ bottom: 'xsmall' }}>
                            <Button type="submit" intent="primary" text={getString('filters.apply')} />
                            <Button
                              type={'reset'}
                              intent={'none'}
                              text={getString('filters.clearAll')}
                              onClick={(event: React.MouseEvent<Element, MouseEvent>) => {
                                event.preventDefault()
                                onClear?.()
                                formik?.setValues({} as T)
                              }}
                            />
                          </Layout.Horizontal>
                        </>
                      )}
                    </Layout.Vertical>
                  </Layout.Vertical>
                </section>
                <section className={css.filterSection}>
                  <FilterCRUD<U>
                    isRefreshingFilters={isRefreshingFilters}
                    filters={filters}
                    onSaveOrUpdate={async (_isUpdate: boolean, formdata: U): Promise<void> => {
                      await onSaveOrUpdate(_isUpdate, {
                        metadata: formdata,
                        formValues: formik.values
                      } as FilterDataInterface<T, U>)
                    }}
                    initialValues={{ name, filterVisibility, identifier } as U}
                    onClose={onClose}
                    onDelete={onDelete}
                    onFilterSelect={onFilterSelect}
                    ref={filterCRUDRef}
                    dataSvcConfig={dataSvcConfig}
                    onSuccessfulCrudOperation={onSuccessfulCrudOperation}
                  />
                </section>
              </div>
            </FormikForm>
          )
        }}
      </Formik>
    </Drawer>
  )
}

export const Filter = React.forwardRef(FilterRef) as <T, U extends FilterInterface>(
  props: FilterProps<T, U>,
  filterRef: FilterFowardRef<U>
) => ReactElement
