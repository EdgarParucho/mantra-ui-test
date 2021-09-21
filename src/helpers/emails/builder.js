import moment from 'moment-timezone'

export const title = (subject, data) => {
  switch (subject) {
    case 'Solicitud de piezas':
      return data.pieceName
    case 'Reposición de piezas':
      return data.dispatch.reference || 'Entrega personal'
    case 'Asignación (correctivo)':
      return data.reportCode
    case 'Asignación (preventivo)':
      return 'Mantenimiento'
    default:
      break;
  }
}

export const subtitle = (subject, data) => {
  switch (subject) {
    case 'Solicitud de piezas':
      return data.productName
    case 'Reposición de piezas':
      return data.dispatch.method === 'Entrega personal' ? '' : '#Referencia'
    case 'Asignación (correctivo)':
      return data.itsSpecial ? 'Especial' : 'Correctivo'
    case 'Asignación (preventivo)':
      return 'Asignación (preventivo)'
    default:
      break;
  }
}

export const bodyItems = (subject, data) => {
  switch (subject) {
    case 'Solicitud de piezas':
      return {
        Cantidad: data.quantity,
        Servicio: data.reportCode,
        Técnico: data.technician.fullName,
        Cliente: data.clientName,
        Oficina: data.officeName
      }
    case 'Reposición de piezas':
      return {
        Destino: data.dispatch.method === 'Entrega personal' ? 'Entrega personal' : data.dispatch.destiny,
        Fecha: moment(data.dispatch.date).parseZone('America/Caracas').format('dddd, DD/MM'),
        ...data.content
      }
    case 'Asignación (correctivo)':
      return {
        Visita: moment(data.schedule.scheduledDate).parseZone('America/Caracas').format('dddd, DD/MM'),
        Cliente: data.clientName,
        Oficina: data.officeName,
        Producto: data.productName,
        Serial: data.serialCode,
        Descripción: data.description,
        Vencimiento: data.itsSpecial ? 'No aplica' : moment(data.expireDate).parseZone('America/Caracas').format('DD/MM/YYYY HH:mm')
      }
    case 'Asignación (preventivo)':
      return {
        Visita: moment(data.schedule.scheduledDate).parseZone('America/Caracas').format('dddd, DD/MM'),
        Cliente: data.clientName,
        Oficina: data.officeName
      }
    default:
      break;
  }
}
