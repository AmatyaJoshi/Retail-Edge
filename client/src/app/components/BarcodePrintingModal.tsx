import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Printer, Settings, Eye, EyeOff } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from 'react-barcode';

interface Product {
  productId: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  category: string;
  brand: string;
}

interface BarcodePrintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  title?: string;
}

type LayoutType = 'single' | '2x3' | '3x4' | '4x6';
type BarcodeSize = 'small' | 'medium' | 'large';
type PaperSize = 'A4' | 'Letter';

const BarcodePrintingModal: React.FC<BarcodePrintingModalProps> = ({
  isOpen,
  onClose,
  products,
  title = 'Print Barcodes'
}) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [layout, setLayout] = useState<LayoutType>('2x3');
  const [barcodeSize, setBarcodeSize] = useState<BarcodeSize>('medium');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [includeProductName, setIncludeProductName] = useState(true);
  const [includeSKU, setIncludeSKU] = useState(true);
  const [includePrice, setIncludePrice] = useState(false);
  const [quantityPerProduct, setQuantityPerProduct] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Get barcode dimensions based on size
  const getBarcodeDimensions = () => {
    switch (barcodeSize) {
      case 'small': return { width: 1.5, height: 30, fontSize: 8 };
      case 'medium': return { width: 2, height: 40, fontSize: 10 };
      case 'large': return { width: 3, height: 50, fontSize: 12 };
      default: return { width: 2, height: 40, fontSize: 10 };
    }
  };

  // Get grid layout dimensions
  const getGridLayout = () => {
    switch (layout) {
      case 'single': return { cols: 1, rows: 1 };
      case '2x3': return { cols: 2, rows: 3 };
      case '3x4': return { cols: 3, rows: 4 };
      case '4x6': return { cols: 4, rows: 6 };
      default: return { cols: 2, rows: 3 };
    }
  };

  // Generate products array with quantity
  const getProductsWithQuantity = () => {
    const result: Product[] = [];
    products.forEach(product => {
      for (let i = 0; i < quantityPerProduct; i++) {
        result.push(product);
      }
    });
    return result;
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!printRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: paperSize === 'A4' ? 'portrait' : 'portrait',
        unit: 'mm',
        format: paperSize
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`barcodes-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Print directly
  const printDirectly = () => {
    if (!printRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcodes</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .barcode-container { page-break-inside: avoid; }
              @media print {
                body { margin: 0; }
                .barcode-container { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            ${printRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const productsWithQuantity = getProductsWithQuantity();
  const { width, height, fontSize } = getBarcodeDimensions();
  const { cols, rows } = getGridLayout();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 max-w-4xl w-full mx-auto relative shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {title}
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {products.length} product{products.length !== 1 ? 's' : ''} selected • {productsWithQuantity.length} total barcodes
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <X className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
              <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                <Settings className="w-5 h-5" />
                Print Settings
              </h3>
              
              <div className="space-y-4">
                {/* Layout */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Layout
                  </label>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value as LayoutType)}
                    className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="single">Single (1 per page)</option>
                    <option value="2x3">2x3 Grid (6 per page)</option>
                    <option value="3x4">3x4 Grid (12 per page)</option>
                    <option value="4x6">4x6 Grid (24 per page)</option>
                  </select>
                </div>

                {/* Barcode Size */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Barcode Size
                  </label>
                  <select
                    value={barcodeSize}
                    onChange={(e) => setBarcodeSize(e.target.value as BarcodeSize)}
                    className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                {/* Paper Size */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Paper Size
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                    className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Quantity per Product
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantityPerProduct}
                    onChange={(e) => setQuantityPerProduct(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                {/* Include Options */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Include Information
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeProductName}
                        onChange={(e) => setIncludeProductName(e.target.checked)}
                        className="rounded"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Product Name</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeSKU}
                        onChange={(e) => setIncludeSKU(e.target.checked)}
                        className="rounded"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>SKU</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includePrice}
                        onChange={(e) => setIncludePrice(e.target.checked)}
                        className="rounded"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              
              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {isGenerating ? 'Generating PDF...' : 'Download PDF'}
              </button>
              
              <button
                onClick={printDirectly}
                className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Printer className="w-5 h-5" />
                Print Now
              </button>
            </div>
          </div>

          {/* Preview/Print Area */}
          <div className="lg:col-span-2">
            {showPreview && (
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-4`}>
                <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Preview
                </h3>
                <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div ref={printRef} className="print-area">
                    <div 
                      className="grid gap-4"
                      style={{
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        gridTemplateRows: `repeat(${rows}, auto)`
                      }}
                    >
                      {productsWithQuantity.slice(0, cols * rows).map((product, index) => (
                        <div key={`${product.productId}-${index}`} className="barcode-container text-center p-2 border border-gray-200 rounded">
                          {product.barcode && (
                            <div className="mb-2">
                              <Barcode
                                value={product.barcode}
                                width={width}
                                height={height}
                                fontSize={fontSize}
                                displayValue={false}
                                background="#fff"
                                lineColor="#000"
                              />
                            </div>
                          )}
                          {includeProductName && (
                            <div className="text-xs font-semibold mb-1 truncate">{product.name}</div>
                          )}
                          {includeSKU && (
                            <div className="text-xs text-gray-600 mb-1">{product.sku}</div>
                          )}
                          {includePrice && (
                            <div className="text-xs font-bold">₹{product.price}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product List */}
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Selected Products
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.productId} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{product.name}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        SKU: {product.sku} • {product.barcode ? `Barcode: ${product.barcode}` : 'No barcode'}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      ₹{product.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrintingModal; 