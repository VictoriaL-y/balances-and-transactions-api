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
            status: 502,
            message: "Couldn't get data from Banxware API",
            error: response.statusText
        },
        isSuccesfull: false
      }
    }
    const data = await response.json();
    console.log("Succesfully got data from Banxware API " + url.split("/").pop());
    return {
      data: {
        status: 200,
      },
      dataFromAPI: data,
      isSuccesfull: true
    };
  } catch (err) {
    console.log("Couldn't get data from Banxware API, the error is " + err);
    return {
      data: {
        status: 502,
        message: "Couldn't get data from Banxware API",
        error: err
      },
      isSuccesfull: false
    }
  }
}