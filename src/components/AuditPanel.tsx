import React from 'react'
import { Shield, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { ContractElement, AuditIssue } from '../types'

interface AuditPanelProps {
  elements: ContractElement[]
  code: string
}

const AuditPanel: React.FC<AuditPanelProps> = ({ elements, code }) => {
  // Mock audit issues based on contract elements
  const generateAuditIssues = (): AuditIssue[] => {
    const issues: AuditIssue[] = []

    // Check for common security issues
    elements.forEach((element) => {
      if (element.type === 'function' && element.config.payable && !element.config.name?.includes('withdraw')) {
        issues.push({
          id: `payable-${element.id}`,
          severity: 'high',
          title: 'Payable Function Without Access Control',
          description: `Function "${element.config.name}" is payable but may lack proper access control`,
          suggestion: 'Add onlyOwner modifier or similar access control mechanism'
        })
      }

      if (element.type === 'variable' && element.config.visibility === 'public' && element.config.dataType === 'address') {
        issues.push({
          id: `public-address-${element.id}`,
          severity: 'medium',
          title: 'Public Address Variable',
          description: `Address variable "${element.config.name}" is publicly accessible`,
          suggestion: 'Consider if this address should be public or add getter function with access control'
        })
      }

      if (element.type === 'function' && !element.config.visibility) {
        issues.push({
          id: `no-visibility-${element.id}`,
          severity: 'medium',
          title: 'Missing Function Visibility',
          description: `Function "${element.config.name}" lacks explicit visibility modifier`,
          suggestion: 'Add explicit visibility modifier (public, external, internal, or private)'
        })
      }
    })

    // Add some general best practice suggestions
    if (elements.length > 0) {
      const hasConstructor = elements.some(e => e.type === 'constructor')
      if (!hasConstructor) {
        issues.push({
          id: 'no-constructor',
          severity: 'low',
          title: 'Missing Constructor',
          description: 'Contract does not have a constructor for initialization',
          suggestion: 'Consider adding a constructor to initialize contract state'
        })
      }

      const hasEvents = elements.some(e => e.type === 'event')
      if (!hasEvents) {
        issues.push({
          id: 'no-events',
          severity: 'info',
          title: 'No Events Defined',
          description: 'Contract does not emit any events',
          suggestion: 'Consider adding events for important state changes to improve transparency'
        })
      }
    }

    return issues
  }

  const issues = generateAuditIssues()

  const severityConfig = {
    critical: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    high: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    medium: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    low: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    info: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
  }

  const criticalCount = issues.filter(i => i.severity === 'critical').length
  const highCount = issues.filter(i => i.severity === 'high').length
  const mediumCount = issues.filter(i => i.severity === 'medium').length
  const lowCount = issues.filter(i => i.severity === 'low').length

  return (
    <div className="h-1/2 bg-white border-t border-gray-200 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Security Audit</h3>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          {criticalCount > 0 && <span className="text-red-600 font-medium">{criticalCount} Critical</span>}
          {highCount > 0 && <span className="text-red-500 font-medium">{highCount} High</span>}
          {mediumCount > 0 && <span className="text-yellow-600 font-medium">{mediumCount} Medium</span>}
          {lowCount > 0 && <span className="text-blue-600 font-medium">{lowCount} Low</span>}
          {issues.length === 0 && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">No Issues Found</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {issues.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Great Job!</h3>
            <p className="text-gray-600">
              No security issues detected in your smart contract. Keep following best practices!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => {
              const config = severityConfig[issue.severity]
              const Icon = config.icon
              
              return (
                <div
                  key={issue.id}
                  className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{issue.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color} ${config.bg} border ${config.border}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                      {issue.suggestion && (
                        <div className="text-sm text-gray-600">
                          <strong>Suggestion:</strong> {issue.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditPanel
