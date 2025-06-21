import React from 'react'
import { Zap, TrendingDown, Lightbulb } from 'lucide-react'
import { ContractElement, GasOptimization } from '../types'

interface GasOptimizationPanelProps {
  elements: ContractElement[]
  code: string
}

const GasOptimizationPanel: React.FC<GasOptimizationPanelProps> = ({ elements }) => {
  const generateOptimizations = (): GasOptimization[] => {
    const optimizations: GasOptimization[] = []

    // Check for storage optimizations
    const publicVariables = elements.filter(e => e.type === 'variable' && e.config.visibility === 'public')
    if (publicVariables.length > 3) {
      optimizations.push({
        id: 'storage-packing',
        type: 'storage',
        description: 'Multiple public variables can be expensive to read',
        estimatedSavings: 2000,
        suggestion: 'Consider using a struct to pack related variables together'
      })
    }

    // Check for function optimizations
    const payableFunctions = elements.filter(e => e.type === 'function' && e.config.payable)
    payableFunctions.forEach(func => {
      optimizations.push({
        id: `payable-${func.id}`,
        type: 'computation',
        description: `Function "${func.config.name}" could be optimized`,
        estimatedSavings: 500,
        suggestion: 'Use unchecked blocks for arithmetic operations that cannot overflow'
      })
    })

    // General optimizations
    if (elements.length > 5) {
      optimizations.push({
        id: 'general-optimization',
        type: 'memory',
        description: 'Large contracts can benefit from memory optimization',
        estimatedSavings: 1500,
        suggestion: 'Use memory instead of storage for temporary variables in functions'
      })
    }

    return optimizations
  }

  const optimizations = generateOptimizations()
  const totalSavings = optimizations.reduce((sum, opt) => sum + opt.estimatedSavings, 0)

  const typeConfig = {
    storage: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    computation: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    memory: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    'external-calls': { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' }
  }

  return (
    <div className="h-1/2 bg-white border-t border-gray-200 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Gas Optimization</h3>
        </div>
        {totalSavings > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <span className="text-green-600 font-medium">
              Potential savings: ~{totalSavings.toLocaleString()} gas
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {optimizations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Well Optimized!</h3>
            <p className="text-gray-600">
              Your contract appears to be well optimized. Add more elements to get optimization suggestions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {optimizations.map((optimization) => {
              const config = typeConfig[optimization.type]
              
              return (
                <div
                  key={optimization.id}
                  className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
                >
                  <div className="flex items-start space-x-3">
                    <Lightbulb className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color} ${config.bg} border ${config.border}`}>
                          {optimization.type.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          ~{optimization.estimatedSavings} gas
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{optimization.description}</p>
                      <div className="text-sm text-gray-600">
                        <strong>Suggestion:</strong> {optimization.suggestion}
                      </div>
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

export default GasOptimizationPanel
