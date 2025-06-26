import React from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

interface AuditPanelProps {
  code: string
}

interface AuditIssue {
  type: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  line?: number
  suggestion: string
}

const AuditPanel: React.FC<AuditPanelProps> = ({ code }) => {
  const analyzeContract = (): AuditIssue[] => {
    // Only analyze if there's actual code in the IDE
    if (!code || code.trim().length === 0) {
      return []
    }

    const issues: AuditIssue[] = []
    const lines = code.split('\n')

    // Check for missing access control
    const hasOwnerPattern = /owner|onlyOwner|Ownable/i
    const hasModifiers = /modifier\s+\w+/
    const hasRestrictedFunctions = /function\s+\w+.*\b(onlyOwner|onlyAdmin|restricted)\b/
    
    if (!hasOwnerPattern.test(code) && !hasModifiers.test(code) && !hasRestrictedFunctions.test(code)) {
      const functionLines = lines.filter((line, index) => {
        const trimmed = line.trim()
        return trimmed.includes('function') && 
               (trimmed.includes('public') || trimmed.includes('external')) &&
               !trimmed.includes('view') && 
               !trimmed.includes('pure')
      })
      
      if (functionLines.length > 0) {
        issues.push({
          type: 'high',
          title: 'Missing Access Control',
          description: 'Contract functions lack proper access control mechanisms',
          suggestion: 'Add modifiers like onlyOwner to restrict function access. Consider using OpenZeppelin\'s Ownable contract.'
        })
      }
    }

    // Check for reentrancy protection
    const hasPayableFunctions = /function\s+\w+.*payable/
    const hasReentrancyGuard = /ReentrancyGuard|nonReentrant/
    
    if (hasPayableFunctions.test(code) && !hasReentrancyGuard.test(code)) {
      issues.push({
        type: 'critical',
        title: 'Potential Reentrancy Vulnerability',
        description: 'Payable functions without reentrancy protection detected',
        suggestion: 'Implement reentrancy guards using OpenZeppelin ReentrancyGuard or follow checks-effects-interactions pattern'
      })
    }

    // Check for events
    const hasEvents = /event\s+\w+/
    const hasStateChangingFunctions = lines.some(line => {
      const trimmed = line.trim()
      return trimmed.includes('function') && 
             !trimmed.includes('view') && 
             !trimmed.includes('pure') &&
             (trimmed.includes('public') || trimmed.includes('external'))
    })
    
    if (!hasEvents.test(code) && hasStateChangingFunctions) {
      issues.push({
        type: 'medium',
        title: 'Missing Events',
        description: 'Contract lacks event emissions for important state changes',
        suggestion: 'Add events to track important contract interactions for better transparency and off-chain monitoring'
      })
    }

    // Check for unsafe external calls
    lines.forEach((line, index) => {
      const lineNumber = index + 1
      const trimmedLine = line.trim()

      // Check for tx.origin usage
      if (trimmedLine.includes('tx.origin')) {
        issues.push({
          type: 'high',
          title: 'Use of tx.origin',
          description: 'tx.origin should not be used for authorization',
          line: lineNumber,
          suggestion: 'Use msg.sender instead of tx.origin for authorization checks'
        })
      }

      // Check for timestamp dependence
      if (trimmedLine.includes('block.timestamp') || trimmedLine.includes('now')) {
        issues.push({
          type: 'medium',
          title: 'Timestamp Dependence',
          description: 'Contract relies on block.timestamp which can be manipulated by miners',
          line: lineNumber,
          suggestion: 'Avoid using timestamps for critical logic or use block numbers with appropriate tolerance'
        })
      }

      // Check for unchecked external calls
      if (trimmedLine.includes('.call(') || trimmedLine.includes('.delegatecall(')) {
        if (!trimmedLine.includes('require(') && !trimmedLine.includes('if (')) {
          issues.push({
            type: 'high',
            title: 'Unchecked External Call',
            description: 'External call without checking return value',
            line: lineNumber,
            suggestion: 'Always check the return value of external calls and handle failures appropriately'
          })
        }
      }

      // Check for integer overflow (pre-0.8.0)
      if (trimmedLine.includes('pragma solidity') && !trimmedLine.includes('^0.8')) {
        if (trimmedLine.includes('+') || trimmedLine.includes('-') || trimmedLine.includes('*')) {
          issues.push({
            type: 'medium',
            title: 'Potential Integer Overflow',
            description: 'Arithmetic operations without overflow protection in older Solidity versions',
            line: lineNumber,
            suggestion: 'Use SafeMath library or upgrade to Solidity ^0.8.0 for built-in overflow protection'
          })
        }
      }
    })

    // Check for missing SPDX license
    if (!code.includes('SPDX-License-Identifier')) {
      issues.push({
        type: 'info',
        title: 'Missing License Identifier',
        description: 'Contract lacks SPDX license identifier',
        suggestion: 'Add SPDX-License-Identifier comment at the top of the file (e.g., // SPDX-License-Identifier: MIT)'
      })
    }

    // Check for floating pragma
    const pragmaMatch = code.match(/pragma solidity\s+([^;]+);/)
    if (pragmaMatch && !pragmaMatch[1].includes('^')) {
      issues.push({
        type: 'low',
        title: 'Floating Pragma',
        description: 'Contract uses a floating pragma version',
        suggestion: 'Lock pragma to a specific compiler version to ensure consistent compilation (e.g., pragma solidity 0.8.19;)'
      })
    }

    return issues
  }

  const issues = analyzeContract()

  const getIssueIcon = (type: AuditIssue['type']) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'low':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'info':
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getIssueColor = (type: AuditIssue['type']) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'high':
        return 'border-red-200 bg-red-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      case 'low':
        return 'border-blue-200 bg-blue-50'
      case 'info':
        return 'border-gray-200 bg-gray-50'
    }
  }

  const criticalCount = issues.filter(i => i.type === 'critical').length
  const highCount = issues.filter(i => i.type === 'high').length
  const mediumCount = issues.filter(i => i.type === 'medium').length
  const lowCount = issues.filter(i => i.type === 'low').length

  // Show message if no code in IDE
  if (!code || code.trim().length === 0) {
    return (
      <div className="h-full bg-white border-t border-gray-200 flex flex-col">
        <div className="p-3 lg:p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-400" />
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Security Audit</h3>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Shield className="w-12 lg:w-16 h-12 lg:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">No Code to Audit</h3>
            <p className="text-sm lg:text-base text-gray-600">
              Add Solidity code to the IDE to run security analysis.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white border-t border-gray-200 flex flex-col">
      <div className="p-3 lg:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Security Audit</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {criticalCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                {criticalCount} Critical
              </span>
            )}
            {highCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                {highCount} High
              </span>
            )}
            {mediumCount > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                {mediumCount} Medium
              </span>
            )}
            {lowCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {lowCount} Low
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 lg:p-4">
        {issues.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <CheckCircle className="w-12 lg:w-16 h-12 lg:h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">No Issues Found</h3>
            <p className="text-sm lg:text-base text-gray-600">
              Your smart contract passed all security checks!
            </p>
          </div>
        ) : (
          <div className="space-y-3 lg:space-y-4">
            {issues.map((issue, index) => (
              <div
                key={index}
                className={`p-3 lg:p-4 border rounded-lg ${getIssueColor(issue.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm lg:text-base font-semibold text-gray-900">
                        {issue.title}
                      </h4>
                      {issue.line && (
                        <span className="text-xs text-gray-500">Line {issue.line}</span>
                      )}
                    </div>
                    <p className="text-xs lg:text-sm text-gray-700 mb-2">
                      {issue.description}
                    </p>
                    <div className="bg-white/50 p-2 lg:p-3 rounded border">
                      <p className="text-xs lg:text-sm text-gray-600">
                        <strong>Suggestion:</strong> {issue.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditPanel
