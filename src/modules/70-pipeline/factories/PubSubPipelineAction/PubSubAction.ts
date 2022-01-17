/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export class PubSubAction<TTypes, T, TResult> {
  private subMap = new Map<TTypes, Array<(arg: T) => Promise<TResult>>>()

  subscribe(type: TTypes, cb: (arg: T) => Promise<TResult>): void {
    const item = this.subMap.get(type)
    if (item) {
      item.push(cb)
      this.subMap.set(type, item)
    } else {
      this.subMap.set(type, [cb])
    }
  }

  publish(type: TTypes, arg: T): Promise<TResult[]> {
    const item = this.subMap.get(type)
    const promiseAr: Array<Promise<TResult>> = []
    if (item) {
      item.forEach(cb => {
        promiseAr.push(cb(arg))
      })
    }
    return Promise.all(promiseAr)
  }
  unsubscribe(type: TTypes): void {
    this.subMap.delete(type)
  }
  unsubscribeAll(): void {
    this.subMap.clear()
  }
}
