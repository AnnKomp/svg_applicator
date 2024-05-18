"use client";

import React, { useState, useEffect } from 'react';
import { ReactSVGPanZoom,TOOL_NONE } from 'react-svg-pan-zoom';
import Modal from 'react-modal';
import { Poppins } from 'next/font/google';

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
const russColor = "#13B663";
const blockColor = "yellow";

const rayon = 5;


const FichierSVG = () => {
  const [tool, setTool] = useState(TOOL_NONE);
  const [value, setValue] = useState({});
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number; accuracy: number;} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  
  //a partir de la
  /* const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); 

useEffect(() => {
  const updateDimensions = () => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
  };
  updateDimensions();
  window.addEventListener('resize', updateDimensions); 

  return () => {
    window.removeEventListener('resize', updateDimensions); 
  };
}, []); 


  const MAP_HEIGHT = dimensions.height;
  const MAP_WIDTH = dimensions.width;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const plusX = dimensions.width / 4 * 3;
  const minX = dimensions.width / 4;
  const plusY = dimensions.height / 4 * 3;
  const minY = dimensions.height / 4; */

  //jusqu'ici
  
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
        <h1 className={`mb-4 text-xl md:text-2xl`}>
          PLAN DE LA CIMETIERE DE STE GENEVIEVE DES BOIS
        </h1>
        <p>
          appuiez sur un numéro pour avoir l'information !
        </p>
        
        <ReactSVGPanZoom    
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        tool={tool}
        onChangeTool={handleToolChange}
        value={value}
        onChangeValue={handleChangeValue}
        detectAutoPan={false}
        detectWheel={false}
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
            <circle cx={userX} cy={userY} r={rayon} fill="red" />
          )} 

          {/* <circle cx={centerX} cy={centerY} r={rayon} fill="blue" />
          <circle cx={plusX} cy={centerY} r={rayon} fill="blue" />
          <circle cx={centerX} cy={plusY} r={rayon} fill="blue" />
          <circle cx={minX} cy={centerY} r={rayon} fill="blue" />
          <circle cx={centerX} cy={minY} r={rayon} fill="blue" />  */}

          <rect 
            id="A"
            x={centerX - 53} 
            y={centerY + 125} 
            width="21" 
            height="20" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
           <text 
            id="A"
            x={centerX - 53 + 10} 
            y={centerY + 125 + 11} 
            fill="black" 
            fontSize="14" 
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
            id="B"
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
            id="C"
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
            y={centerY - 9} 
            width="20.5" 
            height="11" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
           <text 
            id="D"
            x={centerX + 29} 
            y={centerY - 2.5} 
            fill="black" 
            fontSize="12" 
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
            id="E"
            x={centerX - 25 + 13} 
            y={centerY + 7 + 20} 
            fill="black" 
            fontSize="14" 
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
            id="F"
            x={centerX - 147} 
            y={centerY + 71} 
            fill="black" 
            fontSize="14" 
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
            id="1"
            cx={centerX - 332} 
            cy={centerY + 129} 
            r={rayon} 
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="1"
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
            id="2"
            x={centerX - 263} 
            y={centerY + 114} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="2"
            cx={centerX - 268} 
            cy={centerY + 114} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="2"
            x={centerX - 268} 
            y={centerY +114} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            2
          </text>

          <rect 
            id="3"
            x={centerX - 189.5} 
            y={centerY + 131} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="3"
            cx={centerX - 189.5 - 5} 
            cy={centerY + 134} 
            r={rayon} 
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="3"
            x={centerX - 189.5 - 5} 
            y={centerY + 134} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            3
          </text>

          <rect 
            id="4"
            x={centerX - 154} 
            y={centerY + 232.5} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="4"
            cx={centerX - 154 - 5} 
            cy={centerY + 232.5 + 5} 
            r={rayon} 
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="4"
            x={centerX - 154 - 5} 
            y={centerY + 232.5 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            4
          </text>

          <rect 
            id="5"
            x={centerX - 105} 
            y={centerY + 142} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="5"
            cx={centerX - 105 - 5} 
            cy={centerY + 142 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="5"
            x={centerX - 105 - 5} 
            y={centerY + 142 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            5
          </text>

          <rect 
            id="6"
            x={centerX - 113} 
            y={centerY + 124} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="6"
            cx={centerX - 113 - 5} 
            cy={centerY + 124 + 5} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="6"
            x={centerX - 113 - 5} 
            y={centerY + 124 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            6
          </text>

          <rect 
            id="7"
            x={centerX - 85} 
            y={centerY + 182} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="7"
            cx={centerX - 85 - 5} 
            cy={centerY + 182 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="7"
            x={centerX - 85 - 5} 
            y={centerY + 182 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            7
          </text>

          <rect 
            id="8"
            x={centerX - 53} 
            y={centerY + 264} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="8"
            cx={centerX - 53 + 10} 
            cy={centerY + 264 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="8"
            x={centerX - 53 + 10} 
            y={centerY + 264 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            8
          </text>

          <rect 
            id="9"
            x={centerX + 25} 
            y={centerY + 142} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="9"
            cx={centerX + 25 - 5} 
            cy={centerY + 142 + 5} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="9"
            x={centerX + 25 - 5} 
            y={centerY + 142 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            9
          </text>

          <rect 
            id="10"
            x={centerX + 170.5} 
            y={centerY + 117} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="10"
            cx={centerX + 170.5 - 5} 
            cy={centerY + 117 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="10"
            x={centerX + 170.5 - 5} 
            y={centerY + 117 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            10
          </text>

          <rect 
            id="11"
            x={centerX + 260.5} 
            y={centerY + 86} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="11"
            cx={centerX + 260.5 + 10} 
            cy={centerY + 86 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="11"
            x={centerX + 260.5 + 10} 
            y={centerY + 86 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            11
          </text>

          <rect 
            id="12"
            x={centerX + 260.5} 
            y={centerY + 131} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="12"
            cx={centerX + 260.5 + 10} 
            cy={centerY + 131 + 5} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="12"
            x={centerX + 260.5 + 10} 
            y={centerY + 131 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            12
          </text>

          <rect 
            id="13"
            x={centerX + 282} 
            y={centerY + 142} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="13"
            cx={centerX + 282 + 10} 
            cy={centerY + 142 + 5} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="13"
            x={centerX + 282 + 10} 
            y={centerY + 142 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            13
          </text>

          <rect 
            id="14"
            x={centerX + 268.5} 
            y={centerY + 77} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="14"
            cx={centerX + 268.5 + 10} 
            cy={centerY + 77} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="14"
            x={centerX + 268.5 + 10} 
            y={centerY + 77} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            14
          </text>

          <rect 
            id="15"
            x={centerX + 330.5} 
            y={centerY + 42} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="15"
            cx={centerX + 330.5 - 5} 
            cy={centerY + 42 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="15"
            x={centerX + 330.5 - 5} 
            y={centerY + 42 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            15
          </text>

          <rect 
            id="16"
            x={centerX + 254.5} 
            y={centerY + 45.5} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="16"
            cx={centerX + 254.5 + 7} 
            cy={centerY + 45.5 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="16"
            x={centerX + 254.5 + 7} 
            y={centerY + 45.5 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            16
          </text>

          <rect 
            id="17"
            x={centerX + 246.5} 
            y={centerY + 63} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="17"
            cx={centerX + 246.5 - 3} 
            cy={centerY + 63 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="17"
            x={centerX + 246.5 - 3} 
            y={centerY + 63 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            17
          </text>

          <rect 
            id="18"
            x={centerX + 204.5} 
            y={centerY - 37} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="18"
            cx={centerX + 204.5 - 3} 
            cy={centerY - 37 + 5} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="18"
            x={centerX + 204.5 - 3} 
            y={centerY - 37 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            18
          </text>
          
          <rect 
            id="19"
            x={centerX + 138.5} 
            y={centerY + 42} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="19"
            cx={centerX + 138.5 - 3} 
            cy={centerY + 42 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="19"
            x={centerX + 138.5 - 3} 
            y={centerY + 42 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            19
          </text>

          <rect 
            id="20"
            x={centerX + 138.5} 
            y={centerY + 89.5} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="20"
            cx={centerX + 138.5 - 3} 
            cy={centerY + 89.5 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="20"
            x={centerX + 138.5 - 3} 
            y={centerY + 89.5 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            20
          </text>

          
          <rect 
            id="21"
            x={centerX + 52.5} 
            y={centerY + 17.5} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="21"
            cx={centerX + 52.5 + 9} 
            cy={centerY + 17.5 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="21"
            x={centerX + 52.5 + 9} 
            y={centerY + 17.5 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            21
          </text>

          <rect 
            id="22"
            x={centerX + 18.5} 
            y={centerY - 23} 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="22"
            cx={centerX + 18.5 + 9} 
            cy={centerY - 23 + 5} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="22"
            x={centerX + 18.5 + 9} 
            y={centerY - 23 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            22
          </text>

          <rect 
            id="23"
            x={centerX + 18.5} 
            y={centerY + 10.5 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="23"
            cx={centerX + 18.5 + 9} 
            cy={centerY + 10 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="23"
            x={centerX + 18.5 + 9} 
            y={centerY + 10 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            23
          </text>

          <rect 
            id="24"
            x={centerX + 18.5} 
            y={centerY + 28 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="24"
            cx={centerX + 18.5 + 9} 
            cy={centerY + 28 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="24"
            x={centerX + 18.5 + 9} 
            y={centerY + 28 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            24
          </text>

          <rect 
            id="25"
            x={centerX - 53.5} 
            y={centerY - 2 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="25"
            cx={centerX - 53.5 + 9} 
            cy={centerY - 2 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="25"
            x={centerX - 53.5 + 9} 
            y={centerY - 2 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            25
          </text>

          <rect 
            id="26"
            x={centerX - 53.5} 
            y={centerY + 17.5 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="26"
            cx={centerX - 53.5 + 9} 
            cy={centerY + 17.5 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="26"
            x={centerX - 53.5 + 9} 
            y={centerY + 17.5 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            26
          </text>

          <rect 
            id="27"
            x={centerX - 53.5} 
            y={centerY - 61.5 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="27"
            cx={centerX - 53.5 + 9} 
            cy={centerY - 61.5 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="27"
            x={centerX - 53.5 + 9} 
            y={centerY - 61.5 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            27
          </text>

          <rect 
            id="28"
            x={centerX - 83.5} 
            y={centerY - 77.5 } 
            width="3.5" 
            height="5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="28"
            cx={centerX - 83.5 + 9} 
            cy={centerY - 77.5  - 3} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="28"
            x={centerX - 83.5 + 9} 
            y={centerY - 77.5 - 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            28
          </text>

          <rect 
            id="29"
            x={centerX - 118.5} 
            y={centerY - 77.5 } 
            width="3.5" 
            height="5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="29"
            cx={centerX - 118.5 + 9} 
            cy={centerY - 77.5  - 3} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="29"
            x={centerX - 118.5 + 9} 
            y={centerY - 77.5 - 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            29
          </text>

          <rect 
            id="30"
            x={centerX - 167.5} 
            y={centerY + 21 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="30"
            cx={centerX - 167.5 + 9} 
            cy={centerY + 21  - 3} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="30"
            x={centerX - 167.5 + 9} 
            y={centerY + 21 - 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            30
          </text>

          <rect 
            id="31"
            x={centerX - 161.5} 
            y={centerY + 38.5 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="31"
            cx={centerX - 161.5 + 9} 
            cy={centerY + 38.5  - 3} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="31"
            x={centerX - 161.5 + 9} 
            y={centerY + 38.5 - 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            31
          </text>

          <rect 
            id="32"
            x={centerX - 139.5} 
            y={centerY + 89.5 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="32"
            cx={centerX - 139.5 + 9} 
            cy={centerY + 89.5  - 3} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="32"
            x={centerX - 139.5 + 9} 
            y={centerY + 89.5 - 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            32
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
            id="33"
            cx={centerX - 222} 
            cy={centerY + 75} 
            r={rayon}
            fill={popularColor}
            onClick={handleRectClick}   />
          <text 
            id="33"
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

          <rect 
            id="34"
            x={centerX - 213} 
            y={centerY + 49 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="34"
            cx={centerX - 213 - 3} 
            cy={centerY + 49 - 3} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="34"
            x={centerX - 213 - 3} 
            y={centerY + 49 - 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            34
          </text>

          <rect 
            id="35"
            x={centerX - 235} 
            y={centerY - 15.5 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="35"
            cx={centerX - 235 - 3} 
            cy={centerY - 15.5 - 3} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="35"
            x={centerX - 235 - 3} 
            y={centerY - 15.5- 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            35
          </text>

          <rect 
            id="36"
            x={centerX - 263} 
            y={centerY - 64.5 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="36"
            cx={centerX - 263 - 3} 
            cy={centerY - 64.5 - 3} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="36"
            x={centerX - 263 - 3} 
            y={centerY - 64.5- 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            36
          </text>

          <rect 
            id="37"
            x={centerX - 247.5} 
            y={centerY - 77.5 } 
            width="3.5" 
            height="5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="37"
            cx={centerX - 247.5 + 6} 
            cy={centerY - 77.5  - 3} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="37"
            x={centerX - 247.5 + 6} 
            y={centerY - 77.5 - 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            37
          </text>

          <rect 
            id="38"
            x={centerX - 136} 
            y={centerY - 95.5 } 
            width="6" 
            height="3.5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="38"
            cx={centerX - 136 - 3} 
            cy={centerY - 95.5 - 3} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="38"
            x={centerX - 136 - 3} 
            y={centerY - 95.5 - 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            38
          </text>

          <rect 
            id="39"
            x={centerX - 160} 
            y={centerY - 164 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="39"
            cx={centerX - 160 + 8} 
            cy={centerY - 164 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="39"
            x={centerX - 160 + 8} 
            y={centerY - 164 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            39
          </text>

          <rect 
            id="40"
            x={centerX - 181} 
            y={centerY - 170 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="40"
            cx={centerX - 181 + 8} 
            cy={centerY - 170 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="40"
            x={centerX - 181 + 8} 
            y={centerY - 170 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            40
          </text>

          <rect 
            id="41"
            x={centerX - 258} 
            y={centerY - 170 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="41"
            cx={centerX - 258 + 8} 
            cy={centerY - 170 + 5} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="41"
            x={centerX - 258 + 8} 
            y={centerY - 170 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            41
          </text>

          <rect 
            id="42"
            x={centerX - 247.5} 
            y={centerY - 133 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="42"
            cx={centerX - 247.5 + 8} 
            cy={centerY - 133 + 5} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="42"
            x={centerX - 247.5 + 8} 
            y={centerY - 133 + 5} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            42
          </text>

          <rect 
            id="43"
            x={centerX - 216} 
            y={centerY - 133 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="43"
            cx={centerX - 216 - 3} 
            cy={centerY - 133 + 7} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="43"
            x={centerX - 216 - 3} 
            y={centerY - 133 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            43
          </text>

          <rect 
            id="44"
            x={centerX - 142.5} 
            y={centerY - 146 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="44"
            cx={centerX - 142 - 3} 
            cy={centerY - 146 + 7} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="44"
            x={centerX - 142 - 3} 
            y={centerY - 146 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            44
          </text>

          <rect 
            id="45"
            x={centerX - 268.5} 
            y={centerY - 109.5 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="45"
            cx={centerX - 268.5 - 3} 
            cy={centerY - 109.5 + 7} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="45"
            x={centerX - 268.5 - 3} 
            y={centerY - 109.5 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            45
          </text>

          <rect 
            id="46"
            x={centerX - 292} 
            y={centerY - 85.5 } 
            width="7" 
            height="5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="46"
            cx={centerX - 292 - 3} 
            cy={centerY - 85.5 + 7} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="46"
            x={centerX - 292 - 3} 
            y={centerY - 85.5 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            46
          </text>

          <rect 
            id="47"
            x={centerX - 348} 
            y={centerY - 85.5 } 
            width="3.5" 
            height="5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="47"
            cx={centerX - 348 - 3} 
            cy={centerY - 85.5 + 7} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="47"
            x={centerX - 348 - 3} 
            y={centerY - 85.5 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            47
          </text>

          <rect 
            id="48"
            x={centerX - 348} 
            y={centerY - 103 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="48"
            cx={centerX - 348 + 7} 
            cy={centerY - 103 - 2} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="48"
            x={centerX - 348 + 7} 
            y={centerY - 103 - 2} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            48
          </text>

          <rect 
            id="49"
            x={centerX - 379} 
            y={centerY - 103 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="49"
            cx={centerX - 379 + 7} 
            cy={centerY - 103 - 2} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="49"
            x={centerX - 379 + 7} 
            y={centerY - 103 - 2} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            49
          </text>

          <rect 
            id="50"
            x={centerX - 411} 
            y={centerY - 85.5 } 
            width="3.5" 
            height="5" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="50"
            cx={centerX - 411 - 3} 
            cy={centerY - 85.5 + 7} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="50"
            x={centerX - 411 - 3} 
            y={centerY - 85.5 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            50
          </text>

          <rect 
            id="51"
            x={centerX - 393.5} 
            y={centerY - 115 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="51"
            cx={centerX - 393.5 - 3} 
            cy={centerY - 115 + 7} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="51"
            x={centerX - 393.5 - 3} 
            y={centerY - 115 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            51
          </text>

          <rect 
            id="51"
            x={centerX - 393.5} 
            y={centerY - 115 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="51"
            cx={centerX - 393.5 - 3} 
            cy={centerY - 115 + 7} 
            r={rayon}
            fill={popularColor} 
            onClick={handleRectClick}  />
          <text 
            id="51"
            x={centerX - 393.5 - 3} 
            y={centerY - 115 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            51
          </text>

          <rect 
            id="52"
            x={centerX - 362} 
            y={centerY - 146 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="52"
            cx={centerX - 362 - 3} 
            cy={centerY - 146 + 7} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="52"
            x={centerX - 362 - 3} 
            y={centerY - 146 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            52
          </text>

          <rect 
            id="53"
            x={centerX - 344.5} 
            y={centerY - 121 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="53"
            cx={centerX - 344.5 + 5} 
            cy={centerY - 121 - 3} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="53"
            x={centerX - 344.5 + 5} 
            y={centerY - 121 - 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            53
          </text>

          <rect 
            id="54"
            x={centerX - 330.5} 
            y={centerY - 115 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="54"
            cx={centerX - 330 + 5} 
            cy={centerY - 115 + 7} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="54"
            x={centerX - 330 + 5} 
            y={centerY - 115 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            54
          </text>

          <rect 
            id="55"
            x={centerX - 323.5} 
            y={centerY - 121 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="55"
            cx={centerX - 323.5 + 5} 
            cy={centerY - 121 - 3} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="55"
            x={centerX - 323.5 + 5} 
            y={centerY - 121 - 3} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            55
          </text>

          <rect 
            id="56"
            x={centerX - 341} 
            y={centerY - 170 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="56"
            cx={centerX - 341 + 5} 
            cy={centerY - 170 + 7} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="56"
            x={centerX - 341 + 5} 
            y={centerY - 170 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            56
          </text>

          <rect 
            id="57"
            x={centerX - 364.5} 
            y={centerY - 223 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="57"
            cx={centerX - 364.5 + 5} 
            cy={centerY - 223 + 7} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="57"
            x={centerX - 364.5 + 5} 
            y={centerY - 223 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            57
          </text>

          <rect 
            id="58"
            x={centerX - 406.3} 
            y={centerY - 223 } 
            width="3.5" 
            height="6" 
            fill={blockColor}
            opacity={0.5}
            onClick={handleRectClick} 
            style={{ cursor: 'pointer' }}
          />
          <circle 
            id="58"
            cx={centerX - 406.3 + 5} 
            cy={centerY - 223 + 7} 
            r={rayon}
            fill={russColor} 
            onClick={handleRectClick}  />
          <text 
            id="58"
            x={centerX - 406.3 + 5} 
            y={centerY - 223 + 7} 
            fill="white" 
            fontSize="7" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            onClick={handleRectClick} 
          >
            58
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
          Pour le moment il n y a pas d information disponible
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