const req = require('request');
const hubspotController = require('./../controllers/hubspot.controller');
const querystring = require('querystring');
const url_jasmin = 'https://my.jasminsoftware.com/api/252011/252011-0001/';

function insertClient(email, access_token, callback) {
    hubspotController.getClientByEmail(email, (res1) => {
        if (res1.user) {
            const json = {
                "name": res1.user.nome,
                "electronicMail": res1.user.email,
                "companyTaxID": res1.user.nif,
                "isExternallyManaged": false,
                "currency": "EUR",
                "isPerson": true,
                "country": "PT"
            };

            let options = {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': JSON.stringify(json).length
                },
                url: `${url_jasmin}salescore/customerParties`,
                body: JSON.stringify(json)
            }

            req.post(options, (err, res) => {
                if (!err && res.statusCode == 201) {
                    const record_id = JSON.parse(res.body);

                    options = {
                        headers: {
                            'Authorization': `Bearer ${access_token}`
                        },
                        url: `${url_jasmin}salescore/customerParties/${record_id}`
                    }
                    req.get(options, (err, res) => {
                        if (!err && res.statusCode == 200) {
                            callback({
                                'statusCode': res.statusCode,
                                'body': {
                                    customer_id: JSON.parse(res.body)
                                }
                            })
                        } else {
                            callback({
                                'statusCode': res.statusCode,
                                'body': res.body
                            })
                        }
                    })
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': res.body
                    })
                }
            })
        }
    })
}

function checkUser(email, access_token, callback) {

    hubspotController.getClientByEmail(email, (res1) => {
        if (res1.user) {

            let options = {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
                url: `${url_jasmin}salesCore/customerParties/odata?$filter=CompanyTaxID eq '${res1.user.nif}'`
            }

            req.get(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    const items = JSON.parse(res.body).items;
                    callback({
                        'statusCode': res.statusCode,
                        'body': items
                    })
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': res.body
                    })
                }
            })
        }
    })
}

function getTypeInvoice(callback) {
    getToken((res) => {
        if (res.access_token) {
            const access_token = res.access_token;

            let options = {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                },
                url: `${url_jasmin}salesCore/invoiceTypes`
            }
            req.get(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    let response = JSON.parse(res.body);
                    let invoiceType;
                    for (let j = 0; j < response.length; j++) {
                        if (response[j].company == 'RUM' && response[j].typeKey == 'FR') {
                            invoiceType = response[j];
                        }
                    }
                    callback({
                        'invoiceType': invoiceType.documentTypeSeries[0],
                        'access_token': access_token
                    });
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': JSON.parse(res.body)
                    });
                }
            })
        }
    })
}

function getProducts(access_token, callback) {
    
    let options = {
        headers: {
            'Authorization': `Bearer ${access_token}`
        },
        url: `${url_jasmin}salesCore/salesItems`
    }
    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            let response = JSON.parse(res.body);
            callback({
                'products': response
            });
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            });
        }
    })
}

function getToken(callback) {
    let json = querystring.stringify({
        client_id: 'RefeicoesUM',
        client_secret: '08a5e620-4ee9-4f50-9844-6db4a2ef48bf',
        grant_type: 'client_credentials',
        scope: 'application'
    });

    let options = {
        headers: {
            'Content-Length': json.length,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: `https://identity.primaverabss.com/core/connect/token`,
        body: json
    }
    req.post(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            callback({
                'access_token': JSON.parse(res.body).access_token
            });
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            });
        }
    })
}

function acertoStock(idProduto, access_token, callback){
    const id = idProduto;
    const data = new Date();
    const ano = data.getFullYear();
    const mes = data.getMonth() + 1;
    const dia = data.getDate();
    const hora = data.getHours();
    const min = data.getMinutes();
    const sec = data.getSeconds();
    const itemAdjustmentKey = ano + "_" + mes + "_" + dia + "_" + hora + "_" + min + "_" + sec;
    const documentDate = new Date().toISOString();
    const postingDate = new Date().toISOString();
    const warehouse = '01';
    const company = 'RUM';
    const adjustmentReason = '10';

    let numeroSenhas;
    if(id == 'PACKSENHAS'){
        numeroSenhas = 10;
    } else{
        numeroSenhas = 1;
    }

    let documentLines = [{
        'quantity' : numeroSenhas,
        'unitPrice': 2.50,
        'unit': 'UN',
        'materialsItem': 'SENHASDISPONIVEIS'
    }]

    let json = {
        'itemAdjustmentKey': itemAdjustmentKey,
        'documentDate': documentDate,
        'postingDate': postingDate,
        'warehouse': warehouse,
        'company': company,
        'adjustmentReason': adjustmentReason,
        'documentLines': documentLines
    }
    
    let options = {
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': JSON.stringify(json).length
        },
        url: `${url_jasmin}materialsManagement/itemAdjustments`,
        body: JSON.stringify(json)
    }

    req.post(options, (err, res) => {
        if (!err && res.statusCode == 201) {
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

}

module.exports = {
    insertClient:insertClient,
    checkUser: checkUser,
    getTypeInvoice: getTypeInvoice,
    getProducts: getProducts,
    acertoStock: acertoStock,
    getToken: getToken
};