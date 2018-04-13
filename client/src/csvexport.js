import { chain } from 'lodash'
import moment from 'moment'

export default list => {
  const headers = ['#', 'Nombre', 'Cargo', 'Fecha de Registro'].join(',')

  const stringified = chain(list)
    .sortBy('timestamp')
    .reduce((acc, entry, index) => {
      const { person: { name, description }, timestamp } = entry
      const row = `${index + 1},${name},${description},${moment(
        timestamp
      ).format()}`

      return `${acc}${row}\n`
    }, '')
    .value()

  console.log(headers, stringified)

  return encodeURI(`data:text/csv;charset=utf-8,${headers}\n${stringified}\r\n`)
}
