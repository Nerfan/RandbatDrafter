import { useState, useEffect } from 'react'
import './App.css'
import TextInput from 'react-autocomplete-input';

const getData = async () => {
        const dataURL = "https://play.pkmn.cc/data/random/gen9randombattle.json";
        try {
            const response = await fetch(dataURL);
            const json = await response.json();
            return json;
        } catch (error) {
            console.error(error.message);
        }
}

const getWeightedValue = (values, totalWeight = 1) => {
    const roll = Math.random();
    let cumulativeWeight = 0;
    let selected = null;
    Object.entries(values).forEach(([item, weight]) => {
        cumulativeWeight += weight;
        if ( roll <= cumulativeWeight && !selected ) {
            selected = item;
        }
    });
    return selected;
}

const getMoves = (moves) => {
    const selectedMoves = [];
    const remainingMoves = {};
    let totalWeight = 0;
    Object.entries(moves).forEach(([move, weight]) => {
        if ( weight === 1 ) {
            selectedMoves.push(move);
        } else {
            remainingMoves[move] = weight;
            totalWeight += weight;
        }
    });
    while ( selectedMoves.length < 4 ) {
        const nextMove = getWeightedValue(remainingMoves, totalWeight);
        totalWeight -= remainingMoves[nextMove];
        delete remainingMoves[nextMove];
        selectedMoves.push(nextMove);
    }
    return selectedMoves;
}

const getRandomSet = (data, selectedName) => {
    const mon = data?.[selectedName];
    if ( !mon ) {
        return null;
    }
    const level = mon.level;
    const roles = mon.roles;
    const setRoll = Math.random();
    let totalWeight = 0;
    let roleName = "";
    let selectedSet = null;
    Object.entries(roles).forEach(([name, set]) => {
        totalWeight += set.weight;
        if ( setRoll <= totalWeight && !selectedSet ) {
            selectedSet = set;
            roleName = name;
        }
    });

    if ( !selectedSet ) {
        return null;
    }

    const ability = getWeightedValue(selectedSet.abilities);
    const item = getWeightedValue(selectedSet.items);
    const tera = getWeightedValue(selectedSet.teraTypes);
    const evs = {
        hp: 85,
        atk: 85,
        def: 85,
        spa: 85,
        spd: 85,
        spe: 85,
        ... selectedSet.evs,
    }
    const ivs = {
        hp: 31,
        atk: 31,
        def: 31,
        spa: 31,
        spd: 31,
        spe: 31,
        ... selectedSet.ivs,
    }
    const moves = getMoves(selectedSet.moves);

    return {
        name: roleName,
        level,
        ability,
        item,
        tera,
        evs,
        ivs,
        moves,
    };
}

function App() {
    const [data, setData] = useState({});
    const [names, setNames] = useState([]);
    const [selected, setSelected] = useState("");
    const [doCalc, setDoCalc] = useState(false);
    const [calculatedSet, setCalculatedSet] = useState(null);

    useEffect(() => {
        getData().then((data) => {
            setData(data);
            setNames(Object.keys(data));
        });
    }, []);

    useEffect(() => {
        if ( doCalc ) {
            setCalculatedSet(getRandomSet(data, selected));
            setDoCalc(false);
        }
    }, [doCalc, setDoCalc, data, selected]);

    return (
        <>
            <h1>Pokemon Set Randomizer</h1>
            <div className="card">
                <TextInput options={names} trigger="" onSelect={setSelected} spacer="" Component="input" />
            </div>
            <div className="card">
                <button onClick={() => {
                    setDoCalc(true);
                }}>
                    Get Random Set!
                </button>
            </div>
            {calculatedSet && <div className="card">
                {/*
                <div>Set Name: {calculatedSet.name}</div>
                <div>Level: {calculatedSet.level}</div>
                <div>Ability: {calculatedSet.ability}</div>
                <div>Item: {calculatedSet.item}</div>
                <div>Tera Type: {calculatedSet.tera}</div>
                <div>EVs: {calculatedSet.evs.hp}/{calculatedSet.evs.atk}/{calculatedSet.evs.def}/{calculatedSet.evs.spa}/{calculatedSet.evs.spd}/{calculatedSet.evs.spe}</div>
                <div>IVs: {calculatedSet.ivs.hp}/{calculatedSet.ivs.atk}/{calculatedSet.ivs.def}/{calculatedSet.ivs.spa}/{calculatedSet.ivs.spd}/{calculatedSet.ivs.spe}</div>
                <div>Moves:</div>
                {calculatedSet.moves.map((move) => <div key={move}>{move}</div>)}
                */}
                <div>Set Name: {calculatedSet.name}</div>
                <div className="poke-paste">
                    <div>{`${selected} @ ${calculatedSet.item}`}</div>
                    <div>{`Ability: ${calculatedSet.ability}`}</div>
                    <div>{`Tera Type: ${calculatedSet.tera}`}</div>
                    <div>
                        {`EVs: `}
                        {`${calculatedSet.evs.hp} HP / `}
                        {`${calculatedSet.evs.atk} Atk / `}
                        {`${calculatedSet.evs.def} Def / `}
                        {`${calculatedSet.evs.spa} SpA / `}
                        {`${calculatedSet.evs.spd} SpD / `}
                        {`${calculatedSet.evs.spe} Spe`}
                    </div>
                    <div>{`Serious Nature`}</div>
                    <div>
                        {`IVs: `}
                        {`${calculatedSet.ivs.hp} HP / `}
                        {`${calculatedSet.ivs.atk} Atk / `}
                        {`${calculatedSet.ivs.def} Def / `}
                        {`${calculatedSet.ivs.spa} SpA / `}
                        {`${calculatedSet.ivs.spd} SpD / `}
                        {`${calculatedSet.ivs.spe} Spe`}
                    </div>
                    <div>{calculatedSet.moves.map((move) => <div>{`- ${move}`}</div>)}</div>
                </div>
            </div>}
        </>
    )
}

export default App
