import ExcelExport from 'export-xlsx';

export function exportChart(data: any, range: string, isPrice: boolean, currDate: string) {
  let type = '';
  switch (range) {
    case '24h':
      type = 'in about 24 hours';
      break;
    case '7d':
      type = 'in 7 days';
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

export function exportStatisticChart(data: any, type: string, currDate: string) {
  let label = '';
  switch (type) {
    case 'daily-transactions':
      label = 'Aura Daily Transactions Data';
      break;
    case 'unique-addresses':
      label = 'Aura Unique Addresses Data';
      break;
    case 'daily_active_addresses':
      label = 'Active Aura Addresses Data';
      break;
  }

  const SETTINGS_FOR_EXPORT = {
    // Table settings
    fileName: type + '-' + 'statistic-' + currDate,
    workSheets: [
      {
        sheetName: 'Statistic',
        startingRowNumber: 2,
        gapBetweenTwoTables: 2,
        tableSettings: {
          table1: {
            tableTitle: label,
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
