import React, { useState, useEffect } from 'react';
import CBOMViewer from '../components/cbom/CBOMViewer';
import { convertScanToCBOM } from '../utils/cbomConverter';
import { mockCBOMData } from '../data/mock_cbom';
import { CBOMInventory } from '../types/cbom';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CBOMViewerPage: React.FC = () => {
  const [cbomData, setCbomData] = useState<CBOMInventory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real implementation, you might fetch scan results from an API
    // and then convert them to CBOM format
    const loadCBOMData = async () => {
      try {
        setIsLoading(true);
        
        // For now, we'll use mock data for demonstration
        // In a real app, you would:
        // 1. Fetch the latest scan results
        // 2. Convert them to CBOM format using convertScanToCBOM
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use mock data for now
        setCbomData(mockCBOMData);
        setError(null);
      } catch (err) {
        console.error("Failed to load CBOM data:", err);
        setError("Failed to load CBOM data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCBOMData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/app" className="text-blue-600 hover:text-blue-800 flex items-center">
          <FiArrowLeft className="mr-2" />
          Back to Scanner
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Cryptographic Bill of Materials</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6">
        <p className="text-gray-600 dark:text-gray-300">
          The Cryptographic Bill of Materials (CBOM) provides a detailed inventory of all cryptographic assets 
          across your codebase, highlighting assets that are vulnerable to quantum attacks.
        </p>
      </div>
      
      <CBOMViewer 
        cbomData={cbomData} 
        isLoading={isLoading} 
        error={error} 
      />
    </div>
  );
};

export default CBOMViewerPage; 