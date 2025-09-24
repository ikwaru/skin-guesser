import React, {useEffect, useState} from "react";
import ReplayIcon from '@mui/icons-material/Replay';

export default function ImageComponent() {

    const [skinNum, setSkinNum] = useState(0)
    const [champ, setChamp] = useState(null);
    const [skinName, setSkinName] = useState("");
    const [inputName, setInputName] = useState("");
    const [guessValue, setGuessValue] = useState("");
    const [hintNumber, setHintNumber] = useState(0);

    useEffect(() => {
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
                const randomIndex = Math.floor(Math.random() * champData.skins.length+1)
                setChamp(champData);
                setSkinNum(randomIndex)
                setSkinName(champData.skins[randomIndex].name)
            });

    }, [])

    if (!champ) return <p>Loading...</p>;

    function changeSkin() {
        console.log(champ);
    }

    function guessChamp(e) {
        if (e.toLowerCase() === skinName.toLowerCase()) {
            setGuessValue(true)
        } else {
            setGuessValue(false);
        }
    }

    function hint() {
        setHintNumber(prevNum => {
            const next = prevNum + 1;
        return prevNum > 3 ? 1 : next;
        }
        );

    }

    function skinHint() {
        const words = skinName.split(" ");
        if (words.length > 5) {
            return words[0];
        } else {
            const halfLength = Math.ceil(skinName.length / 4);
            return skinName.slice(0, halfLength);
        }
    }


// ex: https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg
    const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_${champ.skins[skinNum].num}.jpg`;

    return (<div className="flex flex-col items-center">
            <img src={splashUrl} alt={champ.name} className="mt-4 w-1/2 rounded-md"/>
            <div className={"mt-5"}>
                <input type={"text"} placeholder={"e.g. Star Guardian Rell"} value={inputName}
                       onChange={(e) => setInputName(e.target.value)}
                       className={"bg-white text-black rounded-md text-lg p-2 w-[610px]"}/>
            </div>
            <div>
                <button className={"mt-5 mr-2 border-2 border-white"} onClick={hint}>Hint
                </button>
                <button className={"mt-5 bg-white text-black"} type={"submit"}
                        onClick={() => guessChamp(inputName)}>Submit
                </button>
                <button className={"ml-2 pr-2 pl-2 bg-white text-black"} onClick={() => {
                }}><ReplayIcon/>
                </button>
            </div>
            {guessValue && <div className={"flex flex-col items-center"}>
                <h1 className={"mt-5 mb-2 text-l font-bold text-blue-500"}>Well done!</h1>
                <h2>{skinName}</h2>
                <hr className="w-full h-px my-3 bg-gray-200 border-0 dark:bg-white"/>
            </div>}
            {guessValue === false && <h1 className={"mt-5 text-l font-bold text-red-600"}>Try again!</h1>}
            {hintNumber === 1 && <h2 className={"mt-5 mb-5"}>Hint 1: {champ.name}</h2>}
            {hintNumber === 2 && <h2 className={"mt-5 mb-5"}>Hint 2: {skinName.slice(0,2)}... {champ.name}</h2>}
            {hintNumber === 3 && <h2 className={"mt-5 mb-5"}>Hint 3: {skinHint()}... {champ.name}</h2>}
        </div>

    )
}