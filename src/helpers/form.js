module.exports = {
  rules: {
    corpEmail: [
      v => !!v || 'Campo requerido',
      v => /^\S+$/.test(v) || 'Elimine los espacios',
      v => /.+@+microfilmscenterjaha+\.+com+/.test(v) ||
      /.+@+microfilmscenter+\.+com+/.test(v) ||
      'Ingrese el correo corporativo'
    ],
    passwordRules: [
      v => !!v || 'Campo requerido',
      v => v
        ? v.length === 8 || 'Se requieren 8 caracteres'
        : ''
    ],
    idRules: [
      v => /^\d+$/.test(v) || 'Campo numérico'
    ],
    officeCode: [v => /\d{4}/.test(v) || 'Campo de 4 dígitos'],
    phone: [v => /\d{11}/.test(v) || 'Req. 11 dígitos (0-9)'],
    serviceOrder: [v => /\d{6}/.test(v) || 'Campo de 6 dígitos'],
    emailRule: [v => /.+@.+/.test(v) || 'Formato de e-mail inválido'],
    required: [v => !!v || 'Requerido', v => /\S/.test(v) || 'Requerido'],
    noSpaces: [v => !!v || 'Requerido', v => /^\S+$/.test(v) || 'Elimine los espacios']
  },
  states: [
    'Amazonas', 'Anzoátegui', 'Aragua', 'Apure',
    'Barinas', 'Bolívar', 'Carabobo', 'Cojedes',
    'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico',
    'Lara', 'Mérida', 'Miranda', 'Monagas',
    'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira',
    'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
  ],
  statusOptions: [
    'Cerrado - Operativo',
    'Cerrado - Reemplazado',
    'Cerrado - Desincorporado',
    'Pendiente - Por repuestos',
    'Pendiente - Por visita'
  ],
  maintenanceStatus: ['Por culminar', 'Culminado'],
  replacementOptions: [
    'Desgaste',
    'Fallas eléctricas',
    'Manipulación incorrecta',
    'Indefinida'
  ],
  productLocations: ['TQ', 'RS', 'GO', 'CP', 'BO', 'HA', 'CO'],
  departments: [
    'Almacén',
    'Operaciones',
    'Soporte técnico'
  ],
  roles: [ { text: 'Usuario', value: 2 }, { text: 'Invitado', value: 3 }, { text: 'Administrador', value: 1 } ]
  
}