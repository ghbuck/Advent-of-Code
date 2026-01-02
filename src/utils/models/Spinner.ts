import kleur from 'kleur'

interface SpinnerOptions {
  intervalMs?: number
  color?: kleur.Color
}

export class Spinner {
  private timeout: NodeJS.Timeout | null
  private color: kleur.Color
  private intervalMs: number
  private frames: string[] = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  private currentFrameIndex: number
  private message: string

  constructor(message: string, { intervalMs, color }: SpinnerOptions = {}) {
    this.message = message
    this.color = color ?? kleur.cyan
    this.currentFrameIndex = 0
    this.intervalMs = intervalMs ?? 100
    this.timeout = null
  }

  private write(...args: string[]) {
    process.stdout.write(this.color('\r' + args.join(' ')))
  }

  start() {
    this.timeout = setInterval(() => {
      this.write(this.frames[this.currentFrameIndex], this.message)
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length
    }, this.intervalMs)
  }

  stop(finalMessage?: string) {
    if (this.timeout) {
      clearInterval(this.timeout)
      this.write(finalMessage ?? '')
    }
  }

  setMessage(message: string) {
    this.message = message
  }
}
