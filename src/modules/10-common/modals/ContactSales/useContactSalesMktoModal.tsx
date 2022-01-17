/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState } from 'react'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type { StringsMap } from 'stringTypes'
import type { SubscriptionQueryParams } from '@common/interfaces/RouteInterfaces'
import css from './useContactSalesMktoModal.module.scss'

interface UseContactSalesModalProps {
  onSubmit?: (values: ContactSalesFormProps) => void
}

interface UseContactSalesModalPayload {
  openMarketoContactSales: () => void
  loading: boolean
}

export interface ContactSalesFormProps {
  fullName: string
  email: string
  countryName: string
  phone: {
    countryCode: string
    number: string
  }
  role: string
  orgName: string
  companySize: string
}

// everytime render we add two new title and subTitle to the form, hence need remove them before each time re-render
const removeInsertedElements = (): void => {
  document.querySelectorAll('.title').forEach(el => el.remove())
  document.querySelectorAll('.subTitle').forEach(el => el.remove())
}

const insertElements = ({
  getString
}: {
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
}): void => {
  const titleNode = document.createElement('div')
  titleNode.setAttribute('class', `title ${css.title}`)
  const title = document.createTextNode(getString('common.banners.trial.contactSales'))
  titleNode.appendChild(title)
  document.getElementById('mktoForm_1249')?.insertBefore(titleNode, document.getElementsByClassName('mktoFormRow')?.[0])

  const subTitleNode = document.createElement('div')
  const subTitle = document.createTextNode(getString('common.banners.trial.contactSalesForm.description'))
  subTitleNode.setAttribute('class', `subTitle ${css.subTitle}`)
  subTitleNode.appendChild(subTitle)
  document
    .getElementById('mktoForm_1249')
    ?.insertBefore(subTitleNode, document.getElementsByClassName('mktoFormRow')?.[0])
}

const setPlaceHolders = (): void => {
  document.getElementById('NumberOfEmployees')?.setAttribute('placeHolder', '')
}

// remove unneeded components from the form, like 'state' input and label here
const removeUnneededElements = (): void => {
  document.getElementById('LblState')?.parentElement?.parentElement?.remove()
}

const overrideCss = (): void => {
  const mktoModalContent = document.getElementsByClassName('mktoModalContent')?.[0]
  mktoModalContent?.setAttribute('class', cx(mktoModalContent?.getAttribute('class'), css.mktoModalContent))

  const formPhone = document.getElementById('formPhone')
  formPhone?.setAttribute('class', cx(formPhone?.getAttribute('class'), css.formPhone))
}

export const useContactSalesMktoModal = ({ onSubmit }: UseContactSalesModalProps): UseContactSalesModalPayload => {
  const { getString } = useStrings()
  const [loading, setLoading] = useState<boolean>(false)
  const { moduleCard, tab } = useQueryParams<SubscriptionQueryParams>()

  function openMarketoContactSales(): void {
    setLoading(true)
    window?.MktoForms2.loadForm('//go.harness.io', '924-CQO-224', 1249, function (form: any) {
      window?.MktoForms2.lightbox(form).show()
      form.onSuccess(function () {
        onSubmit?.(form.values)
        if (moduleCard || tab) {
          window.location.href = `${window.location.href}&&contactSales=success`
        } else {
          window.location.href = `${window.location.href}?contactSales=success`
        }
        return false
      })
    })
    window?.MktoForms2.onFormRender(function (form: any) {
      removeInsertedElements()
      insertElements({ getString })
      setPlaceHolders()
      removeUnneededElements()
      overrideCss()
      form.getFormElem()?.[0]?.setAttribute('data-mkto-ready', 'true')
      setLoading(false)
    })
  }
  return { openMarketoContactSales, loading }
}
