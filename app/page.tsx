"use client";

import React, { useState, useEffect } from 'react';
import { ReactSVGPanZoom, TOOL_NONE } from 'react-svg-pan-zoom';
import { fetchTombesByIds, fetchSearchDefunts, fetchSearchDefuntsParTombe, fetchCategories, fetchPersonnesParCategorie, fetchPageSlug } from './lib/data';
import { Tombe, Defunt, Categorie, PageSlug } from './lib/definitions';
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

interface SelectedDefunts {
  [key: number]: boolean;
}

const FichierSVG = () => {
  const [tool, setTool] = useState(TOOL_NONE);
  const [value, setValue] = useState({});
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number; accuracy: number; } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tombes, setTombes] = useState<Tombe[]>([]);
  const [defunts, setDefunts] = useState<Defunt[]>([]);
  const [selectedDefunts, setSelectedDefunts] = useState<SelectedDefunts>({});
  const [activeView, setActiveView] = useState<string>('parcours'); 
  const [searchInput, setSearchInput] = useState<string>(''); 
  const [searchResults, setSearchResults] = useState<(Tombe | Defunt)[]>([]); 
  const [addedItems, setAddedItems] = useState<(Tombe | Defunt)[]>([]); 
  const [additionalTombes, setAdditionalTombes] = useState<Tombe[]>([]); 
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategorie, setSelectedCategorie] = useState<string>('danse');
  const [pageSlugs, setPageSlugs] = useState<{ [key: number]: string }>({});
  const [language, setLanguage] = useState<string>('ru');

  const translations: { [key: string]: { [key: string]: string } } = {
    fr: {
      title: "PLAN DE LA CIMETIERE DE STE-GENEVIEVE-DES-BOIS",
      chooseCategory: "Choisissez une categorie :",
      searchPrompt: "Entrez le nom du défunt ou le numéro de la tombe :",
      searchResults: "Résultats de votre recherche :",
      addedList: "Liste des personnes ajoutés :",
      latitude: "Latitude:",
      longitude: "Longitude:",
      accuracy: "Accuracy:"
    },
    ru: {
      title: "КЛАДБИЩЕ САН ЖЕНЕВЬЕВ ДЕ БУА",
      chooseCategory: "Выберите категорию :",
      searchPrompt: "Введите имя усопшего или номер могилы :",
      searchResults: "Результаты поиска :",
      addedList: "Список добавленных :",
      latitude: "Широта:",
      longitude: "Долгота:",
      accuracy: "Точность:"
    },
    en: {
      title: "PLAN OF THE CEMETERY OF STE-GENEVIEVE-DES-BOIS",
      chooseCategory: "Choose a category :",
      searchPrompt: "Enter the name of the deceased or the grave number :",
      searchResults: "Search results :",
      addedList: "List of added persons :",
      latitude: "Latitude:",
      longitude: "Longitude:",
      accuracy: "Accuracy:"
    }
  };

  const t = (key: string) => translations[language][key];

  // Redimension de SVG
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setScreenWidth(window.innerWidth);

      const handleResize = () => {
        setScreenWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const padding = screenWidth * 0.09; 
  const maxSVGWidth = screenWidth - padding * 2;
  const currentWidth = maxSVGWidth < MAP_WIDTH ? maxSVGWidth : MAP_WIDTH;
  const currentHeight = (currentWidth / MAP_WIDTH) * MAP_HEIGHT;

  useEffect(() => {
    const fetchDataDefunts = async (categorie: string) => {
      try {
        const defuntsData = await fetchPersonnesParCategorie(categorie);
        setDefunts(defuntsData);

        const initialSelectedDefunts: SelectedDefunts = defuntsData.reduce((acc: SelectedDefunts, defunt: Defunt) => {
          acc[Number(defunt.id)] = true;
          return acc;
        }, {});
        setSelectedDefunts(initialSelectedDefunts);

        const tombeIds = defuntsData.map((defunt: { tombe: any; }) => defunt.tombe);
        const tombesData = await fetchTombesByIds(tombeIds);
        setTombes(tombesData);

        const slugs = await Promise.all(defuntsData.map(async (defunt: { id: number; }) => {
          const slugData = await fetchPageSlug(language, defunt.id);
          return { [defunt.id]: slugData[0]?.pageSlug };
        }));
        setPageSlugs(Object.assign({}, ...slugs));
    

        setLoading(false);
      } catch (error) {
        console.error('Error fetching defunts data:', error);
        setLoading(false);
      }
    };

    const fetchDataCategories = async () => {
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories data:', error);
      }
    };

    fetchDataDefunts(selectedCategorie);
    fetchDataCategories();

    // Recuperation de latitude/longitude utilisateur
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
  }, [selectedCategorie, language]);

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

  // Conversion de latitude/longitude d'utilisateur vers pixels
  function convert(lat: number, lon: number): { x: number, y: number } {
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

  const handleCategorieChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategorie(event.target.value);
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  const handleCheckboxChange = (defuntId: number) => {
    setSelectedDefunts(prevSelectedDefunts => ({
      ...prevSelectedDefunts,
      [defuntId]: !prevSelectedDefunts[defuntId]
    }));
  };

  const handleRectClick = (defuntId: number) => {
    const slug = pageSlugs[defuntId];
    if (slug) {
      window.location.href = `https://www.cimetiere-russe.org/${slug}`;
    }
  };  

  const handleSearch = async () => {
    if (!isNaN(Number(searchInput))) {
      handleSearchByTombe();
    } else {
      handleSearchByName();
    }
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

  const handleToggleItem = (item: Tombe | Defunt) => {
    setAddedItems((prevItems) =>
      prevItems.some((i) => i.id === item.id)
        ? prevItems.filter((i) => i.id !== item.id)
        : [...prevItems, item]
    );
  };

  const chunkArray = (arr: Defunt[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const defuntsChunks = chunkArray(defunts, 10);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-xl md:text-2xl font-bold">
        {t('title')}
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
        <select
          value={language}
          onChange={handleLanguageChange}
          className="ml-2 px-4 py-2 rounded bg-gray-200 text-gray-800"
        >
          <option value="ru">Русский</option>
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="flex justify-center">
        <div className="w-full h-auto" style={{ maxWidth: `${currentWidth}px`,  paddingRight: `${padding}px` }}>
          {isClient && (
            <ReactSVGPanZoom
              width={currentWidth}
              height={currentHeight}
              tool={tool}
              onChangeTool={handleToolChange}
              value={value}
              onChangeValue={handleChangeValue}
              detectAutoPan={false}
              detectWheel={false}
              miniaturePosition="none"
              customMiniature="none"
            >
              <svg width={currentWidth}
                height={currentHeight}
                xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <mask id="minimap-mask">
                    <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="white" />
                    <rect x="0" y="470" width="100" height="100" fill="black" />
                  </mask>
                </defs>
                <image xlinkHref="/plan_detaille_cimetiere.svg" width={currentWidth}
                  height={currentHeight} mask="url(#minimap-mask)" />

                {userX !== null && userY !== null && (
                  <circle cx={userX} cy={userY} r={rayon} fill="red" />
                )}

                {activeView === 'parcours' && tombes.map((tombe) => {
                  const { x, y } = recalculateCoordinates(tombe.x, tombe.y, currentWidth, currentHeight);
                  const width = tombe.vertical ? recalculateWidth(3.5, currentWidth) : recalculateWidth(6, currentWidth);
                  const height = tombe.vertical ? recalculateHeight(6, currentHeight) : recalculateHeight(3.5, currentHeight);
                  const relatedDefunt = defunts.find(defunt => defunt.tombe === tombe.id);
                  return (
                    relatedDefunt && selectedDefunts[Number(relatedDefunt.id)] && (
                      <rect
                        key={tombe.id}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill="red"
                        opacity={0.8}
                        onClick={() => handleRectClick(Number(relatedDefunt.id))}
                      />
                    )
                  );
                })}

                {activeView === 'personnalise' && additionalTombes.map((tombe) => {
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
                      onClick={() => handleRectClick(Number(tombe.id))}
                    />
                  );
                })}
              </svg>
            </ReactSVGPanZoom>
          )}
        </div>
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {activeView === 'parcours' && (
        <div>
          <div className="mt-4 p-4 border border-gray-300 bg-gray-50 rounded">
            <label htmlFor="parcours-select" className="block mb-2 text-lg font-medium text-gray-700">{t('chooseCategory')}</label>
            <select id="categorie-select" value={selectedCategorie} onChange={handleCategorieChange} className="block w-full p-2 border border-gray-300 rounded-md">
            {categories.map((cat) => (
                <option key={cat.categorie} value={cat.categorie}>
                  {cat.categorie}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 p-4 border border-gray-300 bg-gray-50 rounded">
            <h2 className="text-lg font-medium text-gray-700">{t('searchResults')}</h2>
            <div className="flex flex-wrap">
              {defuntsChunks.map((chunk, chunkIndex) => (
                <ul key={chunkIndex} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                  {chunk.map(defunt => (
                    <li key={defunt.id} className="mt-2">
                      <label className="inline-flex items-center" >
                        <input
                          type="checkbox"
                          checked={!!selectedDefunts[Number(defunt.id)]}
                          onChange={() => handleCheckboxChange(Number(defunt.id))}
                          className="form-checkbox h-5 w-5 text-indigo-600"
                        />
                        <span className="ml-2 text-gray-700">{defunt.nom} {defunt.prenom}</span>
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
          <p>{t('searchPrompt')}</p>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-full"
          />
          <div className="flex justify-between mt-2">
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Recherche
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700">{t('searchResults')}</h3>
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
              <h3 className="text-lg font-medium text-gray-700">{t('addedList')}</h3>
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
          <p><strong>{t('latitude')}</strong> {userPosition.latitude}</p>
          <p><strong>{t('longitude')}</strong> {userPosition.longitude}</p>
          <p><strong>{t('accuracy')}</strong> {userPosition.accuracy} meters</p>
        </div>
      )}
    </div>
  );
};

export default FichierSVG;
