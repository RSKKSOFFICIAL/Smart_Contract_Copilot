import React, { useState } from 'react'
import { Zap, AlertTriangle, CheckCircle, Wrench, X, ArrowRight } from 'lucide-react'
import { SolidityAnalyzer, OptimizationResult, SyntaxError, GasOptimization } from '../utils/solidityAnalyzer'

interface OptimizationPanelProps {
  code: string
  onCodeChange: (code: string) => void
  onClose: () => void
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({ code, onCodeChange, onClose }) => {
  const [analysis, setAnalysis] = useState<OptimizationResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set())

  const runAnalysis = () => {
    if (!code || code.trim().length === 0) {
      alert('No code found in the IDE. Please add some Solidity code first.')
      return
    }

    setIsAnalyzing(true)
    setTimeout(() => {
      const result = SolidityAnalyzer.analyzeCode(code)
      setAnalysis(result)
      setIsAnalyzing(false)
    }, 1000)
  }

  const applySyntaxFix = (error: SyntaxError, index: number) => {
    if (!error.fix) return
    
    const lines = code.split('\n')
    lines[error.line - 1] = error.fix
    const newCode = lines.join('\n')
    onCodeChange(newCode)
    
    const fixId = `syntax-${index}`
    setAppliedFixes(prev => new Set([...prev, fixId]))
    
    // Re-run analysis after fix
    setTimeout(() => {
      const result = SolidityAnalyzer.analyzeCode(newCode)
      setAnalysis(result)
    }, 500)
  }

  const applyGasOptimization = (optimization: GasOptimization, index: number) => {
    const lines = code.split('\n')
    lines[optimization.line - 1] = optimization.optimizedCode
    const newCode = lines.join('\n')
    onCodeChange(newCode)
    
    const fixId = `gas-${index}`
    setAppliedFixes(prev => new Set([...prev, fixId]))
    
    // Re-run analysis after fix
    setTimeout(() => {
      const result = SolidityAnalyzer.analyzeCode(newCode)
      setAnalysis(result)
    }, 500)
  }

  const applyAllFixes = () => {
    if (!analysis) return
    
    let newCode = code
    const allFixes: Array<{ line: number; fix: string }> = []
    
    // Collect all fixes
    analysis.syntaxErrors.forEach(error => {
      if (error.fix) {
        allFixes.push({ line: error.line, fix: error.fix })
      }
    })
    
    analysis.gasOptimizations.forEach(optimization => {
      allFixes.push({ line: optimization.line, fix: optimization.optimizedCode })
    })
    
    // Apply all fixes
    newCode = SolidityAnalyzer.applyFixes(newCode, allFixes)
    onCodeChange(newCode)
    
    // Mark all as applied
    const allFixIds = new Set([
      ...analysis.syntaxErrors.map((_, i) => `syntax-${i}`),
      ...analysis.gasOptimizations.map((_, i) => `gas-${i}`)
    ])
    setAppliedFixes(allFixIds)
    
    // Re-run analysis
    setTimeout(() => {
      const result = SolidityAnalyzer.analyzeCode(newCode)
      setAnalysis(result)
    }, 500)
  }

  const getSeverityColor = (severity: 'error' | 'warning') => {
    return severity === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
  }

  const getSeverityIcon = (severity: 'error' | 'warning') => {
    return severity === 'error' ? 
      <AlertTriangle className="w-5 h-5 text-red-500" /> : 
      <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }

  const totalGasSavings = analysis?.gasOptimizations.reduce((sum, opt) => sum + opt.gasSavings, 0) || 0

  return (
    <div className="h-full bg-white border-t border-gray-200 flex flex-col">
      <div className="p-3 lg:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Code Optimization</h3>
          </div>
          <div className="flex items-center space-x-2">
            {analysis && analysis.hasIssues && (
              <button
                onClick={applyAllFixes}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Wrench className="w-4 h-4" />
                <span>Fix All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 lg:p-4">
        {!analysis ? (
          <div className="text-center py-8 lg:py-12">
            <div className="w-12 lg:w-16 h-12 lg:h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 lg:w-8 h-6 lg:h-8 text-blue-600" />
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Ready to Optimize</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-4">
              Click the button below to analyze your Solidity code for syntax errors and gas optimization opportunities.
            </p>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || !code.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mx-auto"
            >
              <Zap className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Code'}</span>
            </button>
            {!code.trim() && (
              <p className="text-xs text-red-500 mt-2">
                No code found in IDE. Please add Solidity code first.
              </p>
            )}
          </div>
        ) : !analysis.hasIssues ? (
          <div className="text-center py-8 lg:py-12">
            <CheckCircle className="w-12 lg:w-16 h-12 lg:h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Code Looks Great!</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-4">
              No syntax errors or gas optimization opportunities found.
            </p>
            <button
              onClick={runAnalysis}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Zap className="w-4 h-4" />
              <span>Re-analyze</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">Analysis Summary</h4>
                  <p className="text-sm text-blue-700">
                    {analysis.syntaxErrors.length} syntax issues, {analysis.gasOptimizations.length} gas optimizations
                  </p>
                </div>
                {totalGasSavings > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-blue-700">Potential Savings</p>
                    <p className="font-semibold text-blue-900">~{totalGasSavings.toLocaleString()} gas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Syntax Errors */}
            {analysis.syntaxErrors.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Syntax Issues</h4>
                <div className="space-y-3">
                  {analysis.syntaxErrors.map((error, index) => {
                    const fixId = `syntax-${index}`
                    const isApplied = appliedFixes.has(fixId)
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg ${getSeverityColor(error.severity)} ${isApplied ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start space-x-3">
                          {getSeverityIcon(error.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">
                                Line {error.line}: {error.message}
                              </h5>
                              {error.fix && !isApplied && (
                                <button
                                  onClick={() => applySyntaxFix(error, index)}
                                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                >
                                  <Wrench className="w-3 h-3" />
                                  <span>Fix</span>
                                </button>
                              )}
                              {isApplied && (
                                <span className="flex items-center space-x-1 text-green-600 text-xs">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Applied</span>
                                </span>
                              )}
                            </div>
                            {error.fix && (
                              <div className="bg-white/50 p-2 rounded border text-xs">
                                <p className="text-gray-600 mb-1">Suggested fix:</p>
                                <code className="text-gray-800">{error.fix}</code>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Gas Optimizations */}
            {analysis.gasOptimizations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Gas Optimizations</h4>
                <div className="space-y-3">
                  {analysis.gasOptimizations.map((optimization, index) => {
                    const fixId = `gas-${index}`
                    const isApplied = appliedFixes.has(fixId)
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 border border-green-200 bg-green-50 rounded-lg ${isApplied ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start space-x-3">
                          <Zap className="w-5 h-5 text-green-600" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">
                                Line {optimization.line}: {optimization.issue}
                              </h5>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-green-600 font-medium">
                                  -{optimization.gasSavings} gas
                                </span>
                                {!isApplied && (
                                  <button
                                    onClick={() => applyGasOptimization(optimization, index)}
                                    className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                                  >
                                    <Wrench className="w-3 h-3" />
                                    <span>Optimize</span>
                                  </button>
                                )}
                                {isApplied && (
                                  <span className="flex items-center space-x-1 text-green-600 text-xs">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Applied</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{optimization.suggestion}</p>
                            
                            <div className="space-y-2">
                              <div className="bg-red-50 p-2 rounded border text-xs">
                                <p className="text-red-700 font-medium mb-1">Current:</p>
                                <code className="text-red-800">{optimization.currentCode.trim()}</code>
                              </div>
                              <div className="flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="bg-green-50 p-2 rounded border text-xs">
                                <p className="text-green-700 font-medium mb-1">Optimized:</p>
                                <code className="text-green-800">{optimization.optimizedCode.trim()}</code>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <button
                onClick={runAnalysis}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Re-analyze Code</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OptimizationPanel
