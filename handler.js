'use strict'

const AWS = require('aws-sdk')
const docDynamo = new AWS.DynamoDB.DocumentClient()

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD, OPTIONS'
}

/**
 * Servicio que crea un cliente
 */
module.exports.create = async (event, context) => {  
  try {
    let clienteRq = JSON.parse(event.body)
    let params = {
      TableName: 'nequi-cliente',
      Item: {
        id: `${clienteRq.idTipo}-${clienteRq.idNumero}`,
        edad: clienteRq.edad,
        nombre: clienteRq.nombre,
        apellido: clienteRq.apellido,
        ciudadNacimiento: clienteRq.ciudadNacimiento
      }
    }
    await put(params)
    return sendResponse(201, { message: "Creado Correctamente" }, headers)
  }
  catch (e) {
    console.error(e)
    return sendResponse(500, {message: `Internal server error: ${e}` }, headers)    
  }
}

const put = (params) => {
  return docDynamo.put(params).promise()
}

// metodos de respuesta
const sendResponse = (statusCode, body, headers = '') => {
  const response = {
    statusCode: statusCode,
    headers: headers,
    body: JSON.stringify(body)
  }
  return response
}
