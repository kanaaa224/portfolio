//import WebAPIClient from 'https://cdn.jsdelivr.net/gh/kanaaa224/home-server-web-api@master/dist/web-api-client.esm.min.js';

//export const main = new WebAPIClient('https://cdn.jsdelivr.net/gh/kanaaa224/home-server-web-api@master/dist/endpoints.json', 'v1');

export const call = async (endpoint = '', queries = {}, requestBody = null) => {
    const url = new URL(endpoint);

    for(const [ key, value ] of Object.entries(queries)) url.searchParams.set(key, value);

    let request = { method: 'GET' };

    if(requestBody) request = { method: 'POST', body: JSON.stringify(requestBody) };

    const response = await fetch(url.toString(), request);
    const body     = await response.json();

    if(!response.ok) throw new Error(`api-bad-status: ${response.status}`);

    return body;
};