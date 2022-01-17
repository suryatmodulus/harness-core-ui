/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const CUR_FEATURE = 'CUR'
export const EVENTS_FEATURE = 'EVENTS'
export const OPTIMIZATION_FEATURE = 'OPTIMIZATION'
export type feature = typeof CUR_FEATURE | typeof EVENTS_FEATURE | typeof OPTIMIZATION_FEATURE

export const CO_PERMISSION = 'CO'
export const CE_PERMISSION = 'CE'
export const COCE_PERMISSION = 'COCE'
export type permission = typeof COCE_PERMISSION | typeof CE_PERMISSION | typeof CO_PERMISSION

export const CROSS_ACCOUNT_ACCESS = 'crossAccountAccess'
export const FEATURES_ENABLED = 'featuresEnabled'
