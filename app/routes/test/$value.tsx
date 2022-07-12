import { useOutletContext } from "react-router-dom";

//import { useParams } from "@remix-run/react";

export default function Value() {

    const [value, value2] = useOutletContext();


    // const {value} = useParams()

    console.log(value, 'value')
    console.log(value2, 'value2')

    return (
        <>
            <p>Value Componenet1: {value}</p>
            <p>Value Componenet2: {value2}</p>
        </>
    );
}