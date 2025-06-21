import React, { useRef } from 'react'
import { Play, Shield, Zap, Download, Upload } from 'lucide-react'

interface HeaderProps {
  onGenerateContract: () => void
  onToggleAudit: () => void
  onOptimizeGas: () => void
  onImportContract: (file: File) => void
  onExportContract: () => void
  showAudit: boolean
}

const Header: React.FC<HeaderProps> = ({ 
  onGenerateContract, 
  onToggleAudit, 
  onOptimizeGas,
  onImportContract,
  onExportContract,
  showAudit 
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
      alert('Please select a valid Solidity (.sol) file')
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Smart Contract Copilot</h1>
            <p className="text-sm text-gray-500">Drag & drop smart contract development</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".sol"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <button 
            onClick={handleImportClick}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Import</span>
          </button>

          <button 
            onClick={onExportContract}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          <button 
            onClick={onOptimizeGas}
            className="flex items-center space-x-2 px-3 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Optimize Gas</span>
          </button>

          <button 
            onClick={onToggleAudit}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              showAudit 
                ? 'text-red-700 bg-red-50 hover:bg-red-100' 
                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Security Audit</span>
          </button>

          <button 
            onClick={onGenerateContract}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Generate Contract</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
