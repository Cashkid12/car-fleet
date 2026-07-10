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
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-5">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineExclamationTriangle size={40} className="text-danger" />
            </div>
            <h1 className="text-[22px] font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-[#94A3B8] text-[15px] mb-8">The app encountered an unexpected error. Please try again.</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-2xl h-[52px] px-8 text-[15px] transition-all duration-200"
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