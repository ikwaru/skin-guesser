import React, {useEffect, useState} from "react";
import ReplayIcon from '@mui/icons-material/Replay';

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

    useEffect(() => {
        {
            fetchSkin()
        }
    }, [])

    if (!champ) return <p>Loading...</p>;

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
    }

    function retry(change){
        if(score > highest){
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
    }

    function guessChamp(e) {
        if (e.toLowerCase() === skinName.toLowerCase()) {
            setGuessValue(true)
            setScore(prevCount => prevCount + 1)
        } else {
            setGuessValue(false);
            setErrorNum(prevCount => prevCount + 1)
            if(errorNum > 4){
                setErrorNum(0)
                if(score > highest){
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
            if(words[0] === "Prestige" && words.length === 3){
                return `Prestige ${words[1].slice(0,3)}`;
            } else if (words[0] === "Prestige" && words.length > 3){
                return words.slice(0, 2).join(" ");
            } else if(words[1] === champ.name.split("")[0]) {
                return skinName.slice(0, halfLength);
            } else {
                return words[0]
            }
        } else if (words.length === 2) {
            return "seguir"
        } else {
            return skinName.slice(0, halfLength);
        }
    }

// ex: https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg

    return (<div className="flex flex-col items-center">
            <div className={"flex flex-row gap-3"}>
                <h2>Highest Score: {highest}</h2><h2>Score: {score}</h2>
            </div>
            <img src={skinUrl} alt={champ.name} className="mt-4 w-1/2 rounded-md"/>
            <div className={"mt-5"}>
                <input type={"text"} placeholder={"e.g. Star Guardian Rell"} value={inputName}
                       onChange={(e) => setInputName(e.target.value)}
                       className={"bg-white text-black rounded-md text-lg p-2 w-[610px]"}/>
            </div>
            <div>
                <button className={"mt-5 mr-2 border-2 border-white"} onClick={showHint}>Hint
                </button>
                <button className={"mt-5 bg-white text-black"} type={"submit"}
                        onClick={() => guessChamp(inputName)}>Submit
                </button>
                <button className={"ml-2 pr-2 pl-2 pb-2 bg-white text-black"} onClick={() => retry(0)}><ReplayIcon/>
                </button>
            </div>
            {guessValue && <div className={"flex flex-col items-center"}>
                <h1 className={"mt-5 mb-2 text-l font-bold text-blue-500"}>Well done!</h1>
                <h2>{skinName}</h2>
                <button className={"bg-white font-bold text-black mt-3 mb-3"} onClick={() => changeSkin(score)}>Next champion</button>
                <hr className="w-full h-px my-3 bg-gray-200 border-0 dark:bg-white"/>
            </div>}
            {guessValue === false && <div className={"flex flex-col items-center"}>
                <h1 className={"mt-5 text-l font-bold text-red-600"}>Try again!</h1>
                {errorNum >= 3 && <div className={"flex flex-col items-center"}>
                    <h2 className={"mt-5 font-bold"}>Or not.</h2>
                    <h2>{skinName}</h2>
                    <button className={"bg-white font-bold text-black mt-3 mb-3"} onClick={() => changeSkin(0)}>Start Over</button>
                    <hr className="w-full h-px my-3 bg-gray-200 border-0 dark:bg-white"/>
                </div>}
            </div>}
            {hintNumber === 1 && <h2 className={"mt-5"}><strong>Hint 1:</strong> {champ.name}</h2>}
            {hintNumber === 2 && <h2 className={"mt-5"}><strong>Hint 2:</strong> {skinName.slice(0, 2)}... {champ.name}</h2>}
            {hintNumber === 3 && <h2 className={"mt-5"}><strong>Hint 3:</strong> {skinHint()}... {champ.name}</h2>}
        </div>

    )
}