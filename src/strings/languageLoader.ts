/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export type LangLocale = 'es' | 'en' | 'en-IN' | 'en-US' | 'en-UK'

export default function languageLoader(langId: LangLocale): Promise<Record<string, Record<string, any>>> {
  switch (langId) {
    case 'es':
      return import('strings/strings.es.yaml')
    case 'en':
    case 'en-US':
    case 'en-IN':
    case 'en-UK':
    default:
      return import('strings/strings.en.yaml')
  }
}
