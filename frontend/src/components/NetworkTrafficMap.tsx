import React, { useEffect, useRef, useState } from 'react';
import { FiZoomIn, FiZoomOut, FiRefreshCw } from 'react-icons/fi';

interface Node {
  id: string;
  type: 'client' | 'server' | 'router' | 'unknown';
  ip: string;
  name?: string;
  connections: number;
  vulnerableConnections: number;
}

interface Connection {
  id: string;
  source: string;
  target: string;
  protocol: string;
  port: number;
  isVulnerable: boolean;
  riskLevel?: 'High' | 'Medium' | 'Low' | 'None';
  vulnerability?: string;
}

interface NetworkTrafficMapProps {
  scanResults: any;
  darkMode: boolean;
}

const NetworkTrafficMap: React.FC<NetworkTrafficMapProps> = ({ scanResults, darkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [zoom, setZoom] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Process scan results into nodes and connections
  useEffect(() => {
    if (!scanResults || !scanResults.results) return;

    const nodeMap = new Map<string, Node>();
    const connectionsList: Connection[] = [];

    // Process each result into nodes and connections
    scanResults.results.forEach((result: any, index: number) => {
      // Extract source and destination IPs
      const sourceParts = result.source ? result.source.split(':') : ['unknown:0'];
      const destParts = result.destination ? result.destination.split(':') : ['unknown:0'];
      const sourceIp = sourceParts[0];
      const destIp = destParts[0];
      const port = parseInt(destParts[1]) || 0;

      // Create or update source node
      if (!nodeMap.has(sourceIp)) {
        nodeMap.set(sourceIp, {
          id: sourceIp,
          type: 'client',
          ip: sourceIp,
          connections: 0,
          vulnerableConnections: 0
        });
      }
      const sourceNode = nodeMap.get(sourceIp)!;
      sourceNode.connections += 1;
      if (result.risk === 'High' || result.risk === 'Medium') {
        sourceNode.vulnerableConnections += 1;
      }

      // Create or update destination node
      if (!nodeMap.has(destIp)) {
        nodeMap.set(destIp, {
          id: destIp,
          type: 'server',
          ip: destIp,
          connections: 0,
          vulnerableConnections: 0
        });
      }
      const destNode = nodeMap.get(destIp)!;
      destNode.connections += 1;
      if (result.risk === 'High' || result.risk === 'Medium') {
        destNode.vulnerableConnections += 1;
      }

      // Create connection
      connectionsList.push({
        id: `conn-${index}`,
        source: sourceIp,
        target: destIp,
        protocol: result.protocol || 'Unknown',
        port: port,
        isVulnerable: result.risk === 'High' || result.risk === 'Medium',
        riskLevel: result.risk || 'None',
        vulnerability: result.vulnerability_type || 'None'
      });
    });

    setNodes(Array.from(nodeMap.values()));
    setConnections(connectionsList);
  }, [scanResults]);

  // Force-directed layout simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    // Simple force-directed layout algorithm
    let nodePositions = new Map<string, { x: number; y: number }>();
    
    // Initialize random positions
    nodes.forEach(node => {
      nodePositions.set(node.id, {
        x: Math.random() * 600 + 50,
        y: Math.random() * 400 + 50
      });
    });

    // Run a few iterations of force-directed layout
    for (let i = 0; i < 50; i++) {
      // Repulsive forces between nodes
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const nodeA = nodes[a];
          const nodeB = nodes[b];
          const posA = nodePositions.get(nodeA.id)!;
          const posB = nodePositions.get(nodeB.id)!;
          
          const dx = posB.x - posA.x;
          const dy = posB.y - posA.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1000 / (distance * distance);
          
          const moveX = (dx / distance) * force;
          const moveY = (dy / distance) * force;
          
          posA.x -= moveX;
          posA.y -= moveY;
          posB.x += moveX;
          posB.y += moveY;
        }
      }
      
      // Attractive forces along connections
      connections.forEach(connection => {
        const sourcePos = nodePositions.get(connection.source);
        const targetPos = nodePositions.get(connection.target);
        
        if (sourcePos && targetPos) {
          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = distance / 30;
          
          const moveX = (dx / distance) * force;
          const moveY = (dy / distance) * force;
          
          sourcePos.x += moveX;
          sourcePos.y += moveY;
          targetPos.x -= moveX;
          targetPos.y -= moveY;
        }
      });
    }

    // Draw the network graph
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and offset
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);
    
    // Draw connections
    connections.forEach(connection => {
      const sourcePos = nodePositions.get(connection.source);
      const targetPos = nodePositions.get(connection.target);
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.strokeStyle = connection.isVulnerable 
          ? (darkMode ? '#f87171' : '#dc2626') 
          : (darkMode ? '#94a3b8' : '#64748b');
        ctx.lineWidth = connection === selectedConnection ? 3 : 1.5;
        ctx.stroke();
        
        // Draw protocol label
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        
        if (connection === selectedConnection) {
          ctx.fillStyle = darkMode ? '#f8fafc' : '#0f172a';
          ctx.font = '12px Arial';
          ctx.fillText(`${connection.protocol}:${connection.port}`, midX + 5, midY - 5);
        }
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      
      if (pos) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, node === selectedNode ? 12 : 8, 0, Math.PI * 2);
        
        // Node color based on type and vulnerability
        let fillColor = '#60a5fa'; // default - client
        if (node.type === 'server') {
          fillColor = '#a78bfa'; // server
        }
        
        // If has vulnerable connections, use warning colors
        if (node.vulnerableConnections > 0) {
          fillColor = node.vulnerableConnections / node.connections > 0.5
            ? (darkMode ? '#f87171' : '#dc2626') // mostly vulnerable
            : (darkMode ? '#fbbf24' : '#d97706'); // partially vulnerable
        }
        
        ctx.fillStyle = fillColor;
        ctx.fill();
        
        // Draw node outline
        ctx.strokeStyle = darkMode ? '#f8fafc' : '#0f172a';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw node label
        ctx.fillStyle = darkMode ? '#f8fafc' : '#0f172a';
        ctx.font = '12px Arial';
        ctx.fillText(node.ip, pos.x + 15, pos.y + 5);
      }
    });
    
    ctx.restore();
  }, [nodes, connections, zoom, offset, selectedNode, selectedConnection, darkMode]);

  // Handle canvas interactions
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - offset.x / zoom;
    const y = (e.clientY - rect.top) / zoom - offset.y / zoom;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    // Check if clicked on a node
    let clickedNode: Node | null = null;
    for (const node of nodes) {
      const nodePos = { x: 0, y: 0 }; // Need actual position from layout
      const dx = x - nodePos.x;
      const dy = y - nodePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 10) {
        clickedNode = node;
        break;
      }
    }
    
    setSelectedNode(clickedNode);
    
    // Check if clicked on a connection
    if (!clickedNode) {
      let clickedConnection: Connection | null = null;
      for (const connection of connections) {
        const sourcePos = { x: 0, y: 0 }; // Need actual position from layout
        const targetPos = { x: 0, y: 0 }; // Need actual position from layout
        
        // Simple line hit test
        const d = distanceToLine(x, y, sourcePos.x, sourcePos.y, targetPos.x, targetPos.y);
        if (d < 5) {
          clickedConnection = connection;
          break;
        }
      }
      
      setSelectedConnection(clickedConnection);
    } else {
      setSelectedConnection(null);
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setOffset({
        x: offset.x + dx,
        y: offset.y + dy
      });
      
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  
  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };
  
  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 5));
  };
  
  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.2));
  };
  
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNode(null);
    setSelectedConnection(null);
  };

  // Utility function: calculate distance from point to line segment
  const distanceToLine = (
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number
  ) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <div className="mt-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Traffic Map</h3>
          <div className="flex space-x-2">
            <button
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <FiZoomIn size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
            <button
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <FiZoomOut size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
            <button
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={handleReset}
              title="Reset View"
            >
              <FiRefreshCw size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        {scanResults && scanResults.results && scanResults.results.length > 0 ? (
          <>
            <div className="relative h-[500px] border border-gray-300 dark:border-gray-600 rounded">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-move"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              {/* Legend */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Legend</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <span className="w-3 h-3 inline-block mr-2 rounded-full bg-blue-400"></span>
                    <span className="text-gray-600 dark:text-gray-400">Client Node</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 inline-block mr-2 rounded-full bg-purple-400"></span>
                    <span className="text-gray-600 dark:text-gray-400">Server Node</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 inline-block mr-2 rounded-full bg-red-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">Vulnerable Node</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 inline-block mr-2 rounded-full bg-yellow-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">Partially Vulnerable</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-0.5 inline-block mr-2 bg-red-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">Vulnerable Connection</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-0.5 inline-block mr-2 bg-slate-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">Secure Connection</span>
                  </div>
                </div>
              </div>
              
              {/* Details panel */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Details</h4>
                {selectedNode && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <p><strong>IP:</strong> {selectedNode.ip}</p>
                    <p><strong>Type:</strong> {selectedNode.type}</p>
                    <p><strong>Connections:</strong> {selectedNode.connections}</p>
                    <p><strong>Vulnerable Connections:</strong> {selectedNode.vulnerableConnections}</p>
                  </div>
                )}
                {selectedConnection && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <p><strong>Protocol:</strong> {selectedConnection.protocol}</p>
                    <p><strong>Port:</strong> {selectedConnection.port}</p>
                    <p><strong>Risk Level:</strong> <span className={
                      selectedConnection.riskLevel === 'High' ? 'text-red-500' :
                      selectedConnection.riskLevel === 'Medium' ? 'text-orange-500' :
                      selectedConnection.riskLevel === 'Low' ? 'text-yellow-500' : 'text-green-500'
                    }>{selectedConnection.riskLevel}</span></p>
                    {selectedConnection.vulnerability && (
                      <p><strong>Vulnerability:</strong> {selectedConnection.vulnerability}</p>
                    )}
                  </div>
                )}
                {!selectedNode && !selectedConnection && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Click on a node or connection to see details
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-[500px] flex items-center justify-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
            <p className="text-gray-500 dark:text-gray-400">
              {scanResults ? 'No network data to visualize' : 'Run a scan to visualize network traffic'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkTrafficMap; 