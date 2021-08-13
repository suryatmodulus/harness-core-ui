export class PubSubAction<TTypes, T, TResult> {
  subMap = new Map<TTypes, Array<(arg: T) => TResult>>()

  subscribe(type: TTypes, cb: (arg: T) => TResult): void {
    const item = this.subMap.get(type)
    if (item) {
      item.push(cb)
      this.subMap.set(type, item)
    } else {
      this.subMap.set(type, [cb])
    }
  }

  publish(type: TTypes, arg: T): void {
    const item = this.subMap.get(type)
    if (item) {
      item.forEach(cb => {
        cb(arg)
      })
    }
  }
  unsubscribe(type: TTypes): void {
    this.subMap.delete(type)
  }
  unsubscribeAll(): void {
    this.subMap.clear()
  }
}
