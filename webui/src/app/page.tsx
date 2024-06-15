'use client'

import { useEffect } from "react";

const Root = () => {
    useEffect(() => {
        console.log("123")
    }, [])

    return(
        <div>
            Root
        </div>
    )
};

export default Root;
