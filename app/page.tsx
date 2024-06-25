"use client";

import React, { useState, useEffect } from 'react';
import { ReactSVGPanZoom, TOOL_NONE } from 'react-svg-pan-zoom';
import { fetchPersonnesParParcours, fetchTombesByIds, fetchParcours, fetchSearchDefunts, fetchSearchTombes, fetchSearchDefuntsParTombe } from './lib/data';
import { Personne, Tombe, Parcours, Defunt } from './lib/definitions';
import '../styles/globals.css';

const MAP_WIDTH = 926.59839;
const MAP_HEIGHT = 566.15918;
const centerX = MAP_WIDTH / 2;
const centerY = MAP_HEIGHT / 2;
const rotationDegrees = -17; // rotation de la carte
const rotationRadians = rotationDegrees * Math.PI / 180;
const minAccuracy = 10;

const latMax = 48.632868;  // top left latitude (48.632861)
const lonMin = 2.342615;   // bottom left longitude (2.342690)
const latMin = 48.630126;  // bottom right latitude (48.630101)
const lonMax = 2.348555;   // top right longitude (2.348472)

const rayon = 5;

interface SelectedPersonnes {
  [key: number]: boolean;
}

const FichierSVG = () => {
  const [tool, setTool] = useState(TOOL_NONE);
  const [value, setValue] = useState({});
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number; accuracy: number; } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tombes, setTombes] = useState<Tombe[]>([]);
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [selectedParcoursId, setSelectedParcoursId] = useState<string>('1');
  const [selectedPersonnes, setSelectedPersonnes] = useState<SelectedPersonnes>({});
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>('parcours'); // Nouvel état pour gérer la vue active
  const [searchInput, setSearchInput] = useState<string>(''); // Nouvel état pour gérer l'entrée de recherche
  const [searchResults, setSearchResults] = useState<(Tombe | Defunt)[]>([]); // Nouvel état pour stocker les résultats de recherche
  const [addedItems, setAddedItems] = useState<(Tombe | Defunt)[]>([]); // Nouvel état pour gérer les éléments ajoutés
  const [additionalTombes, setAdditionalTombes] = useState<Tombe[]>([]); // Nouvel état pour gérer les tombes ajoutées

  useEffect(() => {
    const fetchDataPersonnes = async (parcoursId: string) => {
      try {
        const personnesData = await fetchPersonnesParParcours(Number(parcoursId));
        setPersonnes(personnesData);

        const initialSelectedPersonnes: SelectedPersonnes = personnesData.reduce((acc: SelectedPersonnes, personne: Personne) => {
          acc[Number(personne.id)] = true;
          return acc;
        }, {});
        setSelectedPersonnes(initialSelectedPersonnes);

        const tombeIds = personnesData.map((personne: { tombe: any; }) => personne.tombe);
        const tombesData = await fetchTombesByIds(tombeIds);
        setTombes(tombesData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching personnes data:', error);
        setLoading(false);
      }
    };

    const fetchDataParcours = async () => {
      try {
        const parcoursData = await fetchParcours();
        setParcours(parcoursData);
      } catch (error) {
        console.error('Error fetching parcours data:', error);
      }
    };

    fetchDataPersonnes(selectedParcoursId);
    fetchDataParcours();

    const getLocation = () => {
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
              setTimeout(getLocation, 5000);
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

    getLocation();

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, [selectedParcoursId]);

  useEffect(() => {
    if (addedItems.length > 0) {
      const tombeIds = addedItems
        .map(item => ('tombe' in item ? item.tombe : item.id))
        .filter((id, index, self) => self.indexOf(id) === index); // Suppression des doublons
      fetchAdditionalTombes(tombeIds);
    }
  }, [addedItems]);

  const fetchAdditionalTombes = async (tombeIds: (string | number)[]) => {
    try {
      const numericalTombeIds = tombeIds.map(id => typeof id === 'string' ? parseInt(id) : id);
      const additionalTombesData = await fetchTombesByIds(numericalTombeIds);
      setAdditionalTombes(additionalTombesData);
    } catch (error) {
      console.error('Error fetching additional tombes:', error);
    }
  };

  function convert(lat: number, lon: number): { x: number, y: number } {
    const currentWidth = isSmallScreen ? MAP_WIDTH / 2 : MAP_WIDTH;
    const currentHeight = isSmallScreen ? MAP_HEIGHT / 2 : MAP_HEIGHT;

    const calculX = ((lon - lonMin) / (lonMax - lonMin)) * MAP_WIDTH;
    const calculY = ((latMax - lat) / (latMax - latMin)) * MAP_HEIGHT;

    let x = calculX - (Math.abs(centerX - calculX) - (Math.abs(centerX - calculX) / 1.1));
    let y = calculY - (Math.abs(centerY - calculY) - (Math.abs(centerY - calculY) / 1.6));

    if (calculX >= centerX) {
      x = calculX + (Math.abs(centerX - calculX) - (Math.abs(centerX - calculX) / 1.45));
    }
    if (calculX >= centerX) {
      x = calculX + (Math.abs(centerX - calculX) - (Math.abs(centerX - calculX) / 1.35));
    }

    if (calculY >= centerY) {
      y = calculY + (Math.abs(centerY - calculY) - (Math.abs(centerY - calculY) / 1.4));
    }

    const xRotated = Math.cos(rotationRadians) * (x - centerX) - Math.sin(rotationRadians) * (y - centerY) + centerX;
    const yRotated = Math.sin(rotationRadians) * (x - centerX) + Math.cos(rotationRadians) * (y - centerY) + centerY;

    const { x: xFinal, y: yFinal } = recalculateCoordinates(xRotated, yRotated, currentWidth, currentHeight);

    return { x: xFinal, y: yFinal };
  }

  const recalculateCoordinates = (x: number, y: number, currentWidth: number, currentHeight: number) => {
    const scaleX = currentWidth / MAP_WIDTH;
    const scaleY = currentHeight / MAP_HEIGHT;
    return { x: x * scaleX, y: y * scaleY };
  };

  const recalculateWidth = (w: number, currentWidth: number) => {
    const scaleX = currentWidth / MAP_WIDTH;
    return w * scaleX;
  };

  const recalculateHeight = (h: number, currentHeight: number) => {
    const scaleY = currentHeight / MAP_HEIGHT;
    return h * scaleY;
  };

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

  const handleRectClick = (nomSite: string) => {
    window.location.href = `https://www.cimetiere-russe.org/${nomSite}`;
  };

  const handlePersonneClick = (nomSite: string) => {
    window.location.href = `https://www.cimetiere-russe.org/${nomSite}`;
  };

  const handleParcoursChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedParcoursId(event.target.value);
  };

  const handleCheckboxChange = (personneId: number) => {
    setSelectedPersonnes(prevSelectedPersonnes => ({
      ...prevSelectedPersonnes,
      [personneId]: !prevSelectedPersonnes[personneId]
    }));
  };

  const handleSearchByName = async () => {
    try {
      const results = await fetchSearchDefunts(searchInput);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching by name:', error);
    }
  };

  const handleSearchByTombe = async () => {
    try {
      const results = await fetchSearchDefuntsParTombe(Number(searchInput));
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching by tombe:', error);
    }
  };

  const handleAddItem = (item: Tombe | Defunt) => {
    setAddedItems((prevItems) => [...prevItems, item]);
  };

  const handleToggleItem = (item: Tombe | Defunt) => {
    setAddedItems((prevItems) =>
      prevItems.some((i) => i.id === item.id)
        ? prevItems.filter((i) => i.id !== item.id)
        : [...prevItems, item]
    );
  };

  const chunkArray = (arr: Personne[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const personnesChunks = chunkArray(personnes, 10);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-xl md:text-2xl font-bold">
        PLAN DE LA CIMETIERE DE STE GENEVIEVE DES BOIS
      </h1>

      <div className="flex justify-end mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded ${activeView === 'parcours' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setActiveView('parcours')}
        >
          Parcours
        </button>
        <button
          className={`px-4 py-2 rounded ${activeView === 'personnalise' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setActiveView('personnalise')}
        >
          Personnalisé
        </button>
      </div>

      <div className={`w-full h-auto ${isSmallScreen ? 'max-w-full' : 'max-w-4xl'} mx-auto`}>
        <ReactSVGPanZoom
          width={isSmallScreen ? MAP_WIDTH / 2 : MAP_WIDTH}
          height={isSmallScreen ? MAP_HEIGHT / 2 : MAP_HEIGHT}
          tool={tool}
          onChangeTool={handleToolChange}
          value={value}
          onChangeValue={handleChangeValue}
          detectAutoPan={false}
          detectWheel={false}
        >
          <svg width={isSmallScreen ? MAP_WIDTH / 2 : MAP_WIDTH}
            height={isSmallScreen ? MAP_HEIGHT / 2 : MAP_HEIGHT}
            xmlns="http://www.w3.org/2000/svg">
            <image xlinkHref="/plan_detaille_cimetiere.svg" width={isSmallScreen ? MAP_WIDTH / 2 : MAP_WIDTH}
              height={isSmallScreen ? MAP_HEIGHT / 2 : MAP_HEIGHT} />

            {userX !== null && userY !== null && (
              <circle cx={userX} cy={userY} r={rayon} fill="red" />
            )}

            {activeView === 'parcours' && tombes.map((tombe) => {
              const currentWidth = isSmallScreen ? MAP_WIDTH / 2 : MAP_WIDTH;
              const currentHeight = isSmallScreen ? MAP_HEIGHT / 2 : MAP_HEIGHT;
              const { x, y } = recalculateCoordinates(tombe.x, tombe.y, currentWidth, currentHeight);
              const width = tombe.vertical ? recalculateWidth(3.5, currentWidth) : recalculateWidth(6, currentWidth);
              const height = tombe.vertical ? recalculateHeight(6, currentHeight) : recalculateHeight(3.5, currentHeight);
              const relatedPersonne = personnes.find(personne => personne.tombe === tombe.id);
              const nomSite = relatedPersonne ? relatedPersonne.nom_site : 'unknown';
              return (
                relatedPersonne && selectedPersonnes[Number(relatedPersonne.id)] && (
                  <rect
                    key={tombe.id}
                    id={nomSite}
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill="red"
                    opacity={0.8}
                    onClick={() => handleRectClick(nomSite)}
                  />
                )
              );
            })}

            {activeView === 'personnalise' && additionalTombes.map((tombe) => {
              const currentWidth = isSmallScreen ? MAP_WIDTH / 2 : MAP_WIDTH;
              const currentHeight = isSmallScreen ? MAP_HEIGHT / 2 : MAP_HEIGHT;
              const { x, y } = recalculateCoordinates(tombe.x, tombe.y, currentWidth, currentHeight);
              const width = tombe.vertical ? recalculateWidth(3.5, currentWidth) : recalculateWidth(6, currentWidth);
              const height = tombe.vertical ? recalculateHeight(6, currentHeight) : recalculateHeight(3.5, currentHeight);
              return (
                <rect
                  key={tombe.id}
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill="red"
                  opacity={0.8}
                  onClick={() => handleRectClick(tombe.nom)}
                />
              );
            })}
          </svg>
        </ReactSVGPanZoom>
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {activeView === 'parcours' && (
        <div>
          <div className="mt-4 p-4 border border-gray-300 bg-gray-50 rounded">
            <label htmlFor="parcours-select" className="block mb-2 text-lg font-medium text-gray-700">Choisissez un parcours :</label>
            <select id="parcours-select" value={selectedParcoursId} onChange={handleParcoursChange} className="block w-full p-2 border border-gray-300 rounded-md">
              {parcours.map((parcour) => (
                <option key={parcour.id} value={parcour.id}>
                  {parcour.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 p-4 border border-gray-300 bg-gray-50 rounded">
            <h2 className="text-lg font-medium text-gray-700">Personnes dans le parcours</h2>
            <div className="flex flex-wrap">
              {personnesChunks.map((chunk, chunkIndex) => (
                <ul key={chunkIndex} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                  {chunk.map(personne => (
                    <li key={personne.id} className="mt-2">
                      <label className="inline-flex items-center" >
                        <input
                          type="checkbox"
                          checked={!!selectedPersonnes[Number(personne.id)]}
                          onChange={() => handleCheckboxChange(Number(personne.id))}
                          className="form-checkbox h-5 w-5 text-indigo-600"
                        />
                        <span className="ml-2 text-gray-700"
                          onClick={() => handlePersonneClick(personne.nom_site)}>{personne.nom}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'personnalise' && (
        <div className="mt-4 p-4 border border-gray-300 bg-gray-50 rounded">
          <p>Un nom d'un défunt ou un numéro d'une tombe : </p>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-full"
          />
          <div className="flex justify-between mt-2">
            <button
              onClick={handleSearchByName}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Recherche par nom
            </button>
            <button
              onClick={handleSearchByTombe}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Recherche par tombe
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700">Résultats de la recherche :</h3>
              <ul className="mt-2">
                {searchResults.map((result) => {
                  if ('carre' in result) {
                    // Tombe
                    return (
                      <li key={result.id} className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={!!addedItems.find((item) => item.id === result.id)}
                            onChange={() => handleToggleItem(result)}
                            className="form-checkbox h-5 w-5 text-indigo-600"
                          />
                          <span className="ml-2">{result.id}, {result.carre}</span>
                        </label>
                      </li>
                    );
                  } else {
                    // Defunt
                    return (
                      <li key={result.id} className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={!!addedItems.find((item) => item.id === result.id)}
                            onChange={() => handleToggleItem(result)}
                            className="form-checkbox h-5 w-5 text-indigo-600"
                          />
                          <span className="ml-2">
                            <strong>{result.titre}</strong> {result.prenom} {result.nomJFille && `(${result.nomJFille})`} {result.nom} {result.patronyme && `(${result.patronyme})`}
                          </span>
                        </label>
                      </li>
                    );
                  }
                })}
              </ul>
            </div>
          )}

          {addedItems.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700">Liste des défunts ajoutés :</h3>
              <ul className="mt-2">
                {addedItems.map((item) => {
                  if ('carre' in item) {
                    // Tombe
                    return (
                      <li key={item.id} className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={() => handleToggleItem(item)}
                            className="form-checkbox h-5 w-5 text-indigo-600"
                          />
                          <span className="ml-2">{item.id}, {item.carre}</span>
                        </label>
                      </li>
                    );
                  } else {
                    // Defunt
                    return (
                      <li key={item.id} className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={() => handleToggleItem(item)}
                            className="form-checkbox h-5 w-5 text-indigo-600"
                          />
                          <span className="ml-2">
                            <strong>{item.titre}</strong> {item.prenom} {item.nomJFille && `(${item.nomJFille})`} {item.nom} {item.patronyme && `(${item.patronyme})`}
                          </span>
                        </label>
                      </li>
                    );
                  }
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {userPosition && (
        <div className="mt-4 p-4 border border-gray-300 bg-gray-50 rounded">
          <p><strong>Latitude:</strong> {userPosition.latitude}</p>
          <p><strong>Longitude:</strong> {userPosition.longitude}</p>
          <p><strong>Accuracy:</strong> {userPosition.accuracy} meters</p>
        </div>
      )}
    </div>
  );
};

export default FichierSVG;
