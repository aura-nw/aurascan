import ExcelExport from 'export-xlsx';

export function exportChart(data: any, range: string, isPrice: boolean, currDate: string) {
  let type = '';
  switch (range) {
    case '60m':
      type = 'in 60 minutes';
      break;
    case '24h':
      type = 'in about 24 hours';
      break;
    case '30d':
      type = 'in 30 days';
      break;
    case '12M':
      type = 'in 12 months';
      break;
  }
  const SETTINGS_FOR_EXPORT = {
    // Table settings
    fileName: (isPrice ? 'Price_' : 'Volume_') + currDate,
    workSheets: [
      {
        sheetName: isPrice ? 'Price' : 'Volume',
        startingRowNumber: 2,
        gapBetweenTwoTables: 2,
        tableSettings: {
          table1: {
            tableTitle: (isPrice ? 'Price' : 'Volume') + ' value ' + type,
            headerDefinition: [
              {
                name: 'Date',
                key: 'date',
              },
              {
                name: 'Value',
                key: 'value',
              },
            ],
          },
        },
      },
    ],
  };
  try {
    const excelExport = new ExcelExport();
    excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
  } catch (e) {
    console.error(e);
  }
}
