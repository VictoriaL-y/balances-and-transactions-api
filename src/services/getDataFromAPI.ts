export async function getDataFromAPI(url: string, apiKey: string) {
try {
  const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey
      }
    })
    if (!response.ok) {
      console.log("Couldn't get data from Banxware API");
        return {
          data: {
          message: "Couldn't get data from Banxware API",
          error: response.statusText
        },
        isSuccesfull: false
      }
    }
    const data = await response.json();
    console.log("Succesfully got data from Banxware API");
    return {
      data: data,
      isSuccesfull: true
    };
  } catch (err) {
    console.log("Couldn't get data from Banxware API, the error is " + err);
    return {
      data: {
        message: "Couldn't get data from Banxware API",
        error: err
      },
      isSuccesfull: false
    }
  
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