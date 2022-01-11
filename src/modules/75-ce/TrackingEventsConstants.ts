/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const PREFIX_CCM_EVENTS = 'ccm_'

const RECOMMENDATION_EVENTS = {
  RECOMMENDATIONS_NAV_CLICK: PREFIX_CCM_EVENTS + 'recommendations_nav_click',
  RECOMMENDATIONS_SEE_ALL_OVERVIEW_PAGE: PREFIX_CCM_EVENTS + 'recommendations_see_all_overview_page',
  RECOMMENDATION_CLICK: PREFIX_CCM_EVENTS + 'recommendation_click',
  RECOMMENDATION_COST_PERFORMANCE_OPTIMISED_CLICK:
    PREFIX_CCM_EVENTS + 'recommendation_cost_performance_optimised_click',
  RECOMMENDATION_VIEW_MORE_CLICK: PREFIX_CCM_EVENTS + 'recommendation_view_more_click',
  RECOMMENDATION_EDIT_CPU: PREFIX_CCM_EVENTS + 'recommendation_edit_cpu',
  RECOMMENDATION_EDIT_RAM: PREFIX_CCM_EVENTS + 'recommendation_edit_ram',
  RECOMMENDATION_EDIT_MIN_NODE: PREFIX_CCM_EVENTS + 'recommendation_edit_min_node',
  NODE_RECOMMENDATION_EDIT_PREFERENCE: PREFIX_CCM_EVENTS + 'node_recommendation_edit_preference'
}

const PERSPECTIVE_EVENTS = {
  PERSPECTIVE_NAV_CLICK: PREFIX_CCM_EVENTS + 'perspective_nav_click',
  CREATE_NEW_PERSPECTIVE: PREFIX_CCM_EVENTS + 'create_new_perspective',
  ADD_PERSPECTIVE_RULE: PREFIX_CCM_EVENTS + 'add_perspective_rule',
  PERSPECTIVE_STEP1_NEXT: PREFIX_CCM_EVENTS + 'create_perspective_step1_next',
  CREATE_PERSPECTIVE_ADD_NEW_REPORT: PREFIX_CCM_EVENTS + 'create_perspective_add_new_report',
  CREATE_PERSPECTIVE_ADD_NEW_BUDGET: PREFIX_CCM_EVENTS + 'create_perspective_add_new_budget',
  SAVE_PERSPECTIVE: PREFIX_CCM_EVENTS + 'save_perspective',
  OPEN_PERSPECTIVE_DETAILS: PREFIX_CCM_EVENTS + 'open_perspective_details'
}

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
  LOAD_RULE_DETAILS_WINDOW: PREFIX_CCM_EVENTS + 'load_rule_details_window',
  ...PERSPECTIVE_EVENTS,
  ...RECOMMENDATION_EVENTS
}

export const PAGE_EVENTS = {
  PERSPECTIVE_LIST: PREFIX_CCM_EVENTS + 'perspective_page',
  PERSPECTIVE_DETAILS_PAGE: PREFIX_CCM_EVENTS + 'perspective_details_page',
  RECOMMENDATIONS_PAGE: PREFIX_CCM_EVENTS + 'recommendations_page',
  RECOMMENDATIONS_DETAILS_PAGE: PREFIX_CCM_EVENTS + 'recommendations_details_page'
}
