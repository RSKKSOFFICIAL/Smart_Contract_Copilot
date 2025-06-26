export interface SyntaxError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning'
  fix?: string
}

export interface GasOptimization {
  line: number
  type: 'storage' | 'computation' | 'memory' | 'external-calls'
  issue: string
  suggestion: string
  currentCode: string
  optimizedCode: string
  gasSavings: number
}

export interface OptimizationResult {
  syntaxErrors: SyntaxError[]
  gasOptimizations: GasOptimization[]
  hasIssues: boolean
}

export class SolidityAnalyzer {
  static analyzeSyntax(code: string): SyntaxError[] {
    const errors: SyntaxError[] = []
    const lines = code.split('\n')

    lines.forEach((line, index) => {
      const lineNumber = index + 1
      const trimmedLine = line.trim()

      // Check for missing semicolons
      if (trimmedLine && 
          !trimmedLine.startsWith('//') && 
          !trimmedLine.startsWith('/*') && 
          !trimmedLine.startsWith('*') &&
          !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && 
          !trimmedLine.endsWith('}') &&
          !trimmedLine.includes('pragma') &&
          !trimmedLine.includes('import') &&
          !trimmedLine.includes('contract') &&
          !trimmedLine.includes('interface') &&
          !trimmedLine.includes('library') &&
          trimmedLine.length > 0) {
        errors.push({
          line: lineNumber,
          column: line.length,
          message: 'Missing semicolon',
          severity: 'error',
          fix: line + ';'
        })
      }

      // Check for incorrect visibility order
      const visibilityPattern = /(public|private|internal|external)\s+(view|pure|payable)/
      if (visibilityPattern.test(trimmedLine)) {
        const match = trimmedLine.match(visibilityPattern)
        if (match) {
          errors.push({
            line: lineNumber,
            column: line.indexOf(match[0]),
            message: 'Incorrect function modifier order. State mutability should come after visibility',
            severity: 'warning',
            fix: line.replace(visibilityPattern, `$2 $1`)
          })
        }
      }

      // Check for deprecated 'now' keyword
      if (trimmedLine.includes('now')) {
        errors.push({
          line: lineNumber,
          column: line.indexOf('now'),
          message: "'now' is deprecated. Use 'block.timestamp' instead",
          severity: 'warning',
          fix: line.replace(/\bnow\b/g, 'block.timestamp')
        })
      }

      // Check for unsafe tx.origin usage
      if (trimmedLine.includes('tx.origin')) {
        errors.push({
          line: lineNumber,
          column: line.indexOf('tx.origin'),
          message: 'Avoid using tx.origin for authorization. Use msg.sender instead',
          severity: 'error',
          fix: line.replace(/tx\.origin/g, 'msg.sender')
        })
      }

      // Check for missing SPDX license
      if (lineNumber === 1 && !trimmedLine.includes('SPDX-License-Identifier')) {
        errors.push({
          line: 1,
          column: 0,
          message: 'Missing SPDX license identifier',
          severity: 'warning',
          fix: '// SPDX-License-Identifier: MIT\n' + line
        })
      }

      // Check for pragma version
      if (trimmedLine.includes('pragma solidity') && !trimmedLine.includes('^0.8')) {
        errors.push({
          line: lineNumber,
          column: 0,
          message: 'Consider using Solidity ^0.8.0 for better security and gas optimization',
          severity: 'warning',
          fix: line.replace(/pragma solidity [^;]+;/, 'pragma solidity ^0.8.19;')
        })
      }
    })

    return errors
  }

  static analyzeGasOptimization(code: string): GasOptimization[] {
    const optimizations: GasOptimization[] = []
    const lines = code.split('\n')

    lines.forEach((line, index) => {
      const lineNumber = index + 1
      const trimmedLine = line.trim()

      // Optimize uint256 to smaller uints where possible
      if (trimmedLine.includes('uint256') && !trimmedLine.includes('mapping')) {
        optimizations.push({
          line: lineNumber,
          type: 'storage',
          issue: 'Using uint256 for small values wastes gas',
          suggestion: 'Use smaller uint types (uint8, uint16, uint32) for values that fit',
          currentCode: line,
          optimizedCode: line.replace('uint256', 'uint128'),
          gasSavings: 2000
        })
      }

      // Optimize string storage
      if (trimmedLine.includes('string') && trimmedLine.includes('public')) {
        optimizations.push({
          line: lineNumber,
          type: 'storage',
          issue: 'String storage is expensive',
          suggestion: 'Use bytes32 for fixed-length strings or consider off-chain storage',
          currentCode: line,
          optimizedCode: line.replace('string', 'bytes32'),
          gasSavings: 15000
        })
      }

      // Optimize require statements
      if (trimmedLine.includes('require(') && trimmedLine.includes('"')) {
        const requireMatch = trimmedLine.match(/require\([^,]+,\s*"([^"]+)"\)/)
        if (requireMatch) {
          optimizations.push({
            line: lineNumber,
            type: 'computation',
            issue: 'String error messages in require statements consume extra gas',
            suggestion: 'Use custom errors (Solidity 0.8.4+) instead of string messages',
            currentCode: line,
            optimizedCode: line.replace(/require\(([^,]+),\s*"[^"]+"\)/, 'if (!($1)) revert CustomError()'),
            gasSavings: 3000
          })
        }
      }

      // Optimize public variables
      if (trimmedLine.includes('public') && !trimmedLine.includes('function')) {
        optimizations.push({
          line: lineNumber,
          type: 'storage',
          issue: 'Public variables create automatic getters, consuming deployment gas',
          suggestion: 'Make variables private if external access is not needed',
          currentCode: line,
          optimizedCode: line.replace('public', 'private'),
          gasSavings: 2400
        })
      }

      // Optimize array length caching
      if (trimmedLine.includes('.length') && trimmedLine.includes('for')) {
        optimizations.push({
          line: lineNumber,
          type: 'computation',
          issue: 'Accessing array.length in loops wastes gas',
          suggestion: 'Cache array length in a local variable',
          currentCode: line,
          optimizedCode: line.replace(/for\s*\([^;]*;\s*[^<]*<\s*([^.]+)\.length/, 'uint256 length = $1.length;\n        for (uint256 i = 0; i < length'),
          gasSavings: 100
        })
      }

      // Optimize ++i vs i++
      if (trimmedLine.includes('i++') || trimmedLine.includes('++i')) {
        if (trimmedLine.includes('i++')) {
          optimizations.push({
            line: lineNumber,
            type: 'computation',
            issue: 'Post-increment (i++) is less gas efficient than pre-increment',
            suggestion: 'Use ++i instead of i++ in loops',
            currentCode: line,
            optimizedCode: line.replace('i++', '++i'),
            gasSavings: 5
          })
        }
      }

      // Optimize storage vs memory
      if (trimmedLine.includes('storage') && trimmedLine.includes('function')) {
        optimizations.push({
          line: lineNumber,
          type: 'memory',
          issue: 'Using storage in functions can be expensive',
          suggestion: 'Use memory for temporary variables if data is not persisted',
          currentCode: line,
          optimizedCode: line.replace('storage', 'memory'),
          gasSavings: 800
        })
      }

      // Optimize multiple SLOAD operations
      if (trimmedLine.match(/\b\w+\.\w+\b.*\b\w+\.\w+\b/)) {
        optimizations.push({
          line: lineNumber,
          type: 'storage',
          issue: 'Multiple storage reads of the same variable waste gas',
          suggestion: 'Cache storage variables in memory for multiple accesses',
          currentCode: line,
          optimizedCode: '// Cache storage variable\n        ' + line,
          gasSavings: 2100
        })
      }
    })

    return optimizations
  }

  static analyzeCode(code: string): OptimizationResult {
    if (!code || code.trim().length === 0) {
      return {
        syntaxErrors: [],
        gasOptimizations: [],
        hasIssues: false
      }
    }

    const syntaxErrors = this.analyzeSyntax(code)
    const gasOptimizations = this.analyzeGasOptimization(code)

    return {
      syntaxErrors,
      gasOptimizations,
      hasIssues: syntaxErrors.length > 0 || gasOptimizations.length > 0
    }
  }

  static applyFixes(code: string, fixes: Array<{ line: number; fix: string }>): string {
    const lines = code.split('\n')
    
    // Sort fixes by line number in descending order to avoid line number shifts
    const sortedFixes = fixes.sort((a, b) => b.line - a.line)
    
    sortedFixes.forEach(fix => {
      if (fix.line > 0 && fix.line <= lines.length) {
        lines[fix.line - 1] = fix.fix
      }
    })
    
    return lines.join('\n')
  }
}
