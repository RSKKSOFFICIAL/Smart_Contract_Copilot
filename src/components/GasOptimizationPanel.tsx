import React from 'react'
import { Zap, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react'
import { ContractElement } from '../types'

interface GasOptimizationPanelProps {
  elements: ContractElement[]
  code: string
}

interface OptimizationSuggestion {
  type: 'high' | 'medium' | 'low'
  title: string
  description: string
  currentGas: number
  optimizedGas: number
  savings: number
  suggestion: string
}

const GasOptimizationPanel: React.FC<GasOptimizationPanelProps> = ({ elements, code }) => {
  const analyzeGasOptimization = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = []

    // Check for uint256 vs smaller uints
    const variables = elements.filter(el => el.type === 'variable')
    const uint256Variables = variables.filter(el => 
      el.config.dataType === 'uint256' || !el.config.dataType
    )
    
    if (uint256Variables.length > 0) {
      suggestions.push({
        type: 'medium',
        title: 'Optimize Variable Types',
        description: `${uint256Variables.length} variables using uint256 could potentially use smaller types`,
        currentGas: uint256Variables.length * 20000,
        optimizedGas: uint256Variables.length * 5000,
        savings: uint256Variables.length * 15000,
        suggestion: 'Use uint8, uint16, uint32 for smaller values to save storage gas'
      })
    }

    // Check for public vs private variables
    const publicVariables = variables.filter(el => 
      el.config.visibility === 'public' || !el.config.visibility
    )
    
    if (publicVariables.length > 2) {
      suggestions.push({
        type: 'low',
        title: 'Reduce Public Variables',
        description: `${publicVariables.length} public variables create automatic getters`,
        currentGas: publicVariables.length * 2400,
        optimizedGas: Math.ceil(publicVariables.length / 2) * 2400,
        savings: Math.floor(publicVariables.length / 2) * 2400,
        suggestion: 'Make variables private if external access is not needed'
      })
    }

    // Check for mappings optimization
    const mappings = elements.filter(el => el.type === 'mapping')
    if (mappings.length > 0) {
      suggestions.push({
        type: 'high',
        title: 'Optimize Mapping Access',
        description: 'Multiple mapping lookups can be expensive',
        currentGas: mappings.length * 5000,
        optimizedGas: mappings.length * 2100,
        savings: mappings.length * 2900,
        suggestion: 'Cache mapping values in local variables for multiple accesses'
      })
    }

    // Check for events optimization
    const events = elements.filter(el => el.type === 'event')
    if (events.length > 3) {
      suggestions.push({
        type: 'low',
        title: 'Event Optimization',
        description: 'Multiple events increase deployment cost',
        currentGas: events.length * 800,
        optimizedGas: Math.min(events.length, 2) * 800,
        savings: Math.max(0, events.length - 2) * 800,
        suggestion: 'Combine related events or use indexed parameters efficiently'
      })
    }

    // Code-based optimizations
    if (code) {
      if (code.includes('string')) {
        suggestions.push({
          type: 'medium',
          title: 'String Storage Optimization',
          description: 'String variables are expensive for storage',
          currentGas: 20000,
          optimizedGas: 5000,
          savings: 15000,
          suggestion: 'Use bytes32 for fixed-length strings or consider off-chain storage'
        })
      }

      if (code.includes('require(')) {
        const requireCount = (code.match(/require\(/g) || []).length
        if (requireCount > 2) {
          suggestions.push({
            type: 'low',
            title: 'Optimize Require Statements',
            description: `${requireCount} require statements found`,
            currentGas: requireCount * 3000,
            optimizedGas: requireCount * 2000,
            savings: requireCount * 1000,
            suggestion: 'Use custom errors instead of require strings (Solidity 0.8.4+)'
          })
        }
      }
    }

    return suggestions
  }

  const suggestions = analyzeGasOptimization()
  const totalSavings = suggestions.reduce((sum, s) => sum + s.savings, 0)

  const getSuggestionIcon = (type: OptimizationSuggestion['type']) => {
    switch (type) {
      case 'high':
        return <TrendingDown className="w-5 h-5 text-green-500" />
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'low':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
    }
  }

  const getSuggestionColor = (type: OptimizationSuggestion['type']) => {
    switch (type) {
      case 'high':
        return 'border-green-200 bg-green-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      case 'low':
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="h-full bg-white border-t border-gray-200 flex flex-col">
      <div className="p-3 lg:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Gas Optimization</h3>
          </div>
          {totalSavings > 0 && (
            <div className="text-sm">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Save ~{totalSavings.toLocaleString()} gas
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 lg:p-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <Zap className="w-12 lg:w-16 h-12 lg:h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Already Optimized</h3>
            <p className="text-sm lg:text-base text-gray-600">
              Your smart contract is well optimized for gas efficiency!
            </p>
          </div>
        ) : (
          <div className="space-y-3 lg:space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-3 lg:p-4 border rounded-lg ${getSuggestionColor(suggestion.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {getSuggestionIcon(suggestion.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm lg:text-base font-semibold text-gray-900">
                        {suggestion.title}
                      </h4>
                      <span className="text-xs lg:text-sm font-medium text-green-600">
                        -{suggestion.savings.toLocaleString()} gas
                      </span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-700 mb-3">
                      {suggestion.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 lg:gap-4 mb-3 text-xs lg:text-sm">
                      <div className="bg-red-100 p-2 rounded">
                        <span className="text-red-700 font-medium">Current: </span>
                        <span className="text-red-600">{suggestion.currentGas.toLocaleString()} gas</span>
                      </div>
                      <div className="bg-green-100 p-2 rounded">
                        <span className="text-green-700 font-medium">Optimized: </span>
                        <span className="text-green-600">{suggestion.optimizedGas.toLocaleString()} gas</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/50 p-2 lg:p-3 rounded border">
                      <p className="text-xs lg:text-sm text-gray-600">
                        <strong>Optimization:</strong> {suggestion.suggestion}
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

export default GasOptimizationPanel
