import moment from 'moment-timezone'

// const clientLogo = 'https://drive.google.com/uc?id=1a6_EtNu1MXFsdCvFQNepcnFtQscOYBph'
const appLink = 'https://testing-mantra.herokuapp.com'
const appLogo = {
  minWhite: "https://drive.google.com/uc?id=12FeTpWAFzoeqoaLYwcNKKYJ92JinrLvY"
}
const styles = {
  card: 'padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.3);',
  logo: 'box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2); margin: 5px; border-radius: 100%; height: 35px; width: 35px;'
}
const friendlyDate = date => moment(date).parseZone('America/Caracas').format('DD/MM/YYYY HH:mm')

const opening = {
  internal: (adressee, subject) => `
    <p>${adressee}</p>
    <p>El presente tiene como finalidad notificarte sobre una nueva <b>${subject}</b> registrada.</p>
    <br>
  `
}

const privacyNotice = `
<p>
  Ante cualquier observación o respuesta en referencia a este correo,
  por favor contacte al departamento de Help Desk de Microfilms Center.
</p>
`

export const htmlBody = {
  request: ({ ...args }) => `
    ${opening.internal(args.adressee, 'solicitud')}
    <div style="${styles.card}">
      <h2 style="display: inline;">${args.pieceName}</h2>
      <small>x${args.quantity}</small>
      <br>
      <small>${args.productName }</small>
      <hr />
      <br>
      <ul>
        <li>
          <span><b>Servicio:</b> ${args.reportCode}</span>
        </li>
        <li>
          <span><b>Técnico:</b> ${args.technician}</span>
        </li>
        <li>
          <span><b>Cliente:</b> ${args.clientName}</span>
        </li>
        <li>
          <span><b>Oficina:</b> ${args.officeName}</span>
        </li>
      </ul>
      <div style="text-align: end;">
        <small style="margin-right: 5px;"><b>Gestionado por:</b> ${args.requestedBy.fullName}</small>
      </div>
    </div>
    ${privacyNotice}
    ${signature}
  `,
  dispatch: ({ ...args }) => {
    const dispatchOffice = !args.dispatch.reference ? '' : `
      <li>
        <span><b>Destino:</b> ${args.dispatch.destiny}</span>
      </li>
    `
    const dispatchDate = `
      <li>
        <span><b>Despacho:</b> ${moment(args.dispatch.date).parseZone('America/Caracas').format('dddd, DD/MM')}</span>
      </li>
    `
    let dispatchContent = ''
    for (const piece of args.content) dispatchContent = dispatchContent + `
      <li><span><b>${piece.reportCode}:</b> ${piece.pieceName}</span></li>
    `
    const closure = `
      <div style="text-align: end;">
        <small style="margin-right: 5px;"><b>Gestionado por:</b> ${args.user}</small>
      </div>
    `
    let html = `
      ${opening.internal(args.adressee, 'reposición de stock')}
      <div style="${styles.card}">
        <h2 style="display: inline;">${args.dispatch.reference | 'Entrega personal'}</h2>
        <small>${args.dispatch.reference ? '#Referencia' : ''}</small>
        <hr />
        <br>
        <ul>
          ${dispatchOffice}
          ${dispatchDate}
          ${dispatchContent}
        </ul>
        ${closure}
        ${signature}
      </div>
    `
    return html
  },
  corrective: ({ ...args }) => `
    ${opening.internal(args.adressee, 'asignación')}
    <div style="${styles.card}">
      <h2 style="display: inline;">${args.reportCode}</h2>
      <br>
      <small>${args.itsSpecial ? 'Especial' : 'Correctivo'}</small>
      <hr />
      <br>
      <ul>
        <li>
          <span><b>Visita:</b> ${moment(args.scheduledDate).parseZone('America/Caracas').format('dddd, DD/MM')}</span>
        </li>
        <li>
          <span><b>Cliente:</b> ${args.clientName}</span>
        </li>
        <li>
          <span><b>Oficina:</b> ${args.officeName}</span>
        </li>
        <li>
          <span><b>Producto:</b> ${args.productName}</span>
        </li>
        <li>
          <span><b>Serial:</b> ${args.serialCode}</span>
        </li>
        <li>
          <span><b>Descripción:</b> ${args.description}</span>
        </li>
        <li>
          <span><b>Vencimiento (S. L. A.):</b> ${args.itsSpecial ? 'No aplica' : friendlyDate(args.expireDate)}</span>
        </li>
      </ul>
      <div style="text-align: end;">
        <small style="margin-right: 5px;"><b>Gestionado por:</b> ${args.assignedBy}</small>
      </div>
    </div>
    ${signature}
  `,
  preventive: ({ ...args }) => `
    ${opening.internal(args.adressee, 'asignación')}
    <div style="${styles.card}">
      <h2 style="display: inline;">Mantenimiento</h2>
      <br>
      <small>Preventivo</small>
      <hr />
      <br>
      <ul>
        <li>
          <span><b>Visita:</b> ${moment(args.scheduledDate).parseZone('America/Caracas').format('dddd, DD/MM')}</span>
        </li>
        <li>
          <span><b>Cliente:</b> ${args.clientName}</span>
        </li>
        <li>
          <span><b>Oficina:</b> ${args.officeName}</span>
        </li>
      </ul>
      <div style="text-align: end;">
        <small style="margin-right: 5px;"><b>Gestionado por:</b> ${args.assignedBy}</small>
      </div>
    </div>
    ${signature}
  `
}

const signature = `
  <br><br>
  <p>🔗 <a href="${appLink}">Accede</a> al sistema para más detalles.</p>
  <p>Cordialmente.</p>
  <br>
  <table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW"
    style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial; min-width: 225px;">
    <tbody>
      <tr>
        <td style="text-align: center;">
          <a href="${appLink}"><img
            src=${appLogo.minWhite} role="presentation" style="border-radius: 100%;" width="80"
            class="sc-cHGsZl bHiaRe" style="max-width: 130px; display: inline-block;"></a>
        </td>
      </tr>
      <tr>
        <td height="10"></td>
      </tr>
      <tr style="text-align: center;">
        <td>
          <h3 color="#444444" class="sc-fBuWsC eeihxG" style="margin: 0px; font-size: 18px;">
            <span>Mantra</span><span>&nbsp;</span><span>App</span>
          </h3>
          <p color="#444444" font-size="medium" class="sc-fMiknA bxZCMx"
            style="margin: 0px;font-size: 14px; line-height: 22px;"><span>Sistema de
              gestión</span></p>
        </td>
      </tr>
      <tr>
        <td>
          <table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW"
            style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial; width: 100%;">
            <tbody>
              <tr>
                <td height="10"></td>
              </tr>
              <tr>
                <td color="#333" direction="horizontal" height="1" class="sc-jhAzac hmXDXQ"
                  style="width: 100%; border-bottom: 1px solid #333; border-left: none; display: block;">
                </td>
              </tr>
              <tr>
                <td height="10"></td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
`