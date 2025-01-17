// Full implementation of the React app with OpenLayers, TailwindCSS, and GSAP

import React, { useState, useRef, useEffect } from 'react';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Draw } from 'ol/interaction';
import { fromLonLat } from 'ol/proj';
import Modal from 'react-modal';
import gsap from 'gsap';
import { FaDrawPolygon, FaPencilAlt, FaMapMarkedAlt, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import Dropdown from './Dropdown';

Modal.setAppElement('#root');

function App() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null); // 'LineString' or 'Polygon'
  const [waypoints, setWaypoints] = useState([]);
  const [drawType, setDrawType] = useState(null); // 'LineString' or 'Polygon'
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const drawRef = useRef(null); // Reference to the current Draw interaction

  // Initialize the map
  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    setMap(initialMap);
    return () => initialMap.setTarget(undefined);
  }, []);

  // Handle Drawing Interaction
  const addDrawingInteraction = (type, insertPosition = null) => {
    if (!map) return;

    const draw = new Draw({
      type,
    });

    drawRef.current = draw; // Store the current Draw interaction

    draw.on('drawend', (event) => {
      const coords = event.feature.getGeometry().getCoordinates();
      const formattedCoords = coords.map((c, index) => ({
        wp: `WP(${index.toString().padStart(2, '0')})`,
        coordinates: c,
      }));
      if (insertPosition !== null) {
        // Insert polygon coordinates at the selected position
        const newWaypoints = [...waypoints];
        if (insertPosition === 'before') {
          newWaypoints.splice(selectedWaypoint, 0, ...formattedCoords);
        } else if (insertPosition === 'after') {
          newWaypoints.splice(selectedWaypoint + 1, 0, ...formattedCoords);
        }
        setWaypoints(newWaypoints);
      } else {
        setWaypoints((prev) => [...prev, ...formattedCoords]);
      }
      setDrawingMode(null);
      setDrawType(type);
    });

    map.addInteraction(draw);
    setDrawingMode(type);
  };

  // Modal Transition Effect
  const openModal = () => {
    setModalOpen(true);
    gsap.fromTo(
      '.modal-content',
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
  };

  const closeModal = () => {
    gsap.to('.modal-content', { opacity: 0, y: -50, duration: 0.5, onComplete: () => setModalOpen(false) });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && drawingMode) {
      const draw = drawRef.current;
      if (draw) {
        map.removeInteraction(draw);
        const geom = draw.getOverlay().getSource().getFeatures()[0].getGeometry();
        const coords = geom.getCoordinates();
        const formattedCoords = coords.map((c, index) => ({
          wp: `WP(${index.toString().padStart(2, '0')})`,
          coordinates: c,
        }));
        setWaypoints((prev) => [...prev, ...formattedCoords]);
      }
      setDrawingMode(null);
      drawRef.current = null; // Clear the draw reference
    }
  };

  const zoomIn = () => {
    const view = map.getView();
    view.setZoom(view.getZoom() + 1);
  };

  const zoomOut = () => {
    const view = map.getView();
    view.setZoom(view.getZoom() - 1);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawingMode]);

  return (
    <div className="h-screen w-screen">
      {/* Map Container */}
      <div ref={mapRef} className="h-5/6 w-full relative">
        <button
          className="absolute top-2 left-2 px-4 py-2 bg-blue-600 text-white rounded-md z-10"
          onClick={zoomIn}
        >
          <FaPlus />
        </button>
        <button
          className="absolute top-2 left-16 px-4 py-2 bg-blue-600 text-white rounded-md z-10"
          onClick={zoomOut}
        >
          <FaMinus />
        </button>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center p-4">
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md"
          onClick={() => openModal()}
        >
          <FaMapMarkedAlt className="mr-2" />
          Open Modal
        </button>
        <button
          className="flex items-center ml-4 px-4 py-2 bg-green-600 text-white rounded-md"
          onClick={() => addDrawingInteraction('LineString')}
        >
          <FaPencilAlt className="mr-2" />
          Draw LineString
        </button>
        <button
          className="flex items-center ml-4 px-4 py-2 bg-green-600 text-white rounded-md"
          onClick={() => addDrawingInteraction('Polygon')}
        >
          <FaDrawPolygon className="mr-2" />
          Draw Polygon
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        contentLabel="Waypoints Modal"
        className="modal-content mx-auto mt-20 p-6 bg-white rounded shadow-lg w-1/2"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-bold mb-4">Waypoints</h2>
        <ul>
          {waypoints.map((point, index) => (
            <li key={index} className="mb-2">
              {point.wp}: {point.coordinates.join(', ')}
              <Dropdown
                onSelect={(position) => {
                  setSelectedWaypoint(index);
                  addDrawingInteraction('Polygon', position);
                }}
              />
            </li>
          ))}
        </ul>
        <button
          className="flex items-center mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
          onClick={closeModal}
        >
          <FaTimes className="mr-2" />
          Close
        </button>
      </Modal>
    </div>
  );
}

export default App;
