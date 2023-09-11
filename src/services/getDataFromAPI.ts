export async function getDataFromAPI(url: string, apiKey: string) {
try {
  const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey
      }
    })
    if (!response.ok) {
      console.log("couldn't get data from Banxware API");
      return ({
        message: "Couldn't get data from Banxware API",
        error: response.statusText
      })
    }
    const data = await response.json();
    console.log("succesfully got data from Banxware API");
    return data;
  } catch (err) {
    console.error(err);
    return ({
      message: "Couldn't get data from Banxware API",
      error: err
    })
  }
}


// export function getBalances<T>(url: string, apiKey: string): Promise<T> {
//     return fetch(url, {
//         method: "GET",
//         headers: {
//           "x-api-key": apiKey
//         }
//       })
//         .then(response => {
//           console.log(response)
//           if (!response.ok) {
//             throw new Error(response.statusText)
//           }
    
//           return response.json() as Promise<{ data: T }>
//         })
//         .then(data => {
//             console.log(data)
//             return data.data
//         })
//   }