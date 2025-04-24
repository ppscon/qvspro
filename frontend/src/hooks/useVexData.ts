import { useState, useEffect, useCallback } from 'react';
import { VexDocument } from '../types/vex';
import { CBOMInventory } from '../types/cbom';
import { fetchVexDocuments, enhanceCbomWithVexData } from '../utils/vexUtils';

/**
 * Hook for managing VEX data in relation to a CBOM
 * @param cbomData The original CBOM data
 * @returns Object containing VEX-enhanced CBOM data and utility functions
 */
export const useVexData = (cbomData: CBOMInventory | null) => {
  const [vexDocuments, setVexDocuments] = useState<VexDocument[]>([]);
  const [enhancedCbom, setEnhancedCbom] = useState<CBOMInventory | null>(cbomData);
  const [selectedVexDocument, setSelectedVexDocument] = useState<VexDocument | null>(null);
  const [isLoadingVex, setIsLoadingVex] = useState<boolean>(false);
  const [vexError, setVexError] = useState<string | null>(null);

  // Load VEX data when CBOM data changes
  useEffect(() => {
    if (!cbomData || !cbomData.id) return;
    
    const loadVexData = async () => {
      setIsLoadingVex(true);
      setVexError(null);
      
      try {
        const vexData = await fetchVexDocuments(cbomData.id || 'unknown');
        setVexDocuments(vexData.documents);
        
        // Enhance CBOM with VEX data
        const enhanced = enhanceCbomWithVexData(cbomData, vexData.documents);
        setEnhancedCbom(enhanced);
      } catch (error) {
        console.error('Error loading VEX data:', error);
        setVexError('Failed to load vulnerability exploitability data');
      } finally {
        setIsLoadingVex(false);
      }
    };
    
    loadVexData();
  }, [cbomData]);

  // Get VEX document for an asset
  const getVexDocumentForAsset = useCallback((assetId: string): VexDocument | undefined => {
    return vexDocuments.find(doc => doc.asset_id === assetId);
  }, [vexDocuments]);

  // View VEX details for an asset
  const viewVexDetails = useCallback((assetId: string) => {
    const vexDoc = getVexDocumentForAsset(assetId);
    setSelectedVexDocument(vexDoc || null);
  }, [getVexDocumentForAsset]);

  // Close VEX details modal
  const closeVexDetails = useCallback(() => {
    setSelectedVexDocument(null);
  }, []);

  return {
    enhancedCbom,
    vexDocuments,
    selectedVexDocument,
    isLoadingVex,
    vexError,
    getVexDocumentForAsset,
    viewVexDetails,
    closeVexDetails
  };
};

export default useVexData; 