import moment from 'moment';

export const GetFriendlyDate = (ts) => {
  const now = moment().utc();
  const d = new Date(ts);
  const published = moment(d).utc();

  const mins = now.diff(published, 'minutes');
  const hours = now.diff(published, 'hours');
  const days = now.diff(published, 'days');

  if (days !== 0) {
    return days + 'd';
  } else if (hours !== 0) {
    return hours + 'h';
  } else if (mins !== 0) {
    return mins + 'mins';
  }
};
