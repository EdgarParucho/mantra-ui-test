const appLink = 'https://testing-mantra.herokuapp.com'
const appLogo = "https://drive.google.com/uc?id=12FeTpWAFzoeqoaLYwcNKKYJ92JinrLvY"

const styles = {
  card: 'padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.3);',
  logo: 'box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2); margin: 5px; border-radius: 100%; height: 35px; width: 35px;'
}

const opening = (addressee, subject) => `
  <p>${addressee}</p>
  <p>El presente tiene como finalidad notificarte sobre una nueva <b>${subject}</b> registrada.</p>
  <br>
`

const body = ({ ...args }) => {
  let listItems = ''
  const entries = Object.entries(args.bodyItems)
  for (const item of entries) listItems = listItems + `<li><b>${item[0]}</b>: ${item[1]}</li>`

  return `
    <div style="${styles.card}">
      <h2>${args.title}</h2>
      <small>${args.subtitle}</small>
      <hr />
      <br>
      <ul>
        ${listItems}
      </ul>
      <div style="text-align: end;">
        <small style="margin-right: 5px;"><b>Gestionado por:</b> ${args.author}</small>
      </div>
    </div>
  `
}

const notice = `
  <p>
    Ante cualquier observación o respuesta en referencia a este correo,
    por favor contacte al departamento de Help Desk de Microfilms Center.
  </p>
`

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

export const htmlBody = ({ ...args }) => `
  ${opening(args.addressee, args.subject)}
  ${body(args)}
  ${notice}
  ${signature}
`