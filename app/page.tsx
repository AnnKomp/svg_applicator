"use client";

import React, { useState } from 'react';
import { ReactSVGPanZoom, TOOL_AUTO, TOOL_NONE, TOOL_PAN, TOOL_ZOOM_IN, TOOL_ZOOM_OUT } from 'react-svg-pan-zoom';

const FichierSVG = () => {
  const [tool, setTool] = useState(TOOL_NONE);
  const [value, setValue] = useState({});

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
        width={1000}
        height={446}
        tool={tool}
        onChangeTool={handleToolChange}
        value={value}
        onChangeValue={handleChangeValue}
      >
        <svg width={1000} height={446} xmlns="http://www.w3.org/2000/svg">
          <image xlinkHref="/plan_detaille_cimetiere.svg" width="1000" height="446" />
        </svg>
      </ReactSVGPanZoom>
    </div>
  );
};

export default FichierSVG;
