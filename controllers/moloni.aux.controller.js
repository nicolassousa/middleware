const querystring = require('querystring');
const hubspotController = require('./../controllers/hubspot.controller');
const req = require('request');
const nodemailer = require('nodemailer');

function getDocumentSetID(access_token, callback) {

    let json = querystring.stringify({
        company_id: '180584'
    });

    let options = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: `https://api.moloni.pt/v1/documentSets/getAll/?access_token=${access_token}`,
        body: json
    }
    req.post(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            callback({
                'documentSets': JSON.parse(res.body)
            });
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            });
        }
    })
}

function getProdutos(access_token, callback){
    let json = querystring.stringify({
        company_id: '180584'
    });

    let options = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: `https://api.moloni.pt/v1/products/getAll/?access_token=${access_token}`,
        body: json
    }
    req.post(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            callback({
                'produtos': JSON.parse(res.body)
            });
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            });
        }
    })
}

function getClientByNumber(nif, access_token, callback){
    
    let json = querystring.stringify({
        company_id: '180584',
        number: nif
    });

    let options = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: `https://api.moloni.pt/v1/customers/getByNumber/?access_token=${access_token}`,
        body: json
    }
    req.post(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            callback({
                'client': JSON.parse(res.body)
            });
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            });
        }
    })
}

function getClientByID(customer_id, access_token, callback){
    
    let json = querystring.stringify({
        company_id: '180584',
        customer_id: customer_id
    });

    let options = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: `https://api.moloni.pt/v1/customers/getOne/?access_token=${access_token}`,
        body: json
    }
    req.post(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            callback({
                'client': JSON.parse(res.body)
            });
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            });
        }
    })
}

function insertClient(email, access_token, callback) {

    hubspotController.getClientByEmail(email, (res) => {
        if(res.user){
            const json = querystring.stringify({
                company_id: '180584',
                vat: res.user.nif,
                number: res.user.nif,
                name: res.user.nome,
                language_id: 1,
                address: '',
                zip_code: '',
                city: '',
                country_id: 1,
                email: res.user.email,
                website: '',
                phone: '',
                fax: '',
                contact_name: '',
                contact_email: res.user.email,
                contact_phone: '',
                notes: '',
                salesman_id: 0,
                price_class_id: 0,
                maturity_date_id: 0,
                payment_day: 0,
                discount: 0,
                credit_limit: 0,
                payment_method_id: 0,
                delivery_method_id: 0,
                field_notes: ''
            })
        
            let options = {
                headers: {
                    'Content-Length': json.length,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                url: `https://api.moloni.pt/v1/customers/insert/?access_token=${access_token}`,
                body: json
            }
            req.post(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    callback({
                        'statusCode': res.statusCode,
                        'customer_id': JSON.parse(res.body).customer_id
                    })
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': JSON.parse(res.body)
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

function getPDFLink(document_id, access_token, callback) {

    let json = querystring.stringify({
        company_id: '180584',
        document_id: document_id
    });

    let options = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: `https://api.moloni.pt/v1/documents/getPDFLink/?access_token=${access_token}`,
        body: json
    }
    req.post(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            callback({
                'url': JSON.parse(res.body).url
            });
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            });
        }
    })
}

function sendPDF(email, link) {
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
    var mensagemResultado = " Nota de Encomenda TakeAway.\n";
    mensagemResultado += "Poderá fazer o download da sua nota de encomenda através do seguinte link:\n"
    mensagemResultado += link

    var text = parteDoDia + mensagemResultado;

    var mailOptions = {
        from: 'refeicoesum@gmail.com', // sender address
        to: email, // list of receivers
        subject: 'Nota de Encomenda TakeAway - Moloni', // Subject line
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        };
    });

}

function getToken(callback) {
    let options = {
        url: `https://api.moloni.pt/v1/grant/?grant_type=password&client_id=269519971um&client_secret=4fefed06e8983c3dccdbd1eeb05bd0ac3896df43&username=a89275@alunos.uminho.pt&password=miegsi2021`
    }
    req.get(options, (err, res) => {
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

module.exports = {
    getDocumentSetID: getDocumentSetID,
    getProdutos: getProdutos,
    getClientByNumber: getClientByNumber,
    getClientByID: getClientByID,
    insertClient: insertClient,
    getPDFLink: getPDFLink,
    sendPDF: sendPDF,
    getToken: getToken
}