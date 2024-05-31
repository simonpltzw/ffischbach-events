'use client'

import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react"

const Callback: FC<any> = (props: any) => {   
    const isAuthenticated = useIsAuthenticated()
    const router = useRouter()
    const pathName = usePathname()
    const {instance, accounts} = useMsal()

    const [u, setU] = useState("BBB")
    console.log(isAuthenticated)
    useEffect(() => {
      if (accounts.length) {
        console.log("pathname", pathName)
        setU("AAAAA")
        router.push("/dashboard");
      } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);
  
    return <>{u}</>;
  };
  
  export default Callback;
  