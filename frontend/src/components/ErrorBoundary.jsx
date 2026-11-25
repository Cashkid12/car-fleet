import { Component } from 'react'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-5">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-panel-soft">
              <HiOutlineExclamationTriangle size={28} className="text-ink" />
            </div>
            <h1 className="t-page mb-2">Something went wrong</h1>
            <p className="t-sm mb-8 text-ink-soft">
              The app encountered an unexpected error. Please try again.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }}
              className="btn btn-primary btn-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
