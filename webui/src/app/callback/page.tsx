'use client'

import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react"

const Callback: FC<any> = (props: any) => {   
    const isAuthenticated = useIsAuthenticated()
    const router = useRouter()
    const pathName = usePathname()
    const {instance, accounts} = useMsal()


    
    useEffect(() => {
      console.log(isAuthenticated)
      if (accounts.length && isAuthenticated) {
        //router.push("/dashboard");
      } 
    }, [isAuthenticated]);
  
    return <></>;
  };
  
  export default Callback;
  