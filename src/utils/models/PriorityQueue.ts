interface QueueNode<T> {
  item: T
  priority: number
}

export class PriorityQueue<T> {
  private queue: QueueNode<T>[] = []

  enqueue(item: T, priority = 0): void {
    this.queue.push({ item, priority })
    this.queue.sort((a, b) => a.priority - b.priority)
  }

  dequeue(): T | undefined {
    return this.queue.shift()?.item
  }

  isEmpty(): boolean {
    return this.queue.length === 0
  }
}
