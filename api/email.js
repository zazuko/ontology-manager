const debug = require('debug')('editor:backend')
const Knex = require('knex')
const nodemailer = require('nodemailer')

module.exports = {
  initMailer,
  sendMail,
  adminEmails
}

let smtpTransporter
let smtpSender
let senderAddress = ''

async function initMailer (editorConfig) {
  const { smtpPort, smtpUser, smtpServer, smtpPassword } = editorConfig.smtp

  if (editorConfig.smtp.senderAddress) {
    senderAddress = editorConfig.smtp.senderAddress
  }

  if (smtpPort && smtpServer && smtpUser && smtpPassword) {
    smtpSender = smtpUser
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
  return Promise.resolve(null)
}

async function sendMail ({ recipients, subject, text }) {
  if (!smtpTransporter) {
    return
  }
  const emails = recipients.map((recipient) =>
    smtpTransporter
      .sendMail({
        sender: senderAddress,
        from: senderAddress,
        to: recipient,
        subject,
        text
      })
      .then(() => true)
      .catch((err) => {
        debug(err)
        return false
      }))
  return Promise.all(emails).then(results => results.every(Boolean))
}

async function adminEmails () {
  const client = Knex({
    client: 'pg',
    connection: {}
  })

  const results = await client.raw(`
    SELECT pe.email FROM editor_private_schema.person_account AS pe
    JOIN editor_schema.person AS e ON e.id = pe.person_id
    WHERE e.is_admin = true;
  `)
  const emails = results.rows.map(({ email }) => email)

  return client.destroy().then(() => emails)
}
