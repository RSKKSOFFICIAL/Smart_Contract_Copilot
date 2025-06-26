import React, { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import CodeEditor from './components/CodeEditor'
import AuditPanel from './components/AuditPanel'
import OptimizationPanel from './components/OptimizationPanel'
import { ContractElement } from './types'

function App() {
  const [elements, setElements] = useState<ContractElement[]>([])
  const [selectedElement, setSelectedElement] = useState<ContractElement | null>(null)
  const [generatedCode, setGeneratedCode] = useState('')
  const [showAudit, setShowAudit] = useState(false)
  const [showOptimization, setShowOptimization] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const addElement = (element: Omit<ContractElement, 'id' | 'position'>) => {
    const newElement: ContractElement = {
      ...element,
      id: `${element.type}_${Date.now()}`,
      position: { x: 100 + elements.length * 50, y: 100 + elements.length * 30 }
    }
    setElements([...elements, newElement])
  }

  const updateElement = (id: string, updates: Partial<ContractElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id))
    if (selectedElement?.id === id) {
      setSelectedElement(null)
    }
  }

  const generateContract = () => {
    let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Generated Smart Contract
 * @dev This contract was generated using Smart Contract Copilot
 * @notice Drag & drop smart contract development tool
 */
contract GeneratedContract {
`

    // Add state variables
    const variables = elements.filter(el => el.type === 'variable')
    if (variables.length > 0) {
      code += '\n    // State Variables\n'
      variables.forEach(element => {
        const visibility = element.config.visibility || 'public'
        const dataType = element.config.dataType || 'uint256'
        const name = element.config.name || 'variable'
        code += `    ${dataType} ${visibility} ${name};\n`
      })
    }

    // Add events
    const events = elements.filter(el => el.type === 'event')
    if (events.length > 0) {
      code += '\n    // Events\n'
      events.forEach(element => {
        const name = element.config.name || 'NewEvent'
        const params = element.config.parameters || ''
        code += `    event ${name}(${params});\n`
      })
    }

    // Add modifiers
    const modifiers = elements.filter(el => el.type === 'modifier')
    if (modifiers.length > 0) {
      code += '\n    // Modifiers\n'
      modifiers.forEach(element => {
        const name = element.config.name || 'newModifier'
        code += `    modifier ${name}() {\n        // Add modifier logic here\n        _;\n    }\n\n`
      })
    }

    // Add constructor
    const constructor = elements.find(el => el.type === 'constructor')
    if (constructor) {
      const params = constructor.config.parameters || ''
      code += `    // Constructor\n`
      code += `    constructor(${params}) {\n        // Initialize contract state\n    }\n\n`
    }

    // Add functions
    const functions = elements.filter(el => el.type === 'function')
    if (functions.length > 0) {
      code += '    // Functions\n'
      functions.forEach(element => {
        const name = element.config.name || 'newFunction'
        const params = element.config.parameters || ''
        const visibility = element.config.visibility || 'public'
        const returns = element.config.returns ? ` returns (${element.config.returns})` : ''
        
        let modifiers = ''
        if (element.config.payable) modifiers += ' payable'
        if (element.config.view) modifiers += ' view'
        if (element.config.pure) modifiers += ' pure'
        
        code += `    function ${name}(${params}) ${visibility}${modifiers}${returns} {\n        // Implement function logic here\n    }\n\n`
      })
    }

    // Add structs
    const structs = elements.filter(el => el.type === 'struct')
    if (structs.length > 0) {
      code += '    // Structs\n'
      structs.forEach(element => {
        const name = element.config.name || 'NewStruct'
        code += `    struct ${name} {\n        // Define struct fields\n        uint256 id;\n        address owner;\n    }\n\n`
      })
    }

    // Add enums
    const enums = elements.filter(el => el.type === 'enum')
    if (enums.length > 0) {
      code += '    // Enums\n'
      enums.forEach(element => {
        const name = element.config.name || 'Status'
        code += `    enum ${name} { Pending, Active, Inactive }\n\n`
      })
    }

    // Add mappings
    const mappings = elements.filter(el => el.type === 'mapping')
    if (mappings.length > 0) {
      code += '    // Mappings\n'
      mappings.forEach(element => {
        const name = element.config.name || 'mapping'
        const visibility = element.config.visibility || 'public'
        code += `    mapping(address => uint256) ${visibility} ${name};\n`
      })
    }

    code += '}\n'
    setGeneratedCode(code)
  }

  const handleImportContract = async (file: File) => {
    try {
      const content = await file.text()
      setGeneratedCode(content)
      
      // Show success message
      alert(`Successfully imported ${file.name}!\n\nThe contract code has been loaded into the editor. You can now run security audit and gas optimization on your imported contract.`)
      
      // Optionally trigger audit automatically
      if (!showAudit) {
        setShowAudit(true)
      }
    } catch (error) {
      console.error('Error reading file:', error)
      alert('Error reading the file. Please try again.')
    }
  }

  const handleExportContract = () => {
    if (!generatedCode.trim()) {
      alert('No contract code to export. Please generate a contract first or import an existing one.')
      return
    }

    try {
      const blob = new Blob([generatedCode], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'contract.sol'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert('Contract exported successfully!')
    } catch (error) {
      console.error('Error exporting file:', error)
      alert('Error exporting the file. Please try again.')
    }
  }

  const toggleAudit = () => {
    setShowAudit(!showAudit)
    if (showOptimization) setShowOptimization(false)
  }

  const toggleOptimization = () => {
    setShowOptimization(!showOptimization)
    if (showAudit) setShowAudit(false)
  }

  const handleCodeChange = (newCode: string) => {
    setGeneratedCode(newCode)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        onGenerateContract={generateContract} 
        onToggleAudit={toggleAudit}
        onOptimizeGas={toggleOptimization}
        onImportContract={handleImportContract}
        onExportContract={handleExportContract}
        showAudit={showAudit}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="flex-1 flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - Fixed positioning */}
        <div className={`
          fixed lg:relative top-16 lg:top-0 left-0 h-[calc(100vh-4rem)] lg:h-full
          w-80 bg-white border-r border-gray-200 z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar onAddElement={addElement} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row lg:ml-0">
          {/* Canvas */}
          <div className="flex-1 min-h-[50vh] lg:min-h-full">
            <Canvas 
              elements={elements}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
              onAddElement={addElement}
            />
          </div>
          
          {/* Code Editor and Panels */}
          <div className="w-full lg:w-1/2 flex flex-col min-h-[50vh] lg:min-h-full">
            <div className="flex-1">
              <CodeEditor 
                code={generatedCode} 
                onChange={handleCodeChange}
              />
            </div>
            {showAudit && (
              <div className="h-64 lg:h-auto lg:flex-1">
                <AuditPanel code={generatedCode} />
              </div>
            )}
            {showOptimization && (
              <div className="h-64 lg:h-auto lg:flex-1">
                <OptimizationPanel 
                  code={generatedCode} 
                  onCodeChange={handleCodeChange}
                  onClose={() => setShowOptimization(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
