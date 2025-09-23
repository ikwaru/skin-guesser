import React from "react";
import { useState, useEffect } from 'react'
import ReplayIcon from '@mui/icons-material/Replay';

export default function ImageComponent() {

const [skinNum, setSkinNum] = useState(0)
const [champ, setChamp] = useState(null)

useEffect(() => {
    fetch('https://ddragon.leagueoflegends.com/cdn/15.18.1/data/en_US/champion.json')
        .then(res => res.json())
        .then(data => {
            const allChamp = Object.values(data.data);
            const champSelected = allChamp[Math.floor(Math.random() * allChamp.length)];
            return fetch(`https://ddragon.leagueoflegends.com/cdn/15.18.1/data/en_US/champion/${champSelected.id}.json`)
        })
        .then(res => res.json())
        .then(data => {
            const champData = Object.values(data.data)[0];
            setChamp(champData);
            setSkinNum(Math.floor(Math.random() * champData.skins.length))});
}, [])

if (!champ) return <p>Loading...</p>;


// ex: https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg
const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_${champ.skins[skinNum].num}.jpg`

    return (

        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold">{champ.name}</h1>
            <img src={splashUrl} alt={champ.name} className="mt-4 w-1/2 rounded-md" />
            <div className={"mt-5"}>
                <input type={"text"} placeholder={"e.g. Star Guardian Rell"}
                       className={"bg-white text-black rounded-md text-lg p-2 w-[610px]"}/>
            </div>
            <div >
                <button className={"mt-5 mr-2"} onClick={() => {
                }}>Hint
                </button>
                <button className={"mt-5 bg-white text-black"} onClick={() => {
                }}>Submit
                </button>
                <button className={"ml-2 pr-2 pl-2 bg-white text-black"} onClick={() => {
                }}><ReplayIcon/>
                </button>
            </div>
        </div>

    )
}