"use client";

import React, { useState, useEffect } from 'react';
import { ReactSVGPanZoom, TOOL_AUTO, TOOL_NONE, TOOL_PAN, TOOL_ZOOM_IN, TOOL_ZOOM_OUT } from 'react-svg-pan-zoom';

const MAP_WIDTH = 926.59839;
const MAP_HEIGHT = 566.15918;
const centerX = MAP_WIDTH / 2;
const centerY = MAP_HEIGHT / 2;
const rotationDegrees = -17;  // rotation de la carte
const rotationRadians = rotationDegrees * Math.PI / 180; 

const latMax = 48.632868;  // top left latitude (48.632861)
const lonMin = 2.342615;   // bottom left longitude (2.342690)
const latMin = 48.630126;  // bottom right latitude (48.630101)
const lonMax = 2.348555;   // top right longitude (2.348472)


const FichierSVG = () => {
  const [tool, setTool] = useState(TOOL_NONE);
  const [value, setValue] = useState({});
  const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });


  // MAUVAISE FORME DE CONTENU DE SITE
  /* useEffect(() => {
    fetch('https://www.cimetiere-russe.org/geolocation')
      .then(response => response.json())
      .then(data => {
        console.log(data.latitude);
        setCoordinates({ lat: data.position.coords.latitude, 
          lon: data.position.coords.longitude });
      })
      .catch(error => console.error('Error fetching coordinates:', error));
  }, []); */


  function convert(lat: number, lon: number): { x: number, y: number } { 
    const calculX = ((lon - lonMin) / (lonMax - lonMin)) * MAP_WIDTH;
    const calculY = ((latMax - lat) / (latMax - latMin)) * MAP_HEIGHT;

    console.log("calculX :",calculX, "calculY:", calculY)

    /* let difX = MAP_WIDTH / (calculX - centerX);
    let difY = MAP_HEIGHT / (calculY - centerY);

    if (calculX < centerX)
      difX = centerX / calculX;

    if (calculY < centerY)
      difY = centerY / calculY;

    console.log("difX :",difX, "difY:", difY) */

    let x = calculX - (Math.abs(centerX - calculX) - (Math.abs(centerX - calculX) /1.1)) /* - (calculX * 1.1 - calculX) */;
    let y = calculY - (Math.abs(centerY - calculY) - (Math.abs(centerY - calculY) /1.6))/* - (calculY * 1.05 - calculY) */

    if (calculX >= centerX) {
      x = calculX + (Math.abs(centerX - calculX) - (Math.abs(centerX - calculX) /1.4))   /* + (MAP_WIDTH*((lon - lonMin) / (lonMax - lonMin) / difX) ) */;
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
  
  var latRD = 48.631283; var lonRD = 2.347382; //rond droit 

  var latRG = 48.631504; var lonRG = 2.346355; // rond gauche
  
  var lat = 48.631261; var lon = 2.343769; // entrée gauche demicercle

  var latTL = 48.632848; var lonTL = 2.343715; // top left corner

  var latCB = 48.630756; var lonCB = 2.346026; // carrefour bas

  var latC =  48.631444; var lonC = 2.345624; //doit etre centre

  var latCHD = 48.632216; var lonCHD = 2.345094; //cercle en haut de l'eglise

  var latTN = 48.630571; var lonTN = 2.347068; // a coté de tombe de Noureev
  
  var latCBG = 48.631039; var lonCBG = 2.344579; // carrefour en bas à gauche

/*   var lat = 48.631381; var lon = 2.345083;
 */

  var latHG = 48.632389; var lonHG = 2.344288; 

  var { x, y } = convert(lat, lon);

  var { x :xRD, y :yRD } = convert(latRD, lonRD);

  var { x :xRG, y :yRG } = convert(latRG, lonRG);

  var { x :xTL, y :yTL } = convert(latTL, lonTL);

  var {x : xCB, y: yCB} = convert(latCB, lonCB);

  var {x : xC, y: yC} = convert(latC, lonC);

  var {x : xHG, y: yHG} = convert(latHG, lonHG);

  var {x : xCHD, y: yCHD} = convert(latCHD, lonCHD);

  var {x : xTN, y: yTN} = convert(latTN, lonTN);

  var {x : xCBG, y: yCBG} = convert(latCBG, lonCBG);

  const handleToolChange = (tool: any) => {
    setTool(tool);
  };

  const handleChangeValue = (value: React.SetStateAction<{}>) => {
    setValue(value);
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
          <circle cx={x} cy={y} r="5" fill="red" />
          <circle cx={xRD} cy={yRD} r="5" fill="green" />
          <circle cx={xRG} cy={yRG} r="5" fill="red" />
          <circle cx={xTL} cy={yTL} r="5" fill="red" />
          <circle cx={xCB} cy={yCB} r="5" fill="red" />
          <circle cx={xC} cy={yC} r="5" fill="red" />
          <circle cx={xHG} cy={yHG} r="5" fill="red" />
          <circle cx={xCHD} cy={yCHD} r="5" fill="red" />
          <circle cx={xTN} cy={yTN} r="5" fill="red" />
          <circle cx={xCBG} cy={yCBG} r="5" fill="red" />

          <circle cx={centerX} cy={centerY} r="5" fill="blue" />

          <circle cx={817} cy={240} r="2" fill="black" />
          <circle cx={622} cy={240} r="2" fill="black" />
          <circle cx={183} cy={433} r="2" fill="black" />
          <circle cx={41} cy={9} r="2" fill="black" />
          <circle cx={622} cy={445} r="2" fill="black" />
          <circle cx={185} cy={100} r="2" fill="black" />
        </svg>
      </ReactSVGPanZoom>
    </div>
  );
};

export default FichierSVG;
