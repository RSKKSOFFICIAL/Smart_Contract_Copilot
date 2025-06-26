import React, { useRef } from 'react'
import { Code, Shield, Zap, Upload, Download, Menu } from 'lucide-react'

interface HeaderProps {
  onGenerateContract: () => void
  onToggleAudit: () => void
  onOptimizeGas: () => void
  onImportContract: (file: File) => void
  onExportContract: () => void
  showAudit: boolean
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

const Header: React.FC<HeaderProps> = ({
  onGenerateContract,
  onToggleAudit,
  onOptimizeGas,
  onImportContract,
  onExportContract,
  showAudit,
  onToggleSidebar,
  sidebarOpen
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.sol')) {
      onImportContract(file)
    } else if (file) {
      alert('Please select a .sol file')
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-50">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Code className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">Smart Contract Copilot</h1>
            <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Drag & drop smart contract development</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".sol"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <button
          onClick={handleImportClick}
          className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import</span>
        </button>

        <button
          onClick={onExportContract}
          className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onOptimizeGas}
          className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm"
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Optimize</span>
        </button>

        <button
          onClick={onToggleAudit}
          className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-lg transition-colors text-sm ${
            showAudit 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Audit</span>
        </button>

        <button
          onClick={onGenerateContract}
          className="flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all duration-200 text-sm font-medium"
        >
          <Code className="w-4 h-4" />
          <span>Generate</span>
        </button>
      </div>
    </header>
  )
}

export default Header
