import { useEffect } from "react";
import { useState } from "react"

//hook que se encargue de realizar cualquier peticion a una API
export const useFetch = (fetchFunction, dependencies) => {
    //estado para guardar la data
    const [data, setData] = useState(null);

    //estado para guardar el loading
    const [loading, setLoading] = useState(true);
    
    const [error, setError] = useState(null);

    //estado para guardar el error
    const fetchData = async () => {
        try {
             //funcion que hace la peticion a la api
            const result = await fetchFunction();
            setData(result);
        } catch (error) {
            setError(error);
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
     //creo un objeto para abortar la peticion
      const abortController = new AbortController();
      setLoading(true);
      fetchData();
      return () => {
        //cuando desmonto el componente aborto la peiticion
        abortController.abort(); //deshace la funcion
      }
    }, dependencies); //se ejecuta cuando se renderiza por primera vez
    
    return { data, loading, error };
    
}

