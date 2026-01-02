interface QueueNode<T> {
  item: T
  priority: number
}

export class Queue<T> {
  private isPriorityQueue: boolean
  private queue: QueueNode<T>[] = []

  constructor(isPriorityQueue = false) {
    this.isPriorityQueue = isPriorityQueue
  }

  enqueue(item: T, priority = 0): void {
    this.queue.push({ item, priority })

    if (this.isPriorityQueue) {
      this.queue.sort((a, b) => a.priority - b.priority)
    }
  }

  dequeue(): T | undefined {
    return this.queue.shift()?.item
  }

  size(): number {
    return this.queue.length
  }

  isEmpty(): boolean {
    return this.queue.length === 0
  }
}
