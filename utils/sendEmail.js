const mailjet = require('node-mailjet');
require('dotenv').config();
   
const mj=mailjet.apiConnect(
  "05cc3ba663fe69dc7568589c5b0efd73",
  "4d5cc1614c63b310e79d51aa9d13a2cd"
);

module.exports= (email,url,callback)=>{
    const request = mj.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'narenderkumar2972002@gmail.com',
              Name: 'server handler',
            },
            To: [
              {
                Email: email,
                Name: 'You',
              },
            ],
            Subject: 'Signup',
            TextPart: 'if you like product,then upgrade fastly!',
            HTMLPart:
              `<h1>hello client </h1> 
              <a href=${url} >click here to verify!</a>
              `,
          },
        ],
    })
    request
    .then(result => {
        // console.log("Mail sent Successfully")
        callback(null,result.body)
    })
    .catch(err => {
        // console.log("Error while sending mail")
        callback(err,null)
    })
}
