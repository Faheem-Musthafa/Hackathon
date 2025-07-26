import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // In a real app, you might want to send this to an error reporting service
    // like Sentry, LogRocket, etc.
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                An unexpected error occurred. Please try refreshing the page or going back to the home page.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left text-sm bg-muted p-2 rounded">
                  <summary className="cursor-pointer font-medium">Error details</summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Stack trace:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button onClick={this.handleRetry} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome}>
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}