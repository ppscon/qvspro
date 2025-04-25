import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import ForceGraph2D from 'react-force-graph-2d';
import { GlossaryEntry } from './glossaryData';

interface MindMapViewProps {
  entries: GlossaryEntry[];
  selectedCategory: string;
  setActiveTerm: (term: GlossaryEntry) => void;
}

const MindMapView: React.FC<MindMapViewProps> = ({ entries, selectedCategory, setActiveTerm }) => {
  const graphRef = useRef<any>();

  // TODO: Replace with real conceptual links
  const graphData = useMemo(() => {
    return {
      nodes: entries.map(entry => ({
        id: entry.term,
        category: entry.category,
        value: 1,
      })),
      links: [], // TODO: Populate with conceptual links
    };
  }, [entries]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeColor={node => '#a78bfa'}
        nodeLabel={node => node.id}
        linkColor={() => '#ddd'}
        onNodeClick={node => {
          const entry = entries.find(e => e.term === node.id);
          if (entry) setActiveTerm(entry);
        }}
        width={800}
        height={550}
      />
    </motion.div>
  );
};

export default MindMapView;
