import React, {useEffect, useState} from "react";
import ReplayIcon from '@mui/icons-material/Replay';
import skinService from './services/skinService.js';

export default function ImageComponent() {

    const [champ, setChamp] = useState(null);
    const [skinName, setSkinName] = useState("");
    const [inputName, setInputName] = useState("");
    const [guessValue, setGuessValue] = useState("");
    const [hintNumber, setHintNumber] = useState(0);
    const [reloadSkin, setReloadSkin] = useState(false);
    const [skinUrl, setSkinUrl] = useState("");
    const [errorNum, setErrorNum] = useState(0);
    const [score, setScore] = useState(0);
    const [highest, setHighest] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionsEnabled, setSuggestionsEnabled] = useState(false);

    useEffect(() => {
        initializeSkins();
        fetchSkin();
    }, [])

    if (!champ) return <p>Loading...</p>;

    async function initializeSkins() {
        try {
            await skinService.fetchAllSkins();
        } catch (error) {
            console.error('Error initializing skins:', error);
        }
    }

    function filterSuggestions(input) {
        if (!input.trim() || !suggestionsEnabled) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = skinService.filterSuggestions(input, 10);
        setSuggestions(filtered);
        setShowSuggestions(true);
    }

    function handleInputChange(value) {
        setInputName(value);
        filterSuggestions(value);
    }

    function selectSuggestion(skinName) {
        setInputName(skinName);
        setShowSuggestions(false);
        setSuggestions([]);
    }

    function toggleSuggestions() {
        setSuggestionsEnabled(prev => !prev);
        if (suggestionsEnabled) {
            // If disabling, hide any current suggestions
            setShowSuggestions(false);
            setSuggestions([]);
        }
    }

    function fetchSkin() {
        fetch('https://ddragon.leagueoflegends.com/cdn/15.18.1/data/en_US/champion.json')
            .then(res => res.json())
            .then(data => {
                const allChamp = Object.values(data.data); // et dona un array de tots els champs
                const champSelected = allChamp[Math.floor(Math.random() * allChamp.length)]; // un element/champ random del array
                return fetch(`https://ddragon.leagueoflegends.com/cdn/15.18.1/data/en_US/champion/${champSelected.id}.json`) // fetch al champ especific
            })
            .then(res => res.json())
            .then(data => {
                const champData = Object.values(data.data)[0]; // et retorna un array amb el champ (array 0 -> "Ahri")
                const noBaseSkin = champData.skins.filter(skin => skin.num !== 0);
                const randomSkin = noBaseSkin[Math.floor(Math.random() * noBaseSkin.length)]
                setChamp(champData);
                setSkinName(randomSkin.name)
                setSkinUrl(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champData.id}_${randomSkin.num}.jpg`)
            });
    }

    function changeSkin(change) {
        setReloadSkin(prevState => !prevState);
        {
            fetchSkin()
        }
        setHintNumber(0)
        setErrorNum(0)
        setGuessValue("")
        setScore(change)
        setInputName("")
        setShowSuggestions(false)
        setSuggestions([])
    }

    function retry(change) {
        if (score > highest) {
            setHighest(score)
        }
        setReloadSkin(prevState => !prevState);
        {
            fetchSkin()
        }
        setHintNumber(0)
        setErrorNum(0)
        setGuessValue("")
        setScore(change)
        setInputName("")
        setShowSuggestions(false)
        setSuggestions([])
    }

    function guessChamp(e) {
        if (e.toLowerCase() === skinName.toLowerCase()) {
            setGuessValue(true)
            setScore(prevCount => prevCount + 1)
        } else {
            setGuessValue(false);
            setErrorNum(prevCount => prevCount + 1)
            if (errorNum > 5) {
                setErrorNum(0)
                if (score > highest) {
                    setHighest(score)
                }
            }
        }
    }

    function showHint() {
        setHintNumber(prevNum => {
            const next = prevNum + 1;
            return prevNum > 3 ? 1 : next;
        });
    }

    function skinHint() {
        const words = skinName.split(" ");
        const halfLength = Math.ceil(skinName.length / 4);

        if (words.length >= 3) {
            if (words[0] === "Prestige" && words.length === 3) {
                return `Prestige ${words[1].slice(0, 3)}... ${champ.name}`;
            } else if (words[0] === "Prestige" && words.length > 3) {
                return `${words.slice(0, 2).join(" ")}... ${champ.name}`;
            } else if (words[1] === champ.name.split(" ")[0]) {
                return `${skinName.slice(0, halfLength)}... ${champ.name}`;
            } else if (words[3] === champ.name.split(" ")[0]) {
                return `${words.slice(0, 2).join(" ")}... ${champ.name}`;
            } else {
                return `${words[0]}... ${champ.name}`
            }
        } else if (words.length === 2) {
            return `${skinName.slice(0, halfLength)}... ${champ.name}`;
        } else {
            return `${skinName.slice(0, halfLength)}...`
        }
    }

// ex: https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg

    return (<div className="flex flex-col items-center">
            <div className={"flex flex-row gap-3"}>
                <h2>Highest Score: {highest}</h2><h2>Score: {score}</h2>
            </div>
            <div className="flex flex-col items-center mt-4">
                <div className="relative w-1/2 overflow-hidden rounded-md">
                    <img
                        src={skinUrl}
                        alt={champ.name}
                        className={`
                            ${errorNum === 0 ? "w-full scale-[3] object-cover object-center rotate-45" : ""}
                            ${errorNum === 1 ? "w-full scale-[1.5] object-cover object-center rotate-12" : ""}
                            ${errorNum === 2 ? "w-full scale-[1] object-cover object-center" : ""}
                            ${errorNum === 3 ? "w-full scale-[1] object-cover object-center" : ""}
                        `}
                    />

                    <div className={`
                            ${errorNum === 0 ? "absolute inset-0 grayscale backdrop-blur-sm rounded-md border-[3px]" : ""}
                            ${errorNum === 1 ? "absolute inset-0 grayscale-[0.5] backdrop-blur-sm rounded-md border-[3px]" : ""}
                            ${errorNum === 2 ? "absolute inset-0 grayscale rounded-md border-[3px]" : ""}
                            ${errorNum === 3 ? "absolute inset-0 rounded-md border-[3px]" : ""}
                        `}>
                    </div>
                </div>
            </div>

            <div className={"mt-5 flex flex-col items-center relative"}>
                <input 
                    type={"text"} 
                    placeholder={"e.g. Star Guardian Rell"} 
                    value={inputName}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => suggestionsEnabled && filterSuggestions(inputName)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className={"bg-white text-black rounded-md text-lg p-2 w-[610px] max-w-[60%]"}
                />
                {showSuggestions && suggestions.length > 0 && suggestionsEnabled && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-[610px] max-w-[60%] bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-32 sm:max-h-40 md:max-h-48 overflow-y-auto">
                        {suggestions.map((skin, index) => (
                            <div
                                key={index}
                                className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-black border-b border-gray-200 last:border-b-0"
                                onMouseDown={() => selectSuggestion(skin.name)}
                            >
                                <div className="font-medium text-sm">{skin.name}</div>
                                <div className="text-xs text-gray-600">{skin.championName}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div>
                <button className={"mt-5 mr-2 border-2 border-white"} onClick={showHint}>Hint
                </button>
                <button 
                    className={`mt-5 mr-2 px-3 py-2 rounded border-2 font-medium ${
                        suggestionsEnabled 
                            ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                            : 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                    }`}
                    onClick={toggleSuggestions}
                    title={suggestionsEnabled ? "Disable suggestions" : "Enable suggestions"}
                >
                    {suggestionsEnabled ? "Suggestions ON" : "Suggestions OFF"}
                </button>
                <button className={"mt-5 bg-white text-black"} type={"submit"}
                        onClick={() => guessChamp(inputName)}>Submit
                </button>
                <button className={"ml-2 pr-2 pl-2 pb-2 bg-white text-black"} onClick={() => retry(0)}><ReplayIcon/>
                </button>
            </div>
            <h2 className={"mt-5"}>Number of tries remaining: {3-errorNum}</h2>
            {guessValue && <div className={"flex flex-col items-center"}>
                <h1 className={"mt-5 mb-2 text-l font-bold text-blue-500"}>Well done!</h1>
                <h2>{skinName}</h2>
                <button className={"bg-white font-bold text-black mt-3 mb-3"} onClick={() => changeSkin(score)}>Next
                    champion
                </button>
                <hr className="w-full h-px my-3 bg-gray-200 border-0 dark:bg-white"/>
            </div>}
            {guessValue === false && <div className={"flex flex-col items-center"}>
                <h1 className={"mt-5 text-l font-bold text-red-600"}>Try again!</h1>
                {errorNum >= 3 && <div className={"flex flex-col items-center"}>
                    <h2 className={"mt-5 font-bold"}>Or not.</h2>
                    <h2>{skinName}</h2>
                    <button className={"bg-white font-bold text-black mt-3 mb-3"} onClick={() => retry(0)}>Start Over
                    </button>
                    <hr className="w-full h-px my-3 bg-gray-200 border-0 dark:bg-white"/>
                </div>}
            </div>}
            {hintNumber === 1 && skinName.split(" ").length === 1 ? <h2 className={"mt-5"}><strong>Hint 1:</strong> ({champ.name}) </h2> : ""}
            {hintNumber === 1 && skinName.split(" ").length !== 1 ? <h2 className={"mt-5"}><strong>Hint 1:</strong> {champ.name} </h2> : ""}
            {hintNumber === 2 && skinName.split(" ").length === 1 ? <h2 className={"mt-5"}><strong>Hint 2:</strong> {skinName.slice(0, 2)}... ({champ.name})</h2> : ""}
            {hintNumber === 2 && skinName.split(" ").length !== 1 ? <h2 className={"mt-5"}><strong>Hint 2:</strong> {skinName.slice(0, 2)}... {champ.name}</h2> : ""}
            {hintNumber === 3 && <h2 className={"mt-5"}><strong>Hint 3:</strong> {skinHint()}</h2>}
        </div>

    )
}