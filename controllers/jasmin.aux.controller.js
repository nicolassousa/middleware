const req = require('request');
const hubspotController = require('./../controllers/hubspot.controller');
const querystring = require('querystring');
const url_jasmin = 'https://my.jasminsoftware.com/api/253706/253706-0001/';
const nodemailer = require('nodemailer');

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
                                'body': JSON.parse(res.body)
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
        } else{
            callback({
                'statusCode': res.statusCode,
                'body': res.body
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

function acertoStock(idProduto, access_token, callback) {
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
    if (id == 'PACKSENHAS') {
        numeroSenhas = 10;
    } else {
        numeroSenhas = 1;
    }

    let documentLines = [{
        'quantity': numeroSenhas,
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

//Função utilizada para registar consumo de uma senha, adiçao ao inventario de senhas utilizadas e redução ao numero de senhas disponíveis
function registarConsumo(access_token, callback) {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = data.getMonth() + 1;
    const dia = data.getDate();
    const hora = data.getHours();
    const min = data.getMinutes();
    const sec = data.getSeconds();
    const milisec = data.getMilliseconds();
    const itemAdjustmentKey = mes + "_" + dia + "_" + hora + "_" + min + "_" + sec + "_" + milisec;
    const documentDate = new Date().toISOString();
    const postingDate = new Date().toISOString();
    const warehouse = '01';
    const company = 'RUM';
    const adjustmentReason = '01';

    let documentLines = [{
        'quantity': 1,
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
        const data = new Date();
        const ano = data.getFullYear();
        const mes = data.getMonth() + 1;
        const dia = data.getDate();
        const hora = data.getHours();
        const min = data.getMinutes();
        const sec = data.getSeconds();
        const milisec = data.getMilliseconds();
        const itemAdjustmentKey = mes + "_" + dia + "_" + hora + "_" + min + "_" + sec + "_" + milisec;
        const documentDate = new Date().toISOString();
        const postingDate = new Date().toISOString();
        const warehouse = '01';
        const company = 'RUM';
        const adjustmentReason = '10';

        let documentLines = [{
            'quantity': 1,
            'unitPrice': 2.50,
            'unit': 'UN',
            'materialsItem': 'SENHASGASTAS'
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

        console.log(json);

        let options = {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': JSON.stringify(json).length
            },
            url: `${url_jasmin}materialsManagement/itemAdjustments`,
            body: JSON.stringify(json)
        }

        console.log(options);

        req.post(options, (err, res) => {
            if (!err && res.statusCode == 201) {
                console.log(res.statusCode);
                console.log(res.body);
                callback({
                    'statusCode': res.statusCode,
                    'body': "success"
                });
            } else {
                console.log(res.statusCode);
                console.log(res.body);
                callback({
                    'statusCode': res.statusCode,
                    'body': JSON.parse(res.body)
                });
            }
        })
    })
}

function getPDFDocument(access_token, idFatura, callback) {

    const id = idFatura.replace(/['"]+/g, '');
    let options = {
        headers: {
            'Authorization': `Bearer ${access_token}`,
        },
        encoding: null,
        url: `${url_jasmin}/billing/invoices/${id}/printOriginal`
    }
    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            console.log(res.body);
            callback({
                'statusCode': res.statusCode,
                'body': res.body
            });
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            });
        }
    })
}

function sendPDF(email, pdf) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'refeicoesum@gmail.com',
            pass: 'miegsi2021'
        }
    });

    var data = new Date();
    var hora = data.getHours();
    let parteDoDia;

    if (hora >= 6 && hora <= 11) {
        parteDoDia = "Bom dia.";
    }
    if (hora >= 12 && hora <= 19) {
        parteDoDia = "Boa Tarde.";
    }
    if (hora >= 20 && hora <= 23 || (hora >= 0 && hora <= 5)) {
        parteDoDia = "Boa Noite.";
    }
    var mensagemResultado = " Fatura Compra Senhas.\n";
    mensagemResultado += "Segue em baixo a fatura da sua compra de senhas na aplicação Refeicoes UM.\n"

    var text = parteDoDia + mensagemResultado;

    var mailOptions = {
        from: 'refeicoesum@gmail.com', // sender address
        to: email, // list of receivers
        subject: 'Fatura de Compra de Senhas - Jasmin', // Subject line
        text: text,
        attachments: [
            {   // encoded string as an attachment
                filename: 'Fatura.pdf',
                content: pdf,
                encoding: 'data:application/octet-stream'
            }
        ]
    };
    const DELAY = 10*1000 // secs * milliseconds
    console.log("entrei");
      setTimeout(function(){
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) 
            console.log('Mail failed!! :(')
          else
            console.log('Mail sent to ' + mailOptions.to)
        })},
        DELAY
    );
}

module.exports = {
    insertClient:insertClient,
    checkUser: checkUser,
    getTypeInvoice: getTypeInvoice,
    getProducts: getProducts,
    acertoStock: acertoStock,
    registarConsumo: registarConsumo,
    getPDFDocument: getPDFDocument,
    sendPDF: sendPDF,
    getToken: getToken
};