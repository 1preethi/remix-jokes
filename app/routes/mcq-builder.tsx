import Select from 'react-select';
import { useEffect, useState } from 'react';
import McqPoolBuilder from '../components/mcqPoolBuilder'
import McqNonPoolBuilder from '~/components/mcqNonPoolBuilder';

import stylesUrl from "~/styles/mcq-builder.css";
import { LinksFunction } from '@remix-run/node';

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: stylesUrl }];
};

const poolTypesArray = [{ "value": "POOL", "label": "Pool" },
{ "value": "NON_POOL", "label": "Non Pool" }]

export default function McqBuilder() {
    const [poolType, setPoolType] = useState(poolTypesArray[0])
    const [pyodideInstance, setPyodideInstance] = useState()

    useEffect(() => {
        async function createAndReturnPyodideInstance() {
            let pyodide = await loadPyodide();
            return pyodide;
        }
        const instance = createAndReturnPyodideInstance()
        setPyodideInstance(instance)
    }, [])

    const onChangePoolType = (selectedOption) => {
        setPoolType(selectedOption)
    }

    return (
        <div className="responsive-container">
            <p className='app-heading'>
                MCQ Builder
            </p>
            <Select
                value={poolType}
                onChange={onChangePoolType}
                options={poolTypesArray}
                placeholder="Type of MCQ Builder"
                isMulti={false}
                className="react-select"
            />
            {poolType.value === poolTypesArray[0].value ? <McqPoolBuilder pyodideInstance={pyodideInstance} /> : <McqNonPoolBuilder pyodideInstance={pyodideInstance} />}
        </div>
    );
}