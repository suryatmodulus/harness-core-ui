/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum FeatureFlag {
  CDNG_ENABLED = 'CDNG_ENABLED',
  CVNG_ENABLED = 'CVNG_ENABLED',
  CING_ENABLED = 'CING_ENABLED',
  CENG_ENABLED = 'CENG_ENABLED',
  CFNG_ENABLED = 'CFNG_ENABLED',
  NG_DASHBOARDS = 'NG_DASHBOARDS',
  NG_DASHBOARD_LANDING_PAGE = 'NG_DASHBOARD_LANDING_PAGE',
  CI_OVERVIEW_PAGE = 'CI_OVERVIEW_PAGE',
  TI_CALLGRAPH = 'TI_CALLGRAPH',
  NG_TEMPLATES = 'NG_TEMPLATES',
  CE_AS_KUBERNETES_ENABLED = 'CE_AS_KUBERNETES_ENABLED',
  NG_LICENSES_ENABLED = 'NG_LICENSES_ENABLED',
  PLANS_ENABLED = 'PLANS_ENABLED',
  ARGO_PHASE1 = 'ARGO_PHASE1',
  ARGO_PHASE2_MANAGED = 'ARGO_PHASE2_MANAGED',
  FF_GITSYNC = 'FF_GITSYNC',
  FF_PIPELINE = 'FF_PIPELINE',
  FFM_1512 = 'FFM_1512',
  FEATURE_ENFORCEMENT_ENABLED = 'FEATURE_ENFORCEMENT_ENABLED',
  RUN_INDIVIDUAL_STAGE = 'RUN_INDIVIDUAL_STAGE',
  OPA_PIPELINE_GOVERNANCE = 'OPA_PIPELINE_GOVERNANCE',
  FREE_PLAN_ENABLED = 'FREE_PLAN_ENABLED',
  VIEW_USAGE_ENABLED = 'VIEW_USAGE_ENABLED',
  RESOURCE_CENTER_ENABLED = 'RESOURCE_CENTER_ENABLED',
  NG_GIT_FULL_SYNC = 'NG_GIT_FULL_SYNC',
  CI_VM_INFRASTRUCTURE = 'CI_VM_INFRASTRUCTURE',
  FFM_1859 = 'FFM_1859', // development only flag for epic https://harness.atlassian.net/browse/FFM-1638,
  SERVICENOW_NG_INTEGRATION = 'SERVICENOW_NG_INTEGRATION',
  AUDIT_TRAIL_WEB_INTERFACE = 'AUDIT_TRAIL_WEB_INTERFACE',
  NG_NATIVE_HELM = 'NG_NATIVE_HELM',
  CHI_CUSTOM_HEALTH = 'CHI_CUSTOM_HEALTH',
  AZURE_SAML_150_GROUPS_SUPPORT = 'AZURE_SAML_150_GROUPS_SUPPORT',
  ERROR_TRACKING_ENABLED = 'ERROR_TRACKING_ENABLED'
}
