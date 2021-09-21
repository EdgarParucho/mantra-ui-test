import { htmlBody } from './template.js'
import { title, subtitle, bodyItems } from './builder.js'

const html = ({ addressee, data, email, author }) => {
  const bodyProps = {
    addressee: email.to.name || addressee.firstName,
    subject: email.subject,
    title: title(email.subject, data),
    subtitle: subtitle(email.subject, data),
    bodyItems: bodyItems(email.subject, data),
    author
  }
  return htmlBody(bodyProps)
}

export default (context) => {
  return {
    to: context.email.to.email || context.addressee.email,
    cc: context.email.cc.recipients,
    subject: `${context.email.subject} 🔔`,
    html: html(context)
  }
}
