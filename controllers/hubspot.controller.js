const Hubspot = require('hubspot');
const req = require('request');
var sanitizer = require('sanitize')();
const ChaveApi = 'c2261c3d-aaa4-4684-917d-ea2dd1852309';

function createClient(request, response) {
    const firstname =  request.body.nome;
    const lastname = request.body.apelido;
    const username = request.body.username;
    const email = request.body.email;
    const numMec = request.body.numMec;
    const nif = request.body.nif;

    const properties = [{
        property: 'firstname',
        value: firstname
    }, {
        property: 'username',
        value: username
    }, {
        property: 'lastname',
        value: lastname
    }, {
        property: 'email',
        value: email
    }, {
        property: "nummecanografico",
        value: numMec

    }, {
        property: 'nif',
        value: nif
    }, {
        property: 'senhasTotal',
        value: 0
    }, {
        property: 'senhasDisponiveis',
        value: 0
    }, {
        property: 'senhasGastas',
        value: 0
    }];

    let json = {
        'properties': properties
    };
    
    console.log(json);

    let options = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        url: `https://api.hubapi.com/contacts/v1/contact/?hapikey=${ChaveApi}`,
        body: JSON.stringify(json)
    }

    req.post(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            return response.status(200).json({
                message: "success"
            });
        } else {
            return response.status(400).json({
                message: res.body
            });
        }
    })
}

function updateClient(email, senhasCompradas, callback) {

    let options = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        url: `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?hapikey=${ChaveApi}`,
        //body: JSON.stringify(json)
    }

    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            
            const body = JSON.parse(res.body).properties;
            let senhasTotal = parseInt(body.senhastotal.value);
            let senhasDisponiveis = parseInt(body.senhasdisponiveis.value);
            
            senhasTotal += senhasCompradas;
            senhasDisponiveis += senhasCompradas;

            const properties = [{
                property: 'senhasTotal',
                value: senhasTotal
            }, {
                property: 'senhasDisponiveis',
                value: senhasDisponiveis
            }];

            let json = {
                'properties': properties
            };

            let options1 = {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
            },
                url: `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?hapikey=${ChaveApi}`,
                body: JSON.stringify(json)
            }

            req.post(options1, (err1, res1) => {
                if (!err1 && res1.statusCode == 204) {
                    callback({
                        'statusCode': res.statusCode,
                        'body': "success"
                    });
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': JSON.parse(res.body)
                    });
                }
            })
        } else {
            return response.status(400).json({
                message: res.body
            });
        }
    })
}

function createTicket(request, response) {

    const assunto =  request.body.assunto;
    const descricao = request.body.descricao;
    const email = request.body.email;

    const properties = [{
        name: 'subject',
        value: assunto
    }, {
        name: 'content',
        value: descricao
    }, {
        name: 'hs_pipeline',
        value: '0'
    },{
        name: 'hs_pipeline_stage',
        value: '1'
      }];

    let options = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        url: `https://api.hubapi.com/crm-objects/v1/objects/tickets?hapikey=${ChaveApi}`,
        body: JSON.stringify(properties)
    }

    req.post(options, (err, res) => {
        if (!err && res.statusCode == 200) {

            const ticket = JSON.parse(res.body);
            const ticketID = ticket.objectId;

            let options0 = {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                url: `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?hapikey=${ChaveApi}`,
                //body: JSON.stringify(json)
            }
        
            req.get(options0, (err0, res0) => {
                if (!err0 && res0.statusCode == 200) {
                    
                    const client = JSON.parse(res0.body);
                    const id = client.vid;
        
                    //Contact to Ticket
                    const properties1 = {
                        'fromObjectId' : ticketID,
                        'toObjectId' : id,
                        'category' : 'HUBSPOT_DEFINED',
                        'definitionId': 16
                      };
                      
                    let options1 = {
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8'
                    },
                        url: `https://api.hubapi.com/crm-associations/v1/associations?hapikey=${ChaveApi}`,
                        body: JSON.stringify(properties1)
                    }
        
                    req.put(options1, (err1, res1) => {
                        if (!err1 && (res1.statusCode == 204)) {
                            return response.status(200).json({
                                message: "success"
                            });
                        } else {
                            return response.status(400).json({
                                message: res1
                            });
                        }
                    })
                } else {
                    return response.status(400).json({
                        message: res0.body
                    });
                }
            })
        } else {
            return response.status(400).json({
                message: res.body
            });
        }
    })
}

function gastarSenha(request, response) {
    const email = request.body.email;


    let options = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        url: `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?hapikey=${ChaveApi}`,
        //body: JSON.stringify(json)
    }

    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            
            const body = JSON.parse(res.body).properties;
            let senhasDisponiveis = parseInt(body.senhasdisponiveis.value);
            let senhasGastas = parseInt(body.senhasgastas.value);
            
            senhasGastas -= 1;
            senhasDisponiveis += senhasCompradas;

            const properties = [{
                property: 'senhasGastas',
                value: senhasGastas
            }, {
                property: 'senhasDisponiveis',
                value: senhasDisponiveis
            }];

            let json = {
                'properties': properties
            };

            let options1 = {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
            },
                url: `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?hapikey=${ChaveApi}`,
                body: JSON.stringify(json)
            }

            req.post(options1, (err1, res1) => {
                if (!err1 && res1.statusCode == 204) {
                    return response.status(200).json({
                        message: "success"
                    });
                } else {
                    return response.status(400).json({
                        message: res1.body
                    });
                }
            })
        } else {
            return response.status(400).json({
                message: res.body
            });
        }
    })
}

function getClientByEmail(email, callback) {

    let options = {
        url: `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?hapikey=${ChaveApi}`
    }
    req.get(options, (err, res) => {
        if (!err) {
            if (res.statusCode == 200) {
                let user = JSON.parse(res.body);
                let data = user.properties;

                const result = {
                    'nome': data.firstname.value + " " + data.lastname.value,
                    'email': data.email.value,
                    'nif': data.nif.value
                }
                callback({
                    'user': result
                });
            } else {
                callback({
                    'statusCode': res.statusCode,
                    'body': JSON.parse(res.body)
                })
            }
        } else {
            console.log(err);
            callback({
                'statusCode': 400,
                'body': 'erro'
            })
        }
    })
}



module.exports = {
    createClient: createClient,
    updateClient: updateClient,
    createTicket: createTicket,
    gastarSenha: gastarSenha,
    getClientByEmail: getClientByEmail
};