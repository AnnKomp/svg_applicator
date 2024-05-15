"use client";

import React, { useState, useEffect } from 'react';
import { ReactSVGPanZoom,TOOL_NONE } from 'react-svg-pan-zoom';
import Modal from 'react-modal';

const MAP_WIDTH = 926.59839;
const MAP_HEIGHT = 566.15918;
const centerX = MAP_WIDTH / 2;
const centerY = MAP_HEIGHT / 2;
const plusX = MAP_WIDTH / 4 * 3;
const minX = MAP_WIDTH / 4;
const plusY = MAP_HEIGHT / 4 * 3;
const minY = MAP_HEIGHT / 4;
const rotationDegrees = -17;  // rotation de la carte
const rotationRadians = rotationDegrees * Math.PI / 180; 
const minAccuracy = 10;

const latMax = 48.632868;  // top left latitude (48.632861)
const lonMin = 2.342615;   // bottom left longitude (2.342690)
const latMin = 48.630126;  // bottom right latitude (48.630101)
const lonMax = 2.348555;   // top right longitude (2.348472)

const testColor = "orange";
const popularColor = "red";
const russColor = "green";
const blockColor = "yellow";


const FichierSVG = () => {
  const [tool, setTool] = useState(TOOL_NONE);
  const [value, setValue] = useState({});
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number; accuracy: number;} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newPosition = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
            setUserPosition(newPosition);
            setLoading(false);
            if (newPosition.accuracy > minAccuracy) {
              console.log("Current accuracy: " + newPosition.accuracy);
              setTimeout(fetchData, 5000); 
            } 
          },
          (error) => {
            setError(error.message);
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
      } else {
        setError('Geolocation is not supported by this browser');
        setLoading(false);
      }
    };

    fetchData();

  }, []);

  /* const handleUserPositionUpdate = (position: { latitude: number; longitude: number; accuracy : number;} | null) => {
    setUserPosition(position);
  }; */

  function convert(lat: number, lon: number): { x: number, y: number } { 
    const calculX = ((lon - lonMin) / (lonMax - lonMin)) * MAP_WIDTH;
    const calculY = ((latMax - lat) / (latMax - latMin)) * MAP_HEIGHT;

    //console.log("calculX :",calculX, "calculY:", calculY)

    let x = calculX - (Math.abs(centerX - calculX) - (Math.abs(centerX - calculX) /1.1)) /* - (calculX * 1.1 - calculX) */;
    let y = calculY - (Math.abs(centerY - calculY) - (Math.abs(centerY - calculY) /1.6))/* - (calculY * 1.05 - calculY) */

    if (calculX >= centerX) {
      x = calculX + (Math.abs(centerX - calculX) - (Math.abs(centerX - calculX) /1.45))   /* + (MAP_WIDTH*((lon - lonMin) / (lonMax - lonMin) / difX) ) */;
    }
    if(calculX >= plusX) {
      x = calculX + (Math.abs(centerX - calculX) - (Math.abs(centerX - calculX) /1.35))   /* + (MAP_WIDTH*((lon - lonMin) / (lonMax - lonMin) / difX) ) */;
    }

    if (calculY >= centerY) {
      y = calculY + (Math.abs(centerY - calculY) - (Math.abs(centerY - calculY) /1.4 ))  /*  - (MAP_HEIGHT*((latMax - lat) / (latMax - latMin) / (difY))) */;
    }
  
    /* let x = ((lat - latMin)*(MAP_WIDTH))/(latMax - latMin);
    let y = ((lon - lonMin)*(MAP_HEIGHT))/(lonMax- lonMin);

    console.log("x :",x, "y :",y) */
    
    const xRotated = Math.cos(rotationRadians) * (x - centerX) - Math.sin(rotationRadians) * (y - centerY) + centerX;
    const yRotated = Math.sin(rotationRadians) * (x - centerX) + Math.cos(rotationRadians) * (y - centerY) + centerY;
  
    return { x: xRotated, y: yRotated };
  }
  /* 
  var latRD = 48.631283; var lonRD = 2.347382; //rond droit 
  var latRG = 48.631504; var lonRG = 2.346355; // rond gauche
  var latEG = 48.631261; var lonEG = 2.343769; // entrée gauche demicercle
  var latTL = 48.632848; var lonTL = 2.343715; // top left corner
  var latCB = 48.630750; var lonCB = 2.346030; // carrefour bas
  var latC =  48.631444; var lonC = 2.345624; //doit etre centre
  var latCHD = 48.632216; var lonCHD = 2.345094; //cercle en haut de l'eglise
  var latTN = 48.630571; var lonTN = 2.347068; // a coté de tombe de Noureev
  var latCBG = 48.631039; var lonCBG = 2.344579; // carrefour en bas à gauche
  var latHG = 48.632389; var lonHG = 2.344288; 


  var { x :xEG, y: yEG } = convert(latEG, lonEG);
  var { x :xRD, y :yRD } = convert(latRD, lonRD);
  var { x :xRG, y :yRG } = convert(latRG, lonRG);
  var { x :xTL, y :yTL } = convert(latTL, lonTL);
  var {x : xCB, y: yCB} = convert(latCB, lonCB);
  var {x : xC, y: yC} = convert(latC, lonC);
  var {x : xHG, y: yHG} = convert(latHG, lonHG);
  var {x : xCHD, y: yCHD} = convert(latCHD, lonCHD);
  var {x : xTN, y: yTN} = convert(latTN, lonTN);
  var {x : xCBG, y: yCBG} = convert(latCBG, lonCBG); 

 */

  let userX = null;
  let userY = null;
  if (userPosition) {
    const { latitude, longitude } = userPosition;
    const { x, y } = convert(latitude, longitude);
    userX = x;
    userY = y;
  }

  const handleToolChange = (tool: any) => {
    setTool(tool);
  };

  const handleChangeValue = (value: React.SetStateAction<{}>) => {
    setValue(value);
  };

  const handleRectClick = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div>
      <ReactSVGPanZoom    
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        tool={tool}
        onChangeTool={handleToolChange}
        value={value}
        onChangeValue={handleChangeValue}
      >
        <svg width={MAP_WIDTH} height={MAP_HEIGHT} xmlns="http://www.w3.org/2000/svg">
          <image xlinkHref="/plan_detaille_cimetiere.svg" width={MAP_WIDTH} height={MAP_HEIGHT} />
          {/* <circle cx={xEG} cy={yEG} r="5" fill={testColor} />
          <circle cx={xRD} cy={yRD} r="5" fill={testColor} />
          <circle cx={xRG} cy={yRG} r="5" fill={testColor} />
          <circle cx={xTL} cy={yTL} r="5" fill={testColor} />
          <circle cx={xCB} cy={yCB} r="5" fill={testColor} />
          <circle cx={xC} cy={yC} r="5" fill={testColor} />
          <circle cx={xHG} cy={yHG} r="5" fill={testColor} />
          <circle cx={xCHD} cy={yCHD} r="5" fill={testColor} />
          <circle cx={xTN} cy={yTN} r="5" fill={testColor} />
          <circle cx={xCBG} cy={yCBG} r="5" fill={testColor} />
  */}
          {userX !== null && userY !== null && (
            <circle cx={userX} cy={userY} r="5" fill="red" />
          )} 
{/* 
          <circle cx={centerX} cy={centerY} r="5" fill="blue" />
          <circle cx={plusX} cy={centerY} r="5" fill="blue" />
          <circle cx={centerX} cy={plusY} r="5" fill="blue" />
          <circle cx={minX} cy={centerY} r="5" fill="blue" />
          <circle cx={centerX} cy={minY} r="5" fill="blue" />  */}

          <rect 
            id="A"
            x={centerX - 53} 
            y={centerY + 125} 
            width="20" 
            height="20" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
           <text 
            x={centerX - 53 + 10} 
            y={centerY + 120 + 17} 
            fill="black" 
            fontSize="16" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            A
          </text>

          <rect 
            id="B"
            x={centerX + 227 } 
            y={centerY + 100} 
            width="25.5" 
            height="42" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
           <text 
            x={centerX + 240} 
            y={centerY + 120} 
            fill="black" 
            fontSize="12" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            B
          </text>

          <rect 
            id="C"
            x={centerX + 170 } 
            y={centerY - 54} 
            width="6.5" 
            height="17" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
           <text 
            x={centerX + 173} 
            y={centerY - 45} 
            fill="black" 
            fontSize="12" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            C
          </text>


          <rect 
            id="D"
            x={centerX + 18 } 
            y={centerY - 12} 
            width="20.5" 
            height="13" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
           <text 
            x={centerX + 29} 
            y={centerY - 4} 
            fill="black" 
            fontSize="14" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            D
          </text>

          <rect 
            id="E"
            x={centerX - 25} 
            y={centerY + 7} 
            width="26" 
            height="35" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
           <text 
            x={centerX - 25 + 13} 
            y={centerY + 7 + 20} 
            fill="black" 
            fontSize="16" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            E
          </text>

          <rect 
            id="F"
            x={centerX - 162} 
            y={centerY + 59} 
            width="29" 
            height="21" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <rect 
          id="F"
          x={centerX - 140} 
          y={centerY + 35} 
          width="7" 
          height="15" 
          fill={blockColor}
          opacity={0.5}
          onClick={handleRectClick} 
          style={{ cursor: 'pointer' }}
        />
          <text 
            x={centerX - 147} 
            y={centerY + 71} 
            fill="black" 
            fontSize="16" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            F
          </text>

          <rect 
            id="1"
            x={centerX - 340} 
            y={centerY + 123} 
            width="11" 
            height="20" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            cx={centerX - 332} 
            cy={centerY + 129} 
            r="5" 
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            x={centerX - 332} 
            y={centerY +129} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            1
          </text>

          <rect 
            id="33"
            x={centerX - 227} 
            y={centerY + 63} 
            width="12" 
            height="17" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            cx={centerX - 222} 
            cy={centerY + 75} 
            r="5" 
            fill={popularColor}
            onClick={handleRectClick}   />
          <text 
            x={centerX - 222} 
            y={centerY + 75} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            33
          </text>

      

          


        </svg>
      </ReactSVGPanZoom>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Information"
        ariaHideApp={false}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)'
          }
        }}
      >
        <button 
        onClick={handleCloseModal}>
          Pour le moment il n'y a pas d'information disponible
          </button>
      </Modal>

      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      {userPosition && (
        <div>
          <p>Latitude: {userPosition.latitude}</p>
          <p>Longitude: {userPosition.longitude}</p>
          <p>Accuracy: {userPosition.accuracy} meters</p>
        </div>
      )}

    </div>
  );
};

export default FichierSVG;