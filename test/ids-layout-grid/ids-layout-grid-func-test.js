/**
 * @jest-environment jsdom
 */
import IdsLayoutGrid from '../../src/ids-layout-grid/ids-layout-grid';
import IdsLayoutColumn from '../../src/ids-layout-grid/ids-layout-column';

describe('IdsLayoutGrid Component', () => {
  let gridElem;

  beforeEach(async () => {
    const grid = new IdsLayoutGrid();
    const column1 = new IdsLayoutColumn();
    const column2 = new IdsLayoutColumn();
    const column3 = new IdsLayoutColumn();

    document.body.appendChild(grid);

    grid.appendChild(column1);
    grid.appendChild(column2);
    grid.appendChild(column3);

    gridElem = document.querySelector('ids-layout-grid');
  });

  afterEach(async () => {
    document.body.innerHTML = '';
  });

  it('renders with no errors', () => {
    const errors = jest.spyOn(global.console, 'error');
    let elem = new IdsLayoutGrid();
    document.body.appendChild(elem);
    elem.remove();

    elem = new IdsLayoutColumn();
    document.body.appendChild(elem);
    elem.remove();
    expect(document.querySelectorAll('ids-layout-grid').length).toEqual(1);
    expect(errors).not.toHaveBeenCalled();
  });

  it('renders correctly', () => {
    expect(gridElem.outerHTML).toMatchSnapshot();
    gridElem.fixed = true;
    expect(gridElem.outerHTML).toMatchSnapshot();
  });

  it('renders fixed setting', () => {
    const elem = new IdsLayoutGrid();
    elem.fixed = true;
    document.body.appendChild(elem);
    expect(elem.fixed).toEqual('true');
    expect(document.querySelectorAll('.ids-fixed').length).toEqual(1);
  });

  it('renders fill setting', () => {
    const col = new IdsLayoutColumn();
    col.fill = true;
    document.body.appendChild(col);
    expect(col.fill).toEqual('true');
    expect(document.querySelectorAll('.ids-background-fill').length).toEqual(1);
  });

  it('renders fixed setting then removes it', () => {
    const elem = new IdsLayoutGrid();
    elem.fixed = true;
    document.body.appendChild(elem);
    elem.fixed = false;
    expect(elem.fixed).toEqual(null);
    expect(document.querySelectorAll('.ids-fixed').length).toEqual(0);
  });

  it('renders fill setting then removes it', () => {
    const col = new IdsLayoutColumn();
    document.body.appendChild(col);
    col.fill = true;
    col.fill = false;
    expect(col.fill).toEqual(null);
    expect(document.querySelectorAll('.ids-background-fill').length).toEqual(0);
  });

  it('renders auto setting', () => {
    const elem = new IdsLayoutGrid();
    elem.auto = true;
    document.body.appendChild(elem);
    expect(elem.auto).toEqual('true');
    expect(document.querySelectorAll('.ids-layout-cols-auto').length).toEqual(1);
  });

  it('renders auto setting then removes it', () => {
    const elem = new IdsLayoutGrid();
    elem.auto = true;
    elem.auto = false;
    document.body.appendChild(elem);
    expect(elem.auto).toEqual(null);
    expect(document.querySelectorAll('.ids-layout-cols-auto').length).toEqual(0);
  });

  it('renders cols setting', () => {
    const elem = new IdsLayoutGrid();
    elem.cols = 16;
    document.body.appendChild(elem);
    expect(elem.cols).toEqual('16');
    expect(document.querySelectorAll('.ids-layout-cols').length).toEqual(1);
  });

  it('renders rows setting', () => {
    const elem = new IdsLayoutGrid();
    elem.rows = 4;
    document.body.appendChild(elem);
    expect(elem.rows).toEqual('4');
    expect(document.querySelectorAll('.ids-layout-rows').length).toEqual(1);
  });

  it('renders col-span setting', () => {
    const col = new IdsLayoutColumn();
    col.colSpan = 4;
    document.body.appendChild(col);
    expect(col.colSpan).toEqual('4');
    expect(document.querySelectorAll('.ids-layout-col-span').length).toEqual(1);
  });

  it('renders col-start setting', () => {
    const col = new IdsLayoutColumn();
    col.colStart = 4;
    document.body.appendChild(col);
    expect(col.colStart).toEqual('4');
    expect(document.querySelectorAll('.ids-layout-col-start').length).toEqual(1);
  });

  it('renders col-end setting', () => {
    const col = new IdsLayoutColumn();
    col.colEnd = 4;
    document.body.appendChild(col);
    expect(col.colEnd).toEqual('4');
    expect(document.querySelectorAll('.ids-layout-col-end').length).toEqual(1);
  });

  it('renders row-span setting', () => {
    const col = new IdsLayoutColumn();
    col.rowSpan = 4;
    document.body.appendChild(col);
    expect(col.rowSpan).toEqual('4');
    expect(document.querySelectorAll('.ids-layout-row-span').length).toEqual(1);
  });

  it('renders row-start setting', () => {
    const col = new IdsLayoutColumn();
    col.rowStart = 4;
    document.body.appendChild(col);
    expect(col.rowStart).toEqual('4');
    expect(document.querySelectorAll('.ids-layout-row-start').length).toEqual(1);
  });

  it('renders row-end setting', () => {
    const col = new IdsLayoutColumn();
    col.rowEnd = 4;
    document.body.appendChild(col);
    expect(col.rowEnd).toEqual('4');
    expect(document.querySelectorAll('.ids-layout-row-end').length).toEqual(1);
  });
});
