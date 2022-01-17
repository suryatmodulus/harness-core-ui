/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const PREFIX_CCM_EVENTS = 'ccm_'

export const USER_JOURNEY_EVENTS = {
  AS_NAV_CLICK: PREFIX_CCM_EVENTS + 'as_nav_click',
  LOAD_AS_LANDING_PAGE: PREFIX_CCM_EVENTS + 'load_as_landing_page',
  CREATE_NEW_AS_CLICK: PREFIX_CCM_EVENTS + 'create_new_as_button_click',
  SELECT_CLOUD_PROVIDER: PREFIX_CCM_EVENTS + 'select_cloud_provider',
  RULE_CREATION_STEP_1: PREFIX_CCM_EVENTS + 'rule_creation_step_1',
  RULE_CREATION_STEP_2: PREFIX_CCM_EVENTS + 'rule_creation_step_2',
  RULE_CREATION_STEP_3: PREFIX_CCM_EVENTS + 'rule_creation_step_3',
  SELECT_MANAGED_RESOURCES: PREFIX_CCM_EVENTS + 'select_managed_resources',
  CREATE_DEPENDENCY: PREFIX_CCM_EVENTS + 'create_dependency',
  SAVE_RULE_CLICK: PREFIX_CCM_EVENTS + 'save_rule_click',
  CREATE_FIXED_SCHEDULE: PREFIX_CCM_EVENTS + 'create_fixed_schedule',
  LOAD_AS_SUMMARY_PAGE: PREFIX_CCM_EVENTS + 'load_as_summary_page',
  LOAD_RULE_DETAILS_WINDOW: PREFIX_CCM_EVENTS + 'load_rule_details_window'
}
