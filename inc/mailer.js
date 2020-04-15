const nodemailer = require('nodemailer');
const credentials = require('./emailCredentials.json');

module.exports = {

    sendEmail(subject, text, to, html = ''){

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: credentials.email,
                pass: credentials.password
            }
        });

        const mailOptions = {
            from: 'Enzo Bot <enzobonfx@gmail.com>',
            to,
            subject,
            text,
            html
        };

        return new Promise((resolve, reject)=>{

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    reject(error);
                } else {
                    resolve(info.response);
                }
            });

        });

    }

}