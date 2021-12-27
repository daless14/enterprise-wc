import IdsListView from '../../src/components/ids-list-view/ids-list-view';
import IdsDraggable from '../../src/components/ids-draggable/ids-draggable';
import './index.scss';

// Example for populating the List View
const listView = document.querySelectorAll('ids-list-view');

// Do an ajax request and apply the data to the list
const url = '/data/events.json';

const setData = async () => {
  const res = await fetch(url);
  const data = await res.json();
  listView.forEach((l) => {
    l.data = data;
  });
};

setData();