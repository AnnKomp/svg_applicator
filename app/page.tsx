"use client";

import React, { useState, useEffect } from 'react';
import { ReactSVGPanZoom, TOOL_AUTO, TOOL_NONE, TOOL_PAN, TOOL_ZOOM_IN, TOOL_ZOOM_OUT } from 'react-svg-pan-zoom';

const FichierSVG = () => {
  const [tool, setTool] = useState(TOOL_NONE);
  const [value, setValue] = useState({});

  const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });

  //POUR VOIR TOUT LE CONTENU 
  /* useEffect(() => {
    fetch('https://www.cimetiere-russe.org/geolocation')
      .then(response => {
        console.log(response);
        return response.text(); 
      })
      .then(text => {
        console.log('Raw response:', text); 
        return JSON.parse(text); 
      })
      .then(data => {
        setCoordinates({ lat: data.Latitude, lon: data.Longitude });
      })
      .catch(error => console.error('Error fetching coordinates:', error));
  }, []);
 */

  // MAUVAISE FORME DE CONTENU DE SITE
  /* useEffect(() => {
    fetch('https://www.cimetiere-russe.org/geolocation')
      .then(response => response.json())
      .then(data => {
        setCoordinates({ lat: data.Latitude, lon: data.Longitude });
      })
      .catch(error => console.error('Error fetching coordinates:', error));
  }, []);

  useEffect(() => {
    if (coordinates.lat !== 0 && coordinates.lon !== 0) {
      console.log(`Les coordonnées actuelles sont latitude: ${coordinates.lat}, longitude: ${coordinates.lon}`);
    }
  }, [coordinates]); */


  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 446;

  const latMax = 48.632861;  // top left latitude
  const lonMin = 2.342690;   // bottom left longitude
  const latMin = 48.630101;  // bottom right latitude
  const lonMax = 2.348472;   // top right longitude

  function convert(lat: number, lon: number) {
    var x = ((lon - lonMin) / (lonMax - lonMin)) * MAP_WIDTH;
    var y = ((latMax - lat) / (latMax - latMin)) * MAP_HEIGHT;
    return {x, y};
  } 

  //exemple tant qu'il y a pas de fetch fonctionnel et on est pas sur le terrain
  var lat = 48.630912; // entre 48.630101 et 48.632861 pour etre dans la map
  var lon = 2.3455432; // entre 2.343690 et 2.348472 pour etre dans la map

  var { x, y } = convert(lat, lon);
  console.log(`Les coordonnées en pixels sont x: ${x.toFixed(2)}, y: ${y.toFixed(2)}`);


  const handleToolChange = (tool: any) => {
    console.log('tool changed:', tool);
    setTool(tool);
  };

  const handleChangeValue = (value: React.SetStateAction<{}>) => {
    console.log('value changed:', value);
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
        </svg>
      </ReactSVGPanZoom>
    </div>
  );
};

export default FichierSVG;
