const debug = require('debug')('editor:backend')
const nodemailer = require('nodemailer')

module.exports = {
  initMailer,
  sendMail
}

let smtpTransporter
let senderAddress = ''

async function initMailer (editorConfig) {
  const { smtpPort, smtpUser, smtpServer, smtpPassword } = editorConfig.smtp

  if (editorConfig.smtp.senderAddress) {
    senderAddress = editorConfig.smtp.senderAddress
  }

  if (smtpPort && smtpServer && smtpUser && smtpPassword) {
    smtpTransporter = nodemailer.createTransport({
      host: smtpServer,
      port: parseInt(smtpPort, 10),
      secure: editorConfig.smtp.secure,
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    })

    return new Promise((resolve) => smtpTransporter.verify((error, success) => {
      if (error) {
        debug(error)
        smtpTransporter = null
      }
      else {
        debug('SMTP server configured')
      }
      resolve(smtpTransporter)
    }))
  }
  return Promise.resolve()
}

async function sendMail ({ recipients, subject, text }) {
  return smtpTransporter.sendMail({
    from: senderAddress,
    cc: recipients,
    subject,
    text
  })
}
