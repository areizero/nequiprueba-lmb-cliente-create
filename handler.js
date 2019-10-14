'use strict'

const AWS = require('aws-sdk')
const docDynamo = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({})

const tableName = 'nequi-cliente'

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
    let s3File = await uploadImage(`${clienteRq.idTipo}-${clienteRq.idNumero}`, clienteRq.imagenPerfil)
    let params = {
      TableName: tableName,
      Item: {
        id: `${clienteRq.idTipo}-${clienteRq.idNumero}`,
        edad: clienteRq.edad,
        nombre: clienteRq.nombre,
        apellido: clienteRq.apellido,
        ciudadNacimiento: clienteRq.ciudadNacimiento,
        imagenPerfil: s3File.Location
      }
    }
    await put(params)    
    return sendResponse(201, { message: "Creado Correctamente" }, headers)
  }
  catch (e) {
    console.error(e)
    return sendResponse(500, { message: `Internal server error: ${e}` }, headers)
  }
}

const put = (params) => {
  return docDynamo.put(params).promise()
}

const uploadImage = (id, imagenPerfil) => {
  const base64Data = new Buffer.from(imagenPerfil.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  const type = imagenPerfil.split(';')[0].split('/')[1]
  const params = {
    Bucket: 'nequiprueba-clientes-perfil',
    Key: `${id}.${type}`,
    Body: base64Data,
    ContentEncoding: 'base64',
    ContentType: `image/${type}`
  }
  return s3.upload(params).promise()
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
