import '../ids-data-grid';
import booksJSON from '../../../assets/data/books.json';

// Example for populating the DataGrid
const dataGrid: any = document.querySelector('#data-grid-alignment');
const container: any = document.querySelector('ids-container');

if (dataGrid) {
  (async function init() {
    // Set Locale and wait for it to load
    await container?.setLocale('en-US');

    // Do an ajax request
    const url: any = booksJSON;
    const columns = [];

    // Set up columns
    columns.push({
      id: 'description',
      name: 'Normal/None',
      field: 'description',
      sortable: true,
      formatter: dataGrid.formatters.text
    });
    columns.push({
      id: 'ledger',
      name: 'Centered',
      field: 'ledger',
      formatter: dataGrid.formatters.text,
      sortable: true,
      align: 'center'
    });
    columns.push({
      id: 'ledger2',
      name: 'Centered (Header)',
      field: 'ledger',
      formatter: dataGrid.formatters.text,
      sortable: true,
      headerAlign: 'center'
    });
    columns.push({
      id: 'publishDate',
      name: 'Left',
      field: 'publishDate',
      formatter: dataGrid.formatters.date,
      sortable: true,
      align: 'left'
    });
    columns.push({
      id: 'price',
      name: 'Right',
      field: 'price',
      formatter: dataGrid.formatters.decimal,
      formatOptions: { locale: 'en-US' },
      sortable: true,
      align: 'right'
    });
    columns.push({
      id: 'price2',
      name: 'Right (Header)',
      field: 'price',
      formatter: dataGrid.formatters.decimal,
      formatOptions: { locale: 'en-US' },
      sortable: true,
      headerAlign: 'right'
    });

    dataGrid.columns = columns;
    const setData = async () => {
      const res = await fetch(url);
      const data = await res.json();
      dataGrid.data = data;
    };

    setData();
  }());
}