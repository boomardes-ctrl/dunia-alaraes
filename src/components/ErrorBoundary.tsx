import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">!</span>
            </div>
            <h2 className="text-2xl font-black mb-2">عذراً، حدث خطأ</h2>
            <p className="text-text-light mb-6">حاول تحديث الصفحة أو العودة لاحقاً</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
