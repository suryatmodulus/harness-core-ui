/* eslint-disable @typescript-eslint/ban-types */
/* See https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-table */

import {
  UseColumnOrderInstanceProps,
  UseColumnOrderState,
  UseExpandedInstanceProps,
  UseFiltersColumnOptions,
  UseFiltersColumnProps,
  UseSortByColumnOptions,
  UseSortByColumnProps,
  UseSortByInstanceProps,
  UseSortByOptions,
  UseSortByState,
  UsePaginationOptions,
  UsePaginationInstanceProps,
  UsePaginationState
} from 'react-table'

declare module 'react-table' {
  export interface TableOptions<D extends object>
    extends UseSortByOptions<D>,
      UsePaginationOptions<D>,
      // note that having Record here allows you to add anything to the options, this matches the spirit of the
      // underlying js library, but might be cleaner if it's replaced by a more specific type that matches your
      // feature set, this is a safe default.
      Record<string, any> {}

  export interface TableInstance<D extends object = {}>
    extends UseColumnOrderInstanceProps<D>,
      UseExpandedInstanceProps<D>,
      UsePaginationInstanceProps<D>,
      UseSortByInstanceProps<D> {}

  export interface TableState<D extends object = {}>
    extends UseColumnOrderState<D>,
      UseSortByState<D>,
      UsePaginationState<D> {}

  export interface ColumnInterface<D extends object = {}>
    extends UseFiltersColumnOptions<D>,
      UseSortByColumnOptions<D> {}

  export interface ColumnInstance<D extends object = {}> extends UseFiltersColumnProps<D>, UseSortByColumnProps<D> {}
}
